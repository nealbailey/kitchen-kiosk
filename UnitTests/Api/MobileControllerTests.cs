using Kiosk.Data.Repository;
using KioskApi.Data;
using KioskApi.MobileSync;
using Microsoft.AspNetCore;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.TestHost;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using UnitTests.Extensions;

namespace UnitTests.Api
{
    [TestClass]
    public class MobileControllerTests
    {
        private const string TestKey = "TEST_ONLY_MOBILE_SYNC_KEY_0123456789abcdef";
        private const string KeyHeader = "X-Kiosk-Mobile-Key";

        private static TestServer _testServer;
        private static HttpClient _httpClient;

        #region Test Scaffolding

        [ClassInitialize]
        public static void InitializeClass(TestContext context)
        {
            _testServer = CreateServer(new Dictionary<string, string>
            {
                ["MobileSync:Enabled"] = "true",
                ["MobileSync:ApiKey"] = TestKey,
                ["MobileSync:StatusRequestsPerMinute"] = "10000",
                ["MobileSync:DataRequestsPerMinute"] = "10000"
            });
            _httpClient = _testServer.CreateClient();
        }

        [ClassCleanup]
        public static void CleanUpTest()
        {
            _httpClient.Dispose();
            _testServer.Dispose();
        }

        private static TestServer CreateServer(Dictionary<string, string> settings) =>
            new TestServer(WebHost.CreateDefaultBuilder()
                .ConfigureAppConfiguration((_, config) => config.AddInMemoryCollection(settings))
                .UseStartup<TestServerStartup>()
                .UseEnvironment("Development"));

        private static HttpRequestMessage Request(HttpMethod method, string url, string key = TestKey, object body = null)
        {
            var request = new HttpRequestMessage(method, url);
            if (key != null)
                request.Headers.Add(KeyHeader, key);
            if (body != null)
                request.Content = new StringContent(JsonConvert.SerializeObject(body), Encoding.UTF8, "application/json");
            return request;
        }

        private static HttpResponseMessage Send(HttpRequestMessage request, HttpClient client = null) =>
            (client ?? _httpClient).SendAsync(request).Result;

        private static MobileSyncStatus GetStatus()
        {
            var response = Send(Request(HttpMethod.Get, "api/mobile/status"));
            Assert.AreEqual(HttpStatusCode.OK, response.StatusCode);
            return response.DeserializeContent<MobileSyncStatus>();
        }

        private static MobileSyncManifest GetManifest()
        {
            var response = Send(Request(HttpMethod.Get, "api/mobile/manifest"));
            Assert.AreEqual(HttpStatusCode.OK, response.StatusCode);
            return response.DeserializeContent<MobileSyncManifest>();
        }

        private static MobileRecipeBodiesResponse GetBodies(params int[] ids)
        {
            var response = Send(Request(HttpMethod.Post, "api/mobile/recipes", body: new { ids }));
            Assert.AreEqual(HttpStatusCode.OK, response.StatusCode);
            return response.DeserializeContent<MobileRecipeBodiesResponse>();
        }

        private static int InsertSyntheticRecipe(string title = null)
        {
            var recipe = new
            {
                useruid = "abc4bbf1-5bb4-43df-8c1b-ca5b1c85883d",
                title = title ?? $"Mobile sync synthetic recipe {Guid.NewGuid():N}",
                description = "Synthetic test text",
                instructions = "Step one\nStep two",
                ingredients = new[]
                {
                    new { ingredient = "salt", recId = 0 },
                    new { ingredient = "Butter", recId = 0 },
                    new { ingredient = "apple", recId = 0 }
                },
                primaryCategory = new { catId = 1 }
            };
            var response = _httpClient.PostAsync("api/recipe",
                new StringContent(JsonConvert.SerializeObject(recipe), Encoding.UTF8, "application/json")).Result;
            Assert.AreEqual(HttpStatusCode.OK, response.StatusCode);
            return response.DeserializeContent<KioskApi.Domain.Models.Recipe>().RecId;
        }

