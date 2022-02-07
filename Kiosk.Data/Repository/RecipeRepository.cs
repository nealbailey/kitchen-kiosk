//-----------------------------------------------------------------------
// Source File:  "RecipeRepository.cs"
// Create Date:  02/02/2022 12:33:00 PM
// Last Updated: 02/02/2022 12:33:00 PM
// Authors(s):   Neal Bailey <nealbailey@hotmail.com>
//-----------------------------------------------------------------------
// COMMERCIAL USE RIGHTS - PROHIBITED PUBLIC DISTRIBUTION
// Intellectual Property Rights Holder: FocusIT, inc
// Software Rights Holder: Baileysoft Solutions
//-----------------------------------------------------------------------
// The licensee's rights to use, modify, reproduce, release, perform,
// display, or disclose this technical data/computer software are
// restricted by US patent copyright protections. any reproduction
// of this technical data/computer software or portions thereof marked
// with this legend must also reproduce the all original markings.
//-----------------------------------------------------------------------
// Copyright (c) 2012-2022 Baileysoft Solutions.
//-----------------------------------------------------------------------
namespace Kiosk.Data.Repository
{
    using KioskApi.Data;
    using KioskApi.Domain.Models;
    using Microsoft.EntityFrameworkCore;
    using Microsoft.Extensions.Logging;
    using System.Collections.Generic;
    using System.Linq;
    using System.Threading.Tasks;

    public class RecipeRepository : BaseRepository, IRecipeRepository
    {
        #region Fields
        private IIngredientRepository _ingredientRepository;
        private ICategoryRepository _categoryRepository;
        #endregion

        #region Constructors
        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="connectionstring"></param>
        public RecipeRepository(
            ILogger<IRecipeRepository> logger, 
            IIngredientRepository ingredientRepository,
            ICategoryRepository categoryRepository,
            KIOSKContext dbContext)
        {
            _logger = logger;
            _ingredientRepository = ingredientRepository;
            _categoryRepository = categoryRepository;
            _context = dbContext;
        }
        #endregion

        #region Methods

        /// <summary>
        /// Fetch recipes.
        /// </summary>
        /// <param name="options">Options when fetching recipes.</param>
        /// <param name="includeIngredients">Results should include ingredients</param>
        /// <returns></returns>
        public Task<List<Recipe>> Get(RepositoryOptions options, bool includeIngredients = false)
        {
            var recipes = (from r in _context.Recipes select r);

            if (!string.IsNullOrEmpty(options.SearchString))            
                recipes = recipes.Where(s => s.Title.Contains(options.SearchString));
            
            switch(options.SortOrder)
            {
                case SortOrder.Ascending:
                    recipes = recipes.OrderBy(s => s.Title);
                    break;
                case SortOrder.Descending:
                    recipes = recipes.OrderByDescending(s => s.Title);
                    break;
                case SortOrder.None:
                    break;
            }

            var pagedList = PaginatedList<Recipe>.CreateAsync(recipes.AsNoTracking(), options.PageNumber, options.PageSize);
            var pagedResult = Task.Run(() => pagedList.Result.ToList());

            if (includeIngredients)
            {
                foreach (var r in pagedResult.Result)
                    r.Ingredients = _ingredientRepository.GetByRecipe(r).Result;
            }

            return pagedResult;
        }

        /// <summary>
        /// Fetch a specific category from the database.
        /// </summary>
        /// <param name="category"></param>
        /// <returns></returns>
        public Task<Recipe> GetOne(Recipe recipe)
        {
            var e = _context.Recipes.Where(p => p.RecId.Equals(recipe.RecId)).SingleOrDefaultAsync();
            Recipe dbrecipe = e.Result;
            dbrecipe.Ingredients = _ingredientRepository.GetByRecipe(dbrecipe).Result;
            dbrecipe.PrimaryCategory = _categoryRepository.GetById(dbrecipe.CatId).Result;
            dbrecipe.Categories = _categoryRepository.GetByRecipe(recipe).Result;
            return Task.Run(() => dbrecipe);
        }

        #endregion

        #region Experimental

        //var recipes = (from recipe in _context.Recipes
        //               join category in _context.RecipeCategories1
        //               on recipe.CatId equals category.CatId
        //               where category.Category == "seafood"
        //               select recipe).ToList();
        //var recipes = _context.Recipes;

        //var categoryRepo = new CategoryRepository(_connectionString);
        //foreach (var r in recipes)
        //    r.Categories = await categoryRepo.GetByRecipe(r);
        //foreach (var r in recipes)
        //{
        //    r.PrimaryCategory = new RecipeCategory();
        //    r.PrimaryCategory.CatId = r.CatId;
        //    r.PrimaryCategory.Category = (from category in _context.RecipeCategories
        //                           where category.CatId == r.CatId
        //                           select category.Category).Single();
        //}

        // --Get all recipes(without ingredients)
        //SELECT r.recId, r.useruid, r.[Date], r.Title, r.[Description], r.Instructions, c.catId, c.category
        //FROM recipe r, recipeCategory c
        //WHERE r.recId =
        //    (SELECT recId FROM recipeCategories
        //     WHERE recId = r.recId and catId = c.catId)
        //ORDER BY[Date] DESC;

        #endregion
    }
}
