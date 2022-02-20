//-----------------------------------------------------------------------
// Source File:  "RecipeController.cs"
// Create Date:  02/02/2022 12:33:00 PM
// Last Updated: 02/02/2022 12:33:00 PM
// Authors(s):   Neal Bailey <nealbailey@hotmail.com>
//-----------------------------------------------------------------------
// COMMERCIAL USE RIGHTS - PROHIBITED PUBLIC DISTRIBUTION
// Intellectual Property Rights Holder: Neal Bailey
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
namespace KioskApi.Controllers
{
    using Kiosk.Data.Repository;
    using KioskApi.Domain.Models;
    using KioskApi.Domain.Models.Auth;
    using Microsoft.AspNetCore.Authorization;
    using Microsoft.AspNetCore.Identity;
    using Microsoft.AspNetCore.Mvc;
    using Microsoft.Extensions.Configuration;
    using Microsoft.Extensions.Logging;
    using System.Threading.Tasks;

    /// <summary>
    /// Endpoints for working a recipe
    /// </summary>
    [Route("api/[controller]")]
    [ApiController]
    public class RecipeController : BaseController
    {
        #region Fields
        private readonly ILogger _logger;
        private readonly IRecipeRepository _recipeRepository;
        #endregion

        #region Constructors
        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="configuration"></param>
        /// <param name="roleManager"></param>
        /// <param name="userManager"></param>
        /// <param name="logger"></param>
        /// <param name="recipeRepository"></param>
        public RecipeController(
            IConfiguration configuration,
            UserManager<ApplicationUser> userManager, 
            RoleManager<IdentityRole> roleManager,
            ILogger<RecipeController> logger,
            IRecipeRepository recipeRepository): base(configuration, userManager, roleManager) 
        {
            _logger = logger;
            _recipeRepository = recipeRepository;
        }
        #endregion

        #region Http Action Endpoints

        /// <summary>
        /// Fetch a single <see cref="Recipe"/> by its id.
        /// </summary>
        /// <param name="id">Recipe id</param>
        /// <param name="expand">Return a shallow or fully populated instance.</param>
        /// <returns></returns>
        [HttpGet("{id}", Name = "GetRecipe")]
        public async Task<IActionResult> GetRecipe(int id, bool expand = false)
        {
            var options = new RepositoryOptionsRecipe() {
            IncludeCategories = (expand),
            IncludeIngredients = (expand),
            IncludeOwner = (expand),
            IncludePrimaryCategory = (expand)
            };

            var httpRecipe = new Recipe() { RecId = id };
            var dbRecipe = (expand)
                ? await _recipeRepository.GetOne(httpRecipe, options)
                : await _recipeRepository.GetOne(httpRecipe);

            return Ok(dbRecipe);
        }

        /// <summary>
        /// Create a new <see cref="Recipe"/>.
        /// </summary>
        /// <returns></returns>
        [Authorize()]
        [HttpPost(Name = "InsertRecipe")]
        public async Task<IActionResult> InsertRecipe([FromBody] Recipe recipe)
        {
            try
            {
                recipe.CatId = recipe.PrimaryCategory.CatId;
                recipe.PrimaryCategory = null;
                var recId = await _recipeRepository.Create(recipe);
                return Ok(recId);
            }
            catch(System.Exception ex)
            {
                return UnprocessableEntity($"Unable to create recipe: {ex.Message}");
            }            
        }

        /// <summary>
        /// Create a new <see cref="Recipe"/>.
        /// </summary>
        /// <returns></returns>
        [Authorize()]
        [HttpPut(Name = "UpdateRecipe")]
        public async Task<IActionResult> UpdateRecipe([FromBody] Recipe recipe)
        {
            try
            {
                if (!IsAdminOrOwner(recipe.Useruid))
                    return UnprocessableEntity($"Access is denied. This recipe is owned by another user.");

                recipe.CatId = recipe.PrimaryCategory.CatId;
                recipe.PrimaryCategory = null;
                var record = await _recipeRepository.Update(recipe);
                return Ok(record);
            }
            catch (System.Exception ex)
            {
                return UnprocessableEntity($"Unable to create recipe: {ex.Message}");
            }
        }

        /// <summary>
        /// Create a new <see cref="Recipe"/>.
        /// </summary>
        /// <param name="id">The recipe Id to Delete</param>
        /// <returns></returns> 
        [Authorize()]
        [HttpDelete("{id}", Name = "DeleteRecipe")]
        public async Task<IActionResult> DeleteRecipe(int id)
        {
            try
            {
                var recipe = _recipeRepository.GetOne(new Recipe() { RecId = id }).Result;
                if (!IsAdminOrOwner(recipe.Useruid))
                    return UnprocessableEntity($"Access is denied. This recipe is owned by another user.");

                var recId = await _recipeRepository.Delete(id);
                return Ok(recId);
            }
            catch (System.Exception ex)
            {
                return UnprocessableEntity($"Unable to delete recipe: {ex.Message}");
            }           
        }

        #endregion
    }
}
