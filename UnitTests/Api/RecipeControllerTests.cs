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
        public void Recipes_ByCategory()
        {
            var categoryId = 1;
            var requestTask = _httpClient.GetAsync($"api/recipes?categoryId={categoryId}");
            var response = requestTask.Result;
            Assert.AreEqual(HttpStatusCode.OK, response.StatusCode);
            var recipes = response.DeserializeContent<List<Recipe>>();
            Assert.IsTrue(recipes.Count > 0);
        }

        [TestMethod]
        public void Recipes_ByUser()
        {
            var userUid = "abc4bbf1-5bb4-43df-8c1b-ca5b1c85883d";
            var requestTask = _httpClient.GetAsync($"api/recipes?userId={userUid}");
            var response = requestTask.Result;
            Assert.AreEqual(HttpStatusCode.OK, response.StatusCode);
            var recipes = response.DeserializeContent<List<Recipe>>();
            Assert.IsTrue(recipes.Count > 0);
        }

        [TestMethod]
        public void Recipes_Search()
        {
            // Arrange
            var searchstring = "chicken";

            // Act
            var requestTask = _httpClient.GetAsync($"api/recipes?searchstring={searchstring}");
            var response = requestTask.Result;

            //Assert
            Assert.AreEqual(HttpStatusCode.OK, response.StatusCode);
            var recipes = response.DeserializeContent<List<Recipe>>();
            Assert.IsTrue(recipes.Count > 0);

            foreach (var recipe in recipes)
                Assert.IsTrue(recipe.Title.Contains("chicken", System.StringComparison.OrdinalIgnoreCase));
        }

        [TestMethod]
        public void Recipes_Sorting()
        {
            var sortfield = "date";
            var sortOrder = "desc";
            var requestTask = _httpClient.GetAsync($"api/recipes?sortcolumn={sortfield}&sortorder={sortOrder}");
            var response = requestTask.Result;
            Assert.AreEqual(HttpStatusCode.OK, response.StatusCode);
            var recipes = response.DeserializeContent<List<Recipe>>();
            Assert.IsTrue(recipes.Count > 0);
            var recipe = recipes[0];

            sortfield = "date";
            sortOrder = "asc";
            requestTask = _httpClient.GetAsync($"api/recipes?sortcolumn={sortfield}&sortorder={sortOrder}");
            response = requestTask.Result;
            Assert.AreEqual(HttpStatusCode.OK, response.StatusCode);
            recipes = response.DeserializeContent<List<Recipe>>();
            Assert.IsTrue(recipes.Count > 0);
            Assert.AreNotEqual(recipe.Title, recipes[0].Title);
        }

        [TestMethod]
        public void Recipes_GetOne()
        {
            //
            // Test #1: Fully expanded Recipe object
            //
            var id = 1058;
            var requestTask = _httpClient.GetAsync($"api/recipe/{id}?expand=true");
            var response = requestTask.Result;

            Assert.AreEqual(HttpStatusCode.OK, response.StatusCode);
            var recipe = response.DeserializeContent<Recipe>();
            Assert.IsNotNull(recipe);
            Assert.IsNotNull(recipe.PrimaryCategory);
            Assert.IsTrue(recipe.Categories.Count > 0);
            Assert.IsTrue(recipe.Ingredients.Count > 0);
            Assert.AreEqual("abc4bbf1-5bb4-43df-8c1b-ca5b1c85883d", recipe.Owner.Id);
            Assert.AreEqual("nealbailey", recipe.Owner.UserName);

            //
            // Test #2: Shallow Recipe object
            //
            requestTask = _httpClient.GetAsync($"api/recipe/{id}");
            response = requestTask.Result;
            Assert.AreEqual(HttpStatusCode.OK, response.StatusCode);
            recipe = response.DeserializeContent<Recipe>();
            Assert.IsNotNull(recipe);
            Assert.IsNull(recipe.PrimaryCategory);
            Assert.IsNull(recipe.Owner);
            Assert.IsNull(recipe.Categories);
            Assert.IsNull(recipe.Ingredients);
        }
    }
}
