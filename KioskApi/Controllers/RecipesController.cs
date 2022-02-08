//-----------------------------------------------------------------------
// Source File:  "RecipesController.cs"
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

namespace KioskApi.Controllers
{
    using Kiosk.Data.Repository;
    using KioskApi.Domain.Models;
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
        /// <param name="logger"></param>
        /// <param name="recipeRepository"></param>
        public RecipesController(
            IConfiguration configuration,
            ILogger<RecipeController> logger,
            IRecipeRepository recipeRepository) : base(configuration)
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
        /// <param name="pageNumber">Current page</param>
        /// <param name="pageSize">Page size</param>
        /// <param name="categoryId">The category</param>
        /// <param name="userId">The user Guid</param>
        /// <param name="expand">Return a shallow or fully populated instance.</param>
        /// <returns></returns>
        [HttpGet(Name = "GetRecipes")]
        public async Task<IActionResult> GetRecipes(
            string sortOrder = "Asc",
            string sortColumn = "Title",
            string searchstring = "",
            int pageNumber = 1,
            int pageSize = 25,
            int categoryId = 0,
            string userId = "",
            bool expand = false)
        {
            try
            {
                var options = new RepositoryOptionsRecipe
                {
                    PageSize = pageSize,
                    PageNumber = pageNumber,
                    SearchString = searchstring,
                    CategoryId = categoryId,
                    UserUid = userId,
                    SortColumn = RecipeSortColumn.Title,
                    SortOrder = SortOrder.None,
                    IncludeCategories = (expand),
                    IncludeIngredients = (expand),
                    IncludeOwner = (expand),
                    IncludePrimaryCategory = (expand)
                };

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

                var recipes = await _recipeRepository.Get(options);

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
