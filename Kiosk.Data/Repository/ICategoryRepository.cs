//-----------------------------------------------------------------------
// Source File:  "ICategoryRepository.cs"
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
    using KioskApi.Domain.Models;
    using System.Collections.Generic;
    using System.Threading.Tasks;

    public interface ICategoryRepository
    {
        /// <summary>
        /// Create category.
        /// </summary>
        /// <param name="category"></param>
        /// <returns></returns>
        public Task<int> Create(RecipeCategory category);

        /// <summary>
        /// Fetch a specific category from the database.
        /// </summary>
        /// <param name="category"></param>
        /// <returns></returns>
        public Task<RecipeCategory> Get(RecipeCategory category);

        /// <summary>
        /// Get category by id.
        /// </summary>
        /// <param name="categoryId"></param>
        /// <returns></returns>
        public Task<RecipeCategory> GetById(int categoryId);

        /// <summary>
        /// Get all categories.
        /// </summary>
        /// <returns></returns>
        public Task<List<RecipeCategory>> GetAll();

        /// <summary>
        /// Get categories by recipe.
        /// </summary>
        /// <param name="recipe"></param>
        /// <returns></returns>
        public Task<List<RecipeCategory>> GetByRecipe(Recipe recipe);
    }
}
