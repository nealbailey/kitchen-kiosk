//-----------------------------------------------------------------------
// Source File:  "RecipeRepository.cs"
// Create Date:  02/02/2022 12:33:00 PM
// Last Updated: 02/08/2022 06:08:00 AM
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
        private IAspNetUserRepository _userRepository;
        #endregion

        #region Constructors
        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="logger"></param>
        /// <param name="ingredientRepository"></param>
        /// <param name="categoryRepository"></param>
        /// <param name="userRepository"></param>
        /// <param name="dbContext"></param>        
        public RecipeRepository(
            ILogger<IRecipeRepository> logger,
            IIngredientRepository ingredientRepository,
            ICategoryRepository categoryRepository,
            IAspNetUserRepository userRepository,
            KIOSKContext dbContext)
        {
            _logger = logger;
            _ingredientRepository = ingredientRepository;
            _categoryRepository = categoryRepository;
            _userRepository = userRepository;
            _context = dbContext;
        }
        #endregion

        #region Methods

        /// <summary>
        /// Create a new recipe.
        /// </summary>
        /// <param name="recipe">The recipe to create.</param>
        /// <returns>The id of the newly created record.</returns>
        public Task<Recipe> Create(Recipe recipe)
        {
            if (GetByName(recipe.Title).Result != null)
                throw new System.InvalidOperationException("Recipe with the same name already exist.");

            // Swap out newlines for Html breaks
            var instructions = recipe.Instructions.Replace("\n", "<br />");
            recipe.Instructions = instructions;

            // Create recipe
            _context.Add(recipe);
            _context.SaveChanges();
            _context.Entry(recipe).GetDatabaseValues();

            // Add ingredients
            foreach (var i in recipe.Ingredients)
            {
                i.RecId = recipe.RecId;
                i.Ingredient = i.Ingredient;
                _context.Add(i);
            }
            _context.SaveChanges();

            // Create category map
            var mmap = new RecipeCategoryMap()
            {
                CatId = recipe.CatId,
                RecId = recipe.RecId
            };
            _context.Add(mmap);
            _context.SaveChanges();

            //return recipe.RecId;
            return Task.Run(() => recipe);
        }

        /// <summary>
        /// Delete a recipe.
        /// </summary>
        /// <param name="id">The id of the recipe to delete.</param>
        /// <returns>Boolean flag that indicates the success or failure state.</returns>
        public Task<bool> Delete(int id)
        {
            var recipe = GetOne(new Recipe() { RecId = id }).Result;
            var mmap = new RecipeCategoryMap()
            {
                CatId = recipe.CatId,
                RecId = recipe.RecId
            };

            recipe.Ingredients = _ingredientRepository.GetByRecipe(recipe).Result;
            foreach (var i in recipe.Ingredients)
                _context.Remove(i);

            // delete recipe
            _context.Remove(mmap);
            _context.Remove(recipe);
            _context.SaveChanges();

            //return recipe.RecId;
            return Task.Run(() => true);
        }

        /// <summary>
        /// Fetch recipes.
        /// </summary>
        /// <param name="options">Options when fetching recipes.</param>        
        /// <returns></returns>
        public Task<List<Recipe>> Get(RepositoryOptionsRecipe options)
        {
            var recipes = (from r in _context.Recipes select r);

            // Search filter
            if (!string.IsNullOrEmpty(options.SearchString))
                recipes = recipes.Where(s => s.Title.Contains(options.SearchString));

            // Sort column + order
            switch (options.SortOrder)
            {
                case SortOrder.Ascending:
                    recipes = (options.SortColumn == RecipeSortColumn.Date)
                        ? recipes.OrderBy(s => s.Date)
                        : recipes.OrderBy(s => s.Title);
                    break;
                case SortOrder.Descending:
                    recipes = (options.SortColumn == RecipeSortColumn.Date)
                        ? recipes.OrderByDescending(s => s.Date)
                        : recipes.OrderByDescending(s => s.Title);
                    break;
                case SortOrder.None:
                    break;
            }

            // By user
            if (!string.IsNullOrEmpty(options.UserUid))
                recipes = recipes.Where(s => s.Useruid.Equals(options.UserUid));

            // By category
            if (options.CategoryId > 0)
            {
                // SELECT * FROM recipe r
                // WHERE r.recId = 
                // (SELECT recId FROM recipeCategoryMap
                //  WHERE recId = r.recId and catId = 1)
                recipes = from r in recipes
                          where (from m in _context.RecipeCategoryMaps
                                 where m.CatId == options.CategoryId
                                 select m.RecId).Contains(r.RecId)
                          select r;
            }

            var pagedList = PaginatedList<Recipe>.CreateAsync(recipes.AsNoTracking(), options.PageNumber, options.PageSize);
            var pagedResult = Task.Run(() => pagedList.Result.ToList());

            // Nested references
            if (options.IncludeIngredients)
                foreach (var r in pagedResult.Result)
                    if (r.Ingredients == null)
                        r.Ingredients = _ingredientRepository.GetByRecipe(r).Result;

            if (options.IncludePrimaryCategory)
                foreach (var r in pagedResult.Result)
                    if (r.PrimaryCategory == null)
                        r.PrimaryCategory = _categoryRepository.GetById(r.CatId).Result;

            if (options.IncludeCategories)
                foreach (var r in pagedResult.Result)
                    if (r.Categories == null)
                        r.Categories = _categoryRepository.GetByRecipe(r).Result;

            if (options.IncludeOwner)
            {
                foreach (var r in pagedResult.Result)
                {
                    if (r.Owner == null)
                    {
                        var owner = _userRepository.GetById(r.Useruid).Result;
                        r.Owner = new AspNetUser() { Id = owner.Id, UserName = owner.UserName };
                    }
                }
            }

            if (options.IncludeUser)
            {
                foreach (var r in pagedResult.Result)
                {
                    if (r.Owner == null)
                    {
                        var owner = _userRepository.GetById(r.Useruid).Result;
                        r.User = new RecipeUser() { Id = owner.Id, UserName = owner.UserName, Email = owner.Email };
                    }
                }
            }

            return pagedResult;
        }

        /// <summary>
        /// Fetch a specific recipe from the database.
        /// </summary>
        /// <param name="recipe"></param>
        /// <returns></returns>
        public Task<Recipe> GetOne(Recipe recipe)
        {
            return (GetOne(recipe, new RepositoryOptionsRecipe()));
        }

        /// <summary>
        /// Fetch a specific category from the database.
        /// </summary>
        /// <param name="category"></param>
        /// <returns></returns>
        public Task<Recipe> GetOne(Recipe recipe, RepositoryOptionsRecipe options)
        {
            var e = _context.Recipes.Where(p => p.RecId.Equals(recipe.RecId)).SingleOrDefaultAsync();
            Recipe dbrecipe = e.Result;

            if (options.IncludeIngredients)
                dbrecipe.Ingredients = _ingredientRepository.GetByRecipe(dbrecipe).Result;

            if (options.IncludePrimaryCategory)
                dbrecipe.PrimaryCategory = _categoryRepository.GetById(dbrecipe.CatId).Result;

            if (options.IncludeCategories)
                dbrecipe.Categories = _categoryRepository.GetByRecipe(recipe).Result;

            if (options.IncludeOwner)
            {
                var owner = _userRepository.GetById(dbrecipe.Useruid).Result;
                dbrecipe.Owner = new AspNetUser() { Id = owner.Id, UserName = owner.UserName };
            }

            return Task.Run(() => dbrecipe);
        }

        /// <summary>
        /// Fetch a specific recipe by its title.
        /// </summary>
        /// <param name="title">The recipe title.</param>
        /// <returns></returns>
        public Task<Recipe> GetByName(string title)
        {
            var recipe = _context.Recipes.Where(p => p.Title.ToLower() == title.ToLower()).FirstOrDefaultAsync();
            return recipe;
        }

        /// <summary>
        /// 
        /// </summary>
        /// <param name="updatedRecipe"></param>
        /// <returns></returns>
        public Task<Recipe> Update(Recipe updatedRecipe)
        {
            var ingredients = _ingredientRepository.GetByRecipe(updatedRecipe).Result;
            foreach (var i in ingredients)
                _context.Remove(i);

            _context.SaveChanges();

            var recipe = GetOne(updatedRecipe).Result;
            recipe.CatId = updatedRecipe.CatId;
            recipe.Date = System.DateTime.UtcNow;
            recipe.Description = updatedRecipe.Description;
            recipe.Title = updatedRecipe.Title;
            //recipe.Useruid = updatedRecipe.Useruid;
            // Swap out newlines for Html breaks
            var instructions = updatedRecipe.Instructions.Replace("\n", "<br />");
            recipe.Instructions = instructions;

            _context.Update(recipe);
            _context.SaveChanges();

            foreach (var i in updatedRecipe.Ingredients)
            {
                i.RecId = updatedRecipe.RecId;
                _context.Add(i);
                _context.SaveChanges();
            }

            return Task.Run(() => recipe);
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
