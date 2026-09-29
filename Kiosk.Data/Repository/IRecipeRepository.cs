//-----------------------------------------------------------------------
// Source File:  "IRecipeRepository.cs"
// Create Date:  02/02/2022 12:33:00 PM
// Last Updated: 03/24/2022 11:26:00 PM
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
    /// Database access for working with <see cref="Recipe"/> entities.
    /// </summary>
    public interface IRecipeRepository
    {
        /// <summary>
        /// Create a new recipe.
        /// </summary>
        /// <param name="recipe">The recipe to create.</param>
        /// <returns>The id of the newly created record.</returns>
        public Task<Recipe> Create(Recipe recipe);

        /// <summary>
        /// Flag a specific recipe as a favorite.
        /// </summary>
        /// <param name="recipe">The recipe to flag.</param>
        /// <param name="userUid">The user who is flagging the recipe.</param>
        /// <returns>A <see cref="bool"/> flag to determine if the operation succeeded or failed.</returns>
        /// <exception cref="System.ArgumentException">The exception that is thrown when one of the arguments provided to a method is not valid.</exception>
        /// <exception cref="System.ArgumentNullException">The exception that is thrown when a null reference (Nothing in Visual Basic) is passed to a method that does not accept it as a valid argument.</exception>
        public Task<bool> CreateFavorite(Recipe recipe, System.Guid userUid);

        /// <summary>
        /// Unfavorite a specific recipe.
        /// </summary>
        /// <param name="recId">The id of the recipe to unfavorite.</param>
        /// <param name="userUid">The user who is removing the favorite.</param>
        /// <returns>A <see cref="bool"/> flag to determine if the operation succeeded or failed.</returns>
        /// <exception cref="System.ArgumentException">The exception that is thrown when one of the arguments provided to a method is not valid.</exception>
        /// <exception cref="System.ArgumentNullException">The exception that is thrown when a null reference (Nothing in Visual Basic) is passed to a method that does not accept it as a valid argument.</exception>
        public Task<bool> DeleteFavorite(int recId, System.Guid userUid);

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
        /// Fetch recipes.
        /// </summary>
        /// <param name="options">Options when fetching recipes.</param>
        /// <returns></returns>
        public Task<List<Recipe>> Get(RepositoryOptionsRecipe options, System.Guid? requestingUid = null);

        /// <summary>
        /// Fetch a specific recipe from the database by its name.
        /// </summary>
        /// <param name="title"></param>
        /// <returns></returns>
        public Task<Recipe> GetByName(string title);
        
        /// <summary>
        /// Fetch a specific recipe from the database.
        /// </summary>
        /// <param name="recipe"></param>
        /// <returns></returns>
        public Task<Recipe> GetOne(Recipe recipe);
        
        /// <summary>
        /// Fetch a specific recipe from the database.
        /// </summary>
        /// <param name="recipe"></param>
        /// <param name="options"></param>
        /// <returns></returns>
        public Task<Recipe> GetOne(Recipe recipe, RepositoryOptionsRecipe options);

        /// <summary>
        /// Update a specific recipe in the database.
        /// </summary>
        /// <param name="recipe">The recipe to update.</param>
        /// <returns>A Task representing the asynchronous operation, containing the updated recipe.</returns>
        public Task<Recipe> Update(Recipe recipe);

        
    }
}
