//-----------------------------------------------------------------------
// Source File:  "IRecipeRepository.cs"
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

    /// <summary>
    /// 
    /// </summary>
    public interface IRecipeRepository
    {
        /// <summary>
        /// Create a new recipe.
        /// </summary>
        /// <param name="recipe">The recipe to create.</param>
        /// <returns>The id of the newly created record.</returns>
        public Task<int> Create(Recipe recipe);

        /// <summary>
        /// Delete a recipe.
        /// </summary>
        /// <param name="id">The id of the recipe to delete.</param>
        /// <returns>Boolean flag that indicates the success or failure state.</returns>
        public Task<bool> Delete(int id);

        /// <summary>
        /// Fetch recipes.
        /// </summary>
        /// <param name="options">Options when fetching recipes.</param>
        /// <returns></returns>
        public Task<List<Recipe>> Get(RepositoryOptionsRecipe options);
        
        /// <summary>
        /// Fetch a specific category from the database.
        /// </summary>
        /// <param name="recipe"></param>
        /// <returns></returns>
        public Task<Recipe> GetOne(Recipe recipe);

        /// <summary>
        /// Fetch a specific category from the database.
        /// </summary>
        /// <param name="recipe"></param>
        /// <param name="options"></param>
        /// <returns></returns>
        public Task<Recipe> GetOne(Recipe recipe, RepositoryOptionsRecipe options);
    }
}
