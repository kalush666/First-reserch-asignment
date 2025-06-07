using System;
using System.IO;
using System.Net;
using System.Net.Sockets;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using System.Collections.Generic;
using backend_csharp.Models;
using backend_csharp.Utils;

namespace backend_csharp.Services
{
    public class TcpRequestHandler
    {
        private readonly int _port;
        private readonly TcpListener _listener;
        private readonly CancellationTokenSource _cancellationTokenSource;
        private readonly object _lock = new();
        private readonly LoadPredicator _predictor;

        private record AnalysisRequest(string Type, List<Appointment> Appointments, List<DateTime>? WorkingDays);

        public TcpRequestHandler()
        {
            _port = int.TryParse(Environment.GetEnvironmentVariable("PORT"), out var envPort) ? envPort : 5000;
            _listener = new TcpListener(IPAddress.Any, _port);
            _cancellationTokenSource = new CancellationTokenSource();
            _predictor = new LoadPredicator();
        }

        public void Start()
        {
            _listener.Start();
            Console.WriteLine($"TCP Server listening on port {_port}");

            Task.Run(async () =>
            {
                while (!_cancellationTokenSource.Token.IsCancellationRequested)
                {
                    try
                    {
                        var client = await _listener.AcceptTcpClientAsync();
                        _ = Task.Run(() => HandleClient(client));
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine($"Error accepting client: {ex.Message}");
                    }
                }
            });
        }

        public void Stop()
        {
            _cancellationTokenSource.Cancel();
            _listener.Stop();
        }

        private async Task HandleClient(TcpClient client)
        {
            try
            {
                using var stream = client.GetStream();
                using var reader = new StreamReader(stream, Encoding.UTF8);
                using var writer = new StreamWriter(stream, Encoding.UTF8) { AutoFlush = true };

                char[] buffer = new char[8192];
                int chars = await reader.ReadAsync(buffer, 0, buffer.Length);
                string jsonInput = new string(buffer, 0, chars);

                lock (_lock)
                {
                    Console.WriteLine("Received data");
                }

                var request = JsonHandler.FromJson<AnalysisRequest>(jsonInput);

                if (request == null || request.Appointments == null)
                {
                    await writer.WriteAsync("[]");
                    return;
                }

                List<DateTime> result;

                if (request.Type?.ToLower() == "free" && request.WorkingDays != null)
                {
                    result = await _predictor.ReturnFreeDays(request.Appointments, request.WorkingDays);
                }
                else
                {
                    result = await _predictor.ReturnBusyDays(request.Appointments);
                }

                var responseJson = JsonHandler.ToJson(result);
                await writer.WriteAsync(responseJson);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in client handler: {ex.Message}");
            }
            finally
            {
                client.Close();
            }
        }
    }
}
