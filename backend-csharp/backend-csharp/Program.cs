using System;
using System.Collections.Generic;
using System.Linq;

namespace backend_csharp
{
    class Program
    {
        static void Main(string[] args)
        {
            var numbers = new List<int> { 1, 2, 3, 4, 5 };

            var query = from n in numbers
                        where n % 2 == 0
                        select n;

            foreach (var val in query) {
                Console.WriteLine(val);
            }
        }
    }
}