        private static void DeleteRecipe(int id) =>
            Assert.AreEqual(HttpStatusCode.OK, _httpClient.DeleteAsync($"api/recipe/{id}").Result.StatusCode);

        private static void AssertError(HttpResponseMessage response, HttpStatusCode status, string code)
        {
            Assert.AreEqual(status, response.StatusCode);
            Assert.AreEqual(code, response.DeserializeContent<MobileSyncError>().Code);
        }

        #endregion

        [TestMethod]
        public void Mobile_RejectsMissingOrWrongKey()
        {
            foreach (var key in new[] { null, "", "wrong-key", TestKey + "x" })
            {
                AssertError(Send(Request(HttpMethod.Get, "api/mobile/status", key)), HttpStatusCode.Unauthorized, "invalid_key");
                AssertError(Send(Request(HttpMethod.Get, "api/mobile/manifest", key)), HttpStatusCode.Unauthorized, "invalid_key");
                AssertError(Send(Request(HttpMethod.Post, "api/mobile/recipes", key, new { ids = new[] { 1 } })), HttpStatusCode.Unauthorized, "invalid_key");
            }
        }

        [TestMethod]
        public void Mobile_DisabledOrMisconfiguredServerFailsClosed()
        {
            using (var disabled = CreateServer(new Dictionary<string, string> { ["MobileSync:Enabled"] = "false", ["MobileSync:ApiKey"] = TestKey }))
            using (var client = disabled.CreateClient())
                AssertError(Send(Request(HttpMethod.Get, "api/mobile/status"), client), HttpStatusCode.ServiceUnavailable, "sync_disabled");

            using (var shortKey = CreateServer(new Dictionary<string, string> { ["MobileSync:Enabled"] = "true", ["MobileSync:ApiKey"] = "too-short" }))
            using (var client = shortKey.CreateClient())
                AssertError(Send(Request(HttpMethod.Get, "api/mobile/status", "too-short"), client), HttpStatusCode.ServiceUnavailable, "sync_not_configured");
        }

        [TestMethod]
        public void Mobile_RateLimitReturns429()
        {
            using var server = CreateServer(new Dictionary<string, string>
            {
                ["MobileSync:Enabled"] = "true",
                ["MobileSync:ApiKey"] = TestKey,
                ["MobileSync:StatusRequestsPerMinute"] = "2"
            });
            using var client = server.CreateClient();

            Assert.AreEqual(HttpStatusCode.OK, Send(Request(HttpMethod.Get, "api/mobile/status"), client).StatusCode);
            Assert.AreEqual(HttpStatusCode.OK, Send(Request(HttpMethod.Get, "api/mobile/status"), client).StatusCode);
            var limited = Send(Request(HttpMethod.Get, "api/mobile/status"), client);
            AssertError(limited, HttpStatusCode.TooManyRequests, "rate_limited");
            Assert.IsTrue(limited.Headers.Contains("Retry-After"));
        }

        [TestMethod]
        public void Mobile_StatusIsCachedAndMatchesManifest()
        {
            var cache = _testServer.Services.GetRequiredService<MobileSyncRevisionCache>();
            var first = GetStatus();
            var builds = cache.BuildCount;

            for (var i = 0; i < 5; i++)
                Assert.AreEqual(first.CollectionRevision, GetStatus().CollectionRevision);
            Assert.AreEqual(builds, cache.BuildCount, "Unchanged status checks must not rebuild the manifest.");

            var manifest = GetManifest();
            Assert.AreEqual(MobileSyncCatalog.ContractVersion, first.ContractVersion);
            Assert.IsTrue(first.SyncEnabled);
            Assert.AreEqual(MobileSyncCatalog.MaxRecipesPerRequest, first.MaxRecipesPerRequest);
            Assert.AreEqual(first.CollectionRevision, manifest.CollectionRevision);
            Assert.AreEqual(first.RecipeCount, manifest.Recipes.Count);
            Assert.AreEqual(first.CategoryCount, manifest.Categories.Count);
            StringAssert.StartsWith(manifest.CollectionRevision, "sha256-");
        }

