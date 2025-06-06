using System;
using System.Threading;
using backend_csharp.Services;
using System.Threading.Tasks;


namespace backend_csharp
{
    class Program
    {
        static async Task Main(string[] args)
        {
            var tcpServer = new TcpRequestHandler();
            var cts = new CancellationTokenSource();

            Console.CancelKeyPress += (sender, e) =>
            {
                Console.WriteLine("stopping server");
                e.Cancel = true;
                cts.Cancel();
            };

            tcpServer.Start();

            try
            {
                while (!cts.Token.IsCancellationRequested)
                {
                    await Task.Delay(1000, cts.Token);
                }
            }
            catch (TaskCanceledException) { }

            tcpServer.Stop();
            Console.WriteLine("server stopped");
        }
    }
}
