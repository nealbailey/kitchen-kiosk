//-----------------------------------------------------------------------
// Source File:  "CategoryRepository.cs"
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

    /// <summary>
    /// Repository for Categories
    /// </summary>
    public class CategoryRepository : BaseRepository, ICategoryRepository
    {
        #region Fields        
        #endregion

        #region Constructors
        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="logger"></param>
        /// <param name="dbContext"></param>
        public CategoryRepository(ILogger<ICategoryRepository> logger, KIOSKContext dbContext)
        {
            _logger = logger;
            _context = dbContext;
        }
        #endregion

        #region Methods

        /// <summary>
        /// Create category.
        /// </summary>
        /// <param name="category"></param>
        /// <returns></returns>
        public Task<RecipeCategory> Create(RecipeCategory category)
        {
            // Get existing record, if exists
            var dbcategory = Get(category).Result;
            if (dbcategory != null)
                return Task.Run(() => dbcategory);

            _context.Add(category);
            _context.SaveChanges();
            _context.Entry(category).GetDatabaseValues();
            return Task.Run(() => category);
        }

        /// <summary>
        /// Fetch a specific category from the database.
        /// </summary>
        /// <param name="category"></param>
        /// <returns></returns>
        public Task<RecipeCategory> Get(RecipeCategory category)
        {
            // Fully populated category
            if (category.CatId > 0 && !string.IsNullOrEmpty(category.Category))
            {
                _context.Entry(category).GetDatabaseValues();
                return Task.Run(() => category);
            }

            // Only has an id
            if (category.CatId > 0)
            {
                var e = _context.RecipeCategories.Where(p => p.CatId.Equals(category.CatId)).SingleOrDefaultAsync();
                return Task.Run(() => e);
            }

            // Only has a string name
            var r = _context.RecipeCategories.Where(p => p.Category.Equals(category.Category)).SingleOrDefaultAsync();
            return Task.Run(() => r);
        }

        /// <summary>
        /// Get category by id.
        /// </summary>
        /// <param name="categoryId"></param>
        /// <returns></returns>
        public Task<RecipeCategory> GetById(int categoryId)
        {
            var task_category = _context.RecipeCategories.Where(p => p.CatId.Equals(categoryId)).SingleOrDefaultAsync().Result;            
            return Task.Run(() => (RecipeCategory)task_category.Clone());
        }

        /// <summary>
        /// Get all categories.
        /// </summary>
        /// <returns></returns>
        public Task<List<RecipeCategory>> GetAll()
        {
            var categories = _context.RecipeCategories.ToListAsync();
            return Task.Run(() => categories);
        }

        /// <summary>
        /// Get categories by recipe.
        /// </summary>
        /// <param name="recipe"></param>
        /// <returns></returns>
        public Task<List<RecipeCategory>> GetByRecipe(Recipe recipe)
        {
            
            var categories = 
                       (from x in _context.RecipeCategories
                        join c in _context.RecipeCategoryMaps
                        on x.CatId equals c.CatId 
                        where c.RecId == recipe.RecId 
                        select x).Distinct().ToListAsync();

            var result = categories.Result;
            return Task.Run(() => result);
        }

        #endregion
    }
}
