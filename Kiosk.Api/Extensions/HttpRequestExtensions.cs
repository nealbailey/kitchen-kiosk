//-----------------------------------------------------------------------
// Source File:  "HttpRequestExtensions.cs"
// Create Date:  09/01/2020 01:11:00 PM
// Last Updated: 02/11/2022 03:06:00 PM
// Authors(s):   Neal Bailey <nealbailey@hotmail.com>
//-----------------------------------------------------------------------
// COMMERCIAL USE RIGHTS - PROHIBITED PUBLIC DISTRIBUTION
// Intellectual Property Rights Holder: Neal Bailey
// Software Rights Holder: Neal Bailey
//-----------------------------------------------------------------------
// The licensee's rights to use, modify, reproduce, release, perform,
// display, or disclose this technical data/computer software are
// restricted by US patent copyright protections. any reproduction
// of this technical data/computer software or portions thereof marked
// with this legend must also reproduce the all original markings.
//-----------------------------------------------------------------------
// Copyright (c) 2015-2020 FocusIT, Inc.
//-----------------------------------------------------------------------
namespace Kiosk.Api.Extensions
{
    using Microsoft.AspNetCore.Http;
    using System.IO;
    using System.Text;
    using Newtonsoft.Json;
    using System.Threading.Tasks;

    /// <summary>
    /// Custom logic for HttpRequests
    /// </summary>
    public static class HttpRequestExtensions
    {
        /// <summary>
        /// Retrieve the raw body as a string from the Request.Body stream.
        /// </summary>
        /// <param name="request">Request instance to apply to.</param>
        /// <param name="encoding">Optional: Encoding, defaults to UTF8.</param>
        /// <returns><see cref="Task"/> that contains the response stream.</returns>
        /// <exception cref="System.ArgumentOutOfRangeException">The exception that is thrown when the value of an argument is outside the allowable range of values as defined by the invoked method.</exception>
        /// <exception cref="System.InvalidOperationException">The exception that is thrown when a method call is invalid for the object's current state.</exception>
        /// <exception cref="System.ObjectDisposedException">The exception that is thrown when an operation is performed on a disposed object.</exception>
        /// <exception cref="System.ArgumentException">The exception that is thrown when one of the arguments provided to a method is not valid.</exception>
        /// <exception cref="System.ArgumentNullException">The exception that is thrown when a null reference (Nothing in Visual Basic) is passed to a method that does not accept it as a valid argument.</exception>
        public static async Task<string> GetRawBodyStringAsync(this HttpRequest request, Encoding encoding = null)
        {
            if (encoding == null)
                encoding = Encoding.UTF8;

            using var reader = new StreamReader(request.Body, encoding);
            return await reader.ReadToEndAsync();
        }

        /// <summary>
        /// Deserializes the Http request body.
        /// </summary>
        /// <typeparam name="T">The type to populate into.</typeparam>
        /// <param name="request">The request.</param>
        /// <param name="encoding">The encoding.</param>
        /// <returns>The requested return type.</returns>
        public static T DeserializeRequestBody<T>(this HttpRequest request, Encoding encoding = null)
        {
            T requestObject = default(T);
            if (request != null)
            {
                var strRequest = GetRawBodyStringAsync(request, encoding).Result;
                requestObject = JsonSerializer.CreateDefault().Deserialize<T>(
                    new JsonTextReader(new StringReader(strRequest)));
            }

            return requestObject;
        }
    }
}
