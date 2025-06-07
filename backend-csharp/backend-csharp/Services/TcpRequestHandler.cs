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

                var buffer = new byte[8192];
                var totalBytes = 0;
                var requestData = new List<byte>();

                while (stream.DataAvailable || totalBytes == 0)
                {
                    var bytesRead = await stream.ReadAsync(buffer, 0, buffer.Length);
                    if (bytesRead == 0) break;

                    for (int i = 0; i < bytesRead; i++)
                    {
                        requestData.Add(buffer[i]);
                    }
                    totalBytes += bytesRead;

                    if (stream.DataAvailable)
                        await Task.Delay(10);
                    else
                        break;
                }

                string jsonInput = Encoding.UTF8.GetString(requestData.ToArray());

                lock (_lock)
                {
                    Console.WriteLine($"Received data: {jsonInput}");
                    Console.WriteLine($"Received bytes: {totalBytes}");
                }

                var request = JsonHandler.FromJson<AnalysisRequest>(jsonInput);

                if (request == null)
                {
                    Console.WriteLine("Failed to deserialize request - request is null");
                    await SendResponse(stream, "[]");
                    return;
                }

                if (request.Appointments == null)
                {
                    Console.WriteLine("Failed to deserialize request - appointments is null");
                    await SendResponse(stream, "[]");
                    return;
                }

                Console.WriteLine($"Processing {request.Appointments.Count} appointments for type: {request.Type}");

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
                Console.WriteLine($"Sending response: {responseJson}");
                await SendResponse(stream, responseJson);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in client handler: {ex.Message}");
                Console.WriteLine($"Stack trace: {ex.StackTrace}");

                try
                {
                    await SendResponse(client.GetStream(), "[]");
                }
                catch
                {
                }
            }
            finally
            {
                try
                {
                    client.Close();
                }
                catch
                {
                }
            }
        }

        private async Task SendResponse(NetworkStream stream, string response)
        {
            try
            {
                var responseBytes = Encoding.UTF8.GetBytes(response);
                await stream.WriteAsync(responseBytes, 0, responseBytes.Length);
                await stream.FlushAsync();

                stream.Close();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error sending response: {ex.Message}");
            }
        }
    }
}