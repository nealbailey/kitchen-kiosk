using KioskApi.Data;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Security.Cryptography;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;

namespace KioskApi.MobileSync
{
    /// <summary>
    /// Reads mobile recipe text and computes deterministic content revisions.
    /// Performs no photo or file-system work.
    /// </summary>
    public static class MobileSyncCatalog
    {
        /// <summary>
        /// Current contract version. Changing the canonical revision input requires bumping it.
        /// </summary>
        public const int ContractVersion = 1;

        /// <summary>
        /// Largest accepted id list for <c>POST api/mobile/recipes</c>.
        /// </summary>
        public const int MaxRecipesPerRequest = 100;

        /// <summary>
        /// Load recipes (all, or only <paramref name="ids"/>) ordered by id, each with its revision.
        /// </summary>
        public static async Task<List<MobileRecipe>> LoadRecipesAsync(KIOSKContext context, IReadOnlyCollection<int> ids, CancellationToken cancellationToken)
        {
            var recipeQuery = context.Recipes.AsNoTracking();
            var mapQuery = context.RecipeCategoryMaps.AsNoTracking();
            var ingredientQuery = context.RecipeIngredients.AsNoTracking();
            if (ids != null)
            {
                var idArray = ids.ToArray();
                recipeQuery = recipeQuery.Where(r => idArray.Contains(r.RecId));
                mapQuery = mapQuery.Where(m => idArray.Contains(m.RecId));
                ingredientQuery = ingredientQuery.Where(i => idArray.Contains(i.RecId));
            }

            var recipes = await recipeQuery
                .Select(r => new { r.RecId, r.Title, r.Description, r.Instructions, r.Date, r.CatId })
                .ToListAsync(cancellationToken);
            var maps = (await mapQuery.Select(m => new { m.RecId, m.CatId }).ToListAsync(cancellationToken))
                .ToLookup(m => m.RecId, m => m.CatId);
            var ingredients = (await ingredientQuery.Select(i => new { i.RecId, i.Ingredient }).ToListAsync(cancellationToken))
                .ToLookup(i => i.RecId, i => i.Ingredient);

            return recipes
                .OrderBy(r => r.RecId)
                .Select(r =>
                {
                    var recipe = new MobileRecipe
                    {
                        Id = r.RecId,
                        Title = r.Title,
                        Description = r.Description,
                        Instructions = r.Instructions,
                        Date = r.Date.ToString("yyyy-MM-dd'T'HH:mm:ss.FFFFFFF", CultureInfo.InvariantCulture),
                        PrimaryCategoryId = r.CatId,
                        CategoryIds = maps[r.RecId].Distinct().OrderBy(c => c).ToList(),
                        Ingredients = ingredients[r.RecId]
                            .Where(i => i != null)
                            .OrderBy(i => i, StringComparer.OrdinalIgnoreCase)
                            .ThenBy(i => i, StringComparer.Ordinal)
                            .ToList()
                    };
                    recipe.Revision = ComputeRecipeRevision(recipe);
                    return recipe;
                })
                .ToList();
        }

        /// <summary>
        /// Load the full category catalog ordered by id.
        /// </summary>
        public static async Task<List<MobileCategory>> LoadCategoriesAsync(KIOSKContext context, CancellationToken cancellationToken)
        {
            var categories = await context.RecipeCategories.AsNoTracking()
                .Select(c => new MobileCategory { Id = c.CatId, Name = c.Category })
                .ToListAsync(cancellationToken);
            return categories.OrderBy(c => c.Id).ToList();
        }

        /// <summary>
        /// Revision of every reader-visible recipe field and relationship.
        /// </summary>
        public static string ComputeRecipeRevision(MobileRecipe recipe)
        {
            return Hash(writer =>
            {
                writer.WriteStartObject();
                writer.WriteNumber("v", ContractVersion);
                writer.WriteNumber("id", recipe.Id);
                writer.WriteString("title", recipe.Title);
                writer.WriteString("description", recipe.Description);
                writer.WriteString("instructions", recipe.Instructions);
                writer.WriteString("date", recipe.Date);
                writer.WriteNumber("primaryCategoryId", recipe.PrimaryCategoryId);
                writer.WriteStartArray("categoryIds");
                foreach (var id in recipe.CategoryIds)
                    writer.WriteNumberValue(id);
                writer.WriteEndArray();
                writer.WriteStartArray("ingredients");
                foreach (var ingredient in recipe.Ingredients)
                    writer.WriteStringValue(ingredient);
                writer.WriteEndArray();
                writer.WriteEndObject();
            });
        }

        /// <summary>
        /// Revision of the complete manifest: every recipe id/revision and the category catalog.
        /// Inputs must be ordered by id.
        /// </summary>
        public static string ComputeCollectionRevision(IEnumerable<MobileManifestEntry> recipes, IEnumerable<MobileCategory> categories)
        {
            return Hash(writer =>
            {
                writer.WriteStartObject();
                writer.WriteNumber("v", ContractVersion);
                writer.WriteStartArray("categories");
                foreach (var category in categories)
                {
                    writer.WriteStartArray();
                    writer.WriteNumberValue(category.Id);
                    writer.WriteStringValue(category.Name);
                    writer.WriteEndArray();
                }
                writer.WriteEndArray();
                writer.WriteStartArray("recipes");
                foreach (var recipe in recipes)
                {
                    writer.WriteStartArray();
                    writer.WriteNumberValue(recipe.Id);
                    writer.WriteStringValue(recipe.Revision);
                    writer.WriteEndArray();
                }
                writer.WriteEndArray();
                writer.WriteEndObject();
            });
        }

        private static string Hash(Action<Utf8JsonWriter> write)
        {
            using var stream = new MemoryStream();
            using (var writer = new Utf8JsonWriter(stream))
                write(writer);
            return "sha256-" + Convert.ToHexStringLower(SHA256.HashData(stream.ToArray()));
        }
    }
}
