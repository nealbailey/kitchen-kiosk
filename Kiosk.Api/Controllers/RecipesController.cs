//-----------------------------------------------------------------------
// Source File:  "RecipesController.cs"
// Create Date:  02/02/2022 12:33:00 PM
// Last Updated: 08/20/2025 11:19:00 AM
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
    using Microsoft.AspNetCore.Identity;
    using Microsoft.AspNetCore.Mvc;
    using Microsoft.Extensions.Configuration;
    using Microsoft.Extensions.Logging;
    using System;
    using System.Threading.Tasks;

    /// <summary>
    /// Endpoints for recipes
    /// </summary>
    [Route("api/[controller]")]
    [ApiController]
    public class RecipesController : BaseController
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
        public RecipesController(
            IConfiguration configuration,
            UserManager<ApplicationUser> userManager,
            RoleManager<IdentityRole<Guid>> roleManager,
            ILogger<RecipesController> logger,
            IRecipeRepository recipeRepository) : base(configuration, userManager, roleManager)
        {
            _logger = logger;
            _recipeRepository = recipeRepository;
        }
        #endregion

        #region Http Action Endpoints

        /// <summary>
        /// Fetch a collection of <see cref="Recipe"/> instances.
        /// </summary>
        /// <param name="sortOrder">Order Direction (Asc or Desc)</param>
        /// <param name="sortColumn">The column to sort results.</param>
        /// <param name="searchstring">Search string</param>
        /// <param name="searchType">Search type (recipe or ingredient)</param>
        /// <param name="pageNumber">Current page</param>
        /// <param name="pageSize">Page size</param>
        /// <param name="categoryId">The category</param>
        /// <param name="userId">The user Guid</param>
        /// <param name="favorites">Limit results to user favorites</param>
        /// <param name="expand">Return a shallow or fully populated instance.</param>
        /// <returns></returns>
        [HttpGet(Name = "GetRecipes")]
        public async Task<IActionResult> GetRecipes(
            string sortOrder = "Asc",
            string sortColumn = "Title",
            string searchstring = "",
            string searchType = "none",
            int pageNumber = 1,
            int pageSize = 25,
            int categoryId = 0,
            string userId = "",
            bool favorites = false,
            bool expand = false)
        {
            try
            {
                var options = new RepositoryOptionsRecipe
                {
                    FavoritesOnly = favorites,
                    PageSize = pageSize,
                    PageNumber = pageNumber,
                    SearchString = searchstring,                    
                    SearchType = SearchStringType.None,
                    CategoryId = categoryId,
                    UserUid = string.IsNullOrEmpty(userId) ? (System.Guid?)null : System.Guid.Parse(userId),
                    SortColumn = RecipeSortColumn.Title,
                    SortOrder = SortOrder.None,
                    IncludeCategories = (expand),
                    IncludeFavoriteFlag = true,
                    IncludeIngredients = (expand),
                    IncludeOwner = (expand),
                    IncludePrimaryCategory = true,
                    IncludeRecommendedFlag = true,
                    IncludeUser = true
                };

                switch (searchType.ToLower())
                {
                    case "ingredient": options.SearchType = SearchStringType.IngredientName; break;
                    case "recipe": options.SearchType = SearchStringType.RecipeName; break;
                    default: options.SearchType = SearchStringType.None; break;
                }

                switch (sortOrder.ToLower())
                {
                    case "asc": options.SortOrder = SortOrder.Ascending; break;
                    case "desc": options.SortOrder = SortOrder.Descending; break;
                }

                switch (sortColumn.ToLower())
                {
                    case "title": options.SortColumn = RecipeSortColumn.Title; break;
                    case "date": options.SortColumn = RecipeSortColumn.Date; break;
                }

                var recipes = await _recipeRepository.Get(options, GetAuthenticatedUser()?.Id);

                return Ok(recipes);
            }
            catch (Exception ex)
            {
                return BadRequest(new Response { Status = "Failed", Message = $"Unable to retrieve the recipes due to an error: '{ex.Message}'" });
            }
        }

        #endregion
    }
}
