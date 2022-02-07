using KioskApi.Domain.Models;
using Microsoft.AspNetCore;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.TestHost;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using System.Collections.Generic;
using System.Net;
using System.Net.Http;
using UnitTests.Extensions;

namespace UnitTests.Api
{
    [TestClass]
    public class RecipeControllerTests
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
        public void Recipes_Search()
        {
            // Arrange
            var searchstring = "chicken";

            // Act
            var requestTask = _httpClient.GetAsync($"api/recipe/GetRecipes?searchstring={searchstring}");
            var response = requestTask.Result;

            //Assert
            Assert.AreEqual(HttpStatusCode.OK, response.StatusCode);
            var recipes = response.DeserializeContent<List<Recipe>>();
            Assert.IsTrue(recipes.Count > 0);
        }
    }
}
