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
    public class IngredientControllerTests
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
        public void Ingredients_GetByRecipe()
        {
            // Arrange
            var id = 1058;
            
            // Act
            var requestTask = _httpClient.GetAsync($"api/ingredient/{id}");
            var response = requestTask.Result;

            //Assert
            Assert.AreEqual(HttpStatusCode.OK, response.StatusCode);
            var ingredients = response.DeserializeContent<List<RecipeIngredient>>();
            Assert.IsTrue(ingredients.Count > 0);
        }
    }
}
