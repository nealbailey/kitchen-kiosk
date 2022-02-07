//-----------------------------------------------------------------------
// Source File:  "RecipeController.cs"
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
    using Kiosk.Data;
    using Kiosk.Data.Repository;
    using KioskApi.Domain.Models;
    using Microsoft.AspNetCore.Mvc;
    using Microsoft.Extensions.Configuration;
    using Microsoft.Extensions.Logging;
    using System;
    using System.Threading.Tasks;

    /// <summary>
    /// Endpoints for working with recipes
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
        /// <param name="logger"></param>
        /// <param name="recipeRepository"></param>
        public RecipeController(
            IConfiguration configuration,
            ILogger<RecipeController> logger,
            IRecipeRepository recipeRepository): base(configuration) 
        {
            _logger = logger;
            _recipeRepository = recipeRepository;
        }
        #endregion

        #region Http Action Endpoints

        /// <summary>
        /// 
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        [HttpGet("{id}", Name = "GetRecipe")]
        public async Task<IActionResult> GetRecipe(int id)
        {
            var httpRecipe = new Recipe() { RecId = id };
            var dbRecipe = await _recipeRepository.GetOne(httpRecipe);
            return Ok(dbRecipe);
        }

        /// <summary>
        /// 
        /// </summary>
        /// <param name="order"></param>
        /// <param name="searchstring"></param>
        /// <param name="pageNumber"></param>
        /// <param name="pageSize"></param>
        /// <param name="includeIngredients"></param>
        /// <returns></returns>
        [HttpGet]
        [Route("GetRecipes")]
        public async Task<IActionResult> GetRecipes(
            string order = "Asc", 
            string searchstring = "",
            int pageNumber = 1,
            int pageSize = 50,
            bool includeIngredients = false)
        {
            try
            {                
                var options = new RepositoryOptions
                {
                    PageSize = pageSize,
                    PageNumber = pageNumber,
                    SearchString = searchstring,
                    SortOrder = SortOrder.None
                };

                switch (order.ToLower())
                {
                    case "asc":
                        options.SortOrder = SortOrder.Ascending;
                        break;
                    case "desc":
                        options.SortOrder = SortOrder.Descending;
                        break;
                }

                var recipes = await _recipeRepository.Get(options, includeIngredients);

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