        [TestMethod]
        public void Mobile_ManifestIsCompleteAndOrdered()
        {
            var manifest = GetManifest();

            using var scope = _testServer.Services.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<KIOSKContext>();
            CollectionAssert.AreEqual(context.Recipes.Select(r => r.RecId).OrderBy(id => id).ToList(), manifest.Recipes.Select(r => r.Id).ToList());
            CollectionAssert.AreEqual(context.RecipeCategories.Select(c => c.CatId).OrderBy(id => id).ToList(), manifest.Categories.Select(c => c.Id).ToList());
            Assert.IsTrue(manifest.Recipes.All(r => r.Revision.StartsWith("sha256-")));
            Assert.AreEqual("Appetizer", manifest.Categories.Single(c => c.Id == 1).Name);
        }

        [TestMethod]
        public void Mobile_BodiesMatchManifestAndExcludePrivateData()
        {
            var title = $"Mobile sync synthetic recipe {Guid.NewGuid():N}";
            var id = InsertSyntheticRecipe(title);
            try
            {
                var entry = GetManifest().Recipes.Single(r => r.Id == id);
                var response = Send(Request(HttpMethod.Post, "api/mobile/recipes", body: new { ids = new[] { 999999, id } }));
                Assert.AreEqual(HttpStatusCode.OK, response.StatusCode);
                var json = response.Content.ReadAsStringAsync().Result;
                var bodies = JsonConvert.DeserializeObject<MobileRecipeBodiesResponse>(json);

                var recipe = bodies.Recipes.Single();
                Assert.AreEqual(id, recipe.Id);
                Assert.AreEqual(entry.Revision, recipe.Revision);
                Assert.AreEqual(title, recipe.Title);
                Assert.AreEqual(1, recipe.PrimaryCategoryId);
                CollectionAssert.AreEqual(new[] { "apple", "Butter", "salt" }, recipe.Ingredients.ToArray());
                CollectionAssert.AreEqual(new[] { 999999 }, bodies.MissingIds.ToArray());

                foreach (var forbidden in new[] { "useruid", "owner", "email", "photo", "favorite" })
                    Assert.IsFalse(json.Contains(forbidden, StringComparison.OrdinalIgnoreCase), $"Response must not contain '{forbidden}'.");
            }
            finally
            {
                DeleteRecipe(id);
            }
        }

        [TestMethod]
        public void Mobile_InvalidBodyRequestsAreRejected()
        {
            var tooMany = Enumerable.Range(1, MobileSyncCatalog.MaxRecipesPerRequest + 1).ToArray();
            foreach (var body in new object[] { new { ids = Array.Empty<int>() }, new { ids = tooMany }, new { ids = new[] { 5, 5 } }, new { ids = new[] { 0 } }, new { ids = new[] { -1 } }, new { other = 1 } })
                AssertError(Send(Request(HttpMethod.Post, "api/mobile/recipes", body: body)), HttpStatusCode.BadRequest, "invalid_request");

            var malformed = Request(HttpMethod.Post, "api/mobile/recipes");
            malformed.Content = new StringContent("{not json", Encoding.UTF8, "application/json");
            AssertError(Send(malformed), HttpStatusCode.BadRequest, "invalid_request");
        }

        [TestMethod]
        public void Mobile_RecipeWritesChangeCollectionRevision()
        {
            var before = GetStatus().CollectionRevision;

            var id = InsertSyntheticRecipe();
            var afterInsert = GetStatus();
            Assert.AreNotEqual(before, afterInsert.CollectionRevision);
            Assert.IsTrue(GetManifest().Recipes.Any(r => r.Id == id));

            DeleteRecipe(id);
            var afterDelete = GetStatus();
            Assert.AreNotEqual(afterInsert.CollectionRevision, afterDelete.CollectionRevision);
            Assert.IsFalse(GetManifest().Recipes.Any(r => r.Id == id));
            Assert.AreEqual(before, afterDelete.CollectionRevision, "Revisions are content-derived, so removing the addition restores the prior revision.");
            CollectionAssert.AreEqual(new[] { id }, GetBodies(id).MissingIds.ToArray());
        }

