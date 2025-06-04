using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace backend_csharp.Utils
{
    class JsonHandler
    {
        private static readonly JsonSerializerOptions _options = new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true,
            WriteIndented = false,
            DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull
        };

        public static string ToJson<T>(T obj) {
            try
            {
                return JsonSerializer.Serialize(obj, _options);
            } catch (Exception ex) {
                Console.WriteLine($"Serialization arror: {ex.Message}");
                return string.Empty;
            }
        }

        public static T? FromJson<T>(string json) {
            try
            {
                return JsonSerializer.Deserialize<T>(json, _options);
            }
            catch (Exception ex) {
                Console.WriteLine($"Deserialize error: {ex.Message}");
                return default;
            }   
        }
    }
}
