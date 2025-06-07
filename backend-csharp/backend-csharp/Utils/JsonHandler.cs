using System;
using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;

namespace backend_csharp.Utils
{
    public static class JsonHandler
    {
        private static readonly JsonSerializerSettings _settings = new JsonSerializerSettings
        {
            ContractResolver = new CamelCasePropertyNamesContractResolver(),
            NullValueHandling = NullValueHandling.Ignore,
            Formatting = Formatting.None
        };

        public static string ToJson<T>(T obj)
        {
            try
            {
                return JsonConvert.SerializeObject(obj, _settings);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Serialization error: {ex.Message}");
                return string.Empty;
            }
        }

        public static T? FromJson<T>(string json)
        {
            try
            {
                return JsonConvert.DeserializeObject<T>(json, _settings);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Deserialize error: {ex.Message}");
                return default;
            }
        }
    }
}
