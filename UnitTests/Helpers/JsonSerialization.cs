using Newtonsoft.Json;
using System.IO;

namespace UnitTests.Helpers
{
    public class JsonSerialization
    {
        private JsonSerializer serializer = JsonSerializer.CreateDefault();

        public string ToJson<T>(T obj)
        {
            string json = null;

            if (obj != null)
            {
                using (var sw = new StringWriter())
                using (var jtw = new JsonTextWriter(sw))
                {
                    serializer.Serialize(jtw, obj);
                    json = sw.ToString();
                }
            }
            return json;
        }
    }
}