        [TestMethod]
        public void Mobile_CategoryWritesChangeCollectionRevision()
        {
            var before = GetStatus().CollectionRevision;
            var category = new { category = "Mobile Sync Test Category" };

            var add = _httpClient.PostAsync("api/category/AddCategory",
                new StringContent(JsonConvert.SerializeObject(category), Encoding.UTF8, "application/json")).Result;
            Assert.AreEqual(HttpStatusCode.OK, add.StatusCode);
            var afterAdd = GetStatus().CollectionRevision;
            Assert.AreNotEqual(before, afterAdd);
            Assert.IsTrue(GetManifest().Categories.Any(c => c.Name == category.category));

            var delete = _httpClient.PostAsync("api/category/DeleteCategory",
                new StringContent(JsonConvert.SerializeObject(category), Encoding.UTF8, "application/json")).Result;
            Assert.AreEqual(HttpStatusCode.OK, delete.StatusCode);
            Assert.AreEqual(before, GetStatus().CollectionRevision);
        }

        [TestMethod]
        public void Mobile_ConcurrentChecksCoalesceIntoOneRebuild()
        {
            var cache = _testServer.Services.GetRequiredService<MobileSyncRevisionCache>();
            GetStatus();
            cache.BeginWrite();
            cache.EndWrite();
            var builds = cache.BuildCount;

            var revisions = Task.WhenAll(Enumerable.Range(0, 12).Select(_ =>
                Task.Run(() => GetStatus().CollectionRevision))).Result;

            Assert.AreEqual(builds + 1, cache.BuildCount);
            Assert.AreEqual(1, revisions.Distinct().Count());
        }

        [TestMethod]
        public void Mobile_InProgressWriteReportsPendingInsteadOfCurrent()
        {
            var cache = _testServer.Services.GetRequiredService<MobileSyncRevisionCache>();
            GetStatus();
            cache.BeginWrite();
            try
            {
                var response = Send(Request(HttpMethod.Get, "api/mobile/status"));
                AssertError(response, HttpStatusCode.ServiceUnavailable, "revision_pending");
                Assert.IsTrue(response.Headers.Contains("Retry-After"));
                AssertError(Send(Request(HttpMethod.Get, "api/mobile/manifest")), HttpStatusCode.ServiceUnavailable, "revision_pending");
            }
            finally
            {
                cache.EndWrite();
            }
            GetStatus();
        }

        [TestMethod]
        public void Mobile_RevisionCoversIngredientsAndCategories()
        {
            MobileRecipe Recipe(string[] ingredients, int[] categories) => new MobileRecipe
            {
                Id = 1, Title = "t", Description = null, Instructions = "i", Date = "2024-01-01T00:00:00",
                PrimaryCategoryId = 1, CategoryIds = categories, Ingredients = ingredients
            };

            var baseline = MobileSyncCatalog.ComputeRecipeRevision(Recipe(new[] { "a" }, new[] { 1 }));
            Assert.AreEqual(baseline, MobileSyncCatalog.ComputeRecipeRevision(Recipe(new[] { "a" }, new[] { 1 })));
            Assert.AreNotEqual(baseline, MobileSyncCatalog.ComputeRecipeRevision(Recipe(new[] { "b" }, new[] { 1 })));
            Assert.AreNotEqual(baseline, MobileSyncCatalog.ComputeRecipeRevision(Recipe(new[] { "a" }, new[] { 1, 2 })));

            var withEmptyDescription = Recipe(new[] { "a" }, new[] { 1 });
            withEmptyDescription.Description = "";
            Assert.AreNotEqual(baseline, MobileSyncCatalog.ComputeRecipeRevision(withEmptyDescription));
        }

        [TestMethod]
        public void Mobile_HasNoPhotoDependency()
        {
            Assert.IsNull(_testServer.Services.GetService<IPhotosRepository>(), "The test host must not register photo access.");
            var parameters = typeof(KioskApi.Controllers.MobileController).GetConstructors().SelectMany(c => c.GetParameters());
            Assert.IsFalse(parameters.Any(p => p.ParameterType == typeof(IPhotosRepository)));

            GetStatus();
            GetManifest();
        }
    }
}
