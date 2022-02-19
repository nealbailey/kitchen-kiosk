using Newtonsoft.Json;
using System.IO;
using System.Net.Http;

namespace Kiosk.Api.Extensions 
{
    /// <summary>
    /// Custom logic for Http Responses
    /// </summary>
    public static class HttpResponseMessageExtensions
    {
        /// <summary>
        /// Deserializes the Http request body.
        /// </summary>
        /// <typeparam name="T">The type to populate into.</typeparam>
        /// <param name="message">The response to populate from.</param>
        /// <returns>The requested return type.</returns>
        public static T DeserializeContent<T>(this HttpResponseMessage message)
        {
            T responseObject = default(T);
            if (message != null)
            {
                var responseJson = message.Content.ReadAsStringAsync().Result;
                responseObject = JsonSerializer.CreateDefault().Deserialize<T>(
                    new JsonTextReader(new StringReader(responseJson)));
            }

            return responseObject;
        }
    }
}
