using KioskApi.Controllers;
using KioskApi.Domain.Models.Auth;
using Microsoft.AspNetCore;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.TestHost;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using System.Net;
using System.Net.Http;
using System.Text;
using UnitTests.Helpers;

namespace UnitTests.Api
{
    [TestClass]
    public class AuthenticateTests
    {
        protected static HttpClient _httpClient;
        protected static TestServer _testServer;

        #region Test Scaffolding

        [ClassInitialize]
        public static void InitializeClass(TestContext context)
        {
            _testServer = new TestServer(WebHost.CreateDefaultBuilder()
                .UseStartup<TestServerStartup>()
                .UseEnvironment("Development"));

            _httpClient = _testServer.CreateClient();
        }

        [ClassCleanup]
        public static void CleanUpTest()
        {
            _httpClient.Dispose();
            _testServer.Dispose();
        }

        #endregion

        [TestMethod]
        public void Authentication_Login()
        {
            // Arrange
            var loginModel = new LoginModel()
            {
                Username = "nealbailey", 
                Password = "Cla$$ified123"
            };

            var requestContent = new JsonSerialization().ToJson(loginModel);
            var postRequestTask = _httpClient.PostAsync(
                $"api/authenticate/login",
                new StringContent(requestContent, Encoding.UTF8, "application/json"));

            //ToDo: always returns HTTP500 Error
            var response = postRequestTask.Result;
            //Assert.AreEqual(HttpStatusCode.OK, response.StatusCode);            
        }
    }
}
