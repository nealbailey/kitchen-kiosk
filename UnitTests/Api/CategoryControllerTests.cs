using KioskApi.Domain.Models;
using Microsoft.AspNetCore;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.TestHost;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using System.Net;
using System.Net.Http;
using System.Text;
using UnitTests.Extensions;
using UnitTests.Helpers;

namespace UnitTests.Api
{
    [TestClass]
    public class CategoryControllerTests
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
        public void GetCategory_Valid_Id()
        {
            // Arrange
            var id = 1;

            // Act
            var requestTask = _httpClient.GetAsync($"api/category/{id}");
            var response = requestTask.Result;

            //Assert
            Assert.AreEqual(HttpStatusCode.OK, response.StatusCode);
            var recipe = response.DeserializeContent<RecipeCategory>();
            Assert.AreEqual(recipe.CatId, 1);
            Assert.AreEqual(recipe.Category, "Appetizer");
        }

        [TestMethod]
        public void CreateCategory()
        {
            // Arrange
            var category = new RecipeCategory() { Category = "Testing" };
            var requestContent = new JsonSerialization().ToJson(category);

            // Act
            var postRequestTask = _httpClient.PostAsync(
                $"api/category",
                    new StringContent(requestContent, Encoding.UTF8, "application/json"));

            var response = postRequestTask.Result;

            // Assert
            Assert.AreEqual(HttpStatusCode.OK, response.StatusCode);
            var c = response.DeserializeContent<RecipeCategory>();
            Assert.IsTrue(c.CatId > 0);
            Assert.AreEqual("Testing", c.Category);
        }
    }
}
