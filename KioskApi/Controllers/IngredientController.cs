//-----------------------------------------------------------------------
// Source File:  "IngredientController.cs"
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
    using System.Threading.Tasks;

    /// <summary>
    /// Endpoints for Ingredients
    /// </summary>
    [Route("api/[controller]")]
    [ApiController]
    public class IngredientController : BaseController
    {
        #region Fields
        private readonly ILogger _logger;
        private readonly IIngredientRepository _ingredientRepository;
        #endregion

        #region Constructors
        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="configuration"></param>
        /// <param name="logger"></param>
        /// <param name="ingredientRepository"></param>
        public IngredientController(
            IConfiguration configuration,
            ILogger<CategoryController> logger,
            IIngredientRepository ingredientRepository) : base(configuration)
        {
            _logger = logger;
            _ingredientRepository = ingredientRepository;
        }
        #endregion

        #region Http Action Endpoints

        /// <summary>
        /// Get <see cref="Recipe"/> ingredients.
        /// </summary>
        /// <param name="recipeId">The recipe id.</param>
        /// <returns></returns>
        [HttpGet("{recipeId}", Name = "GetByRecipe")]        
        public async Task<IActionResult> GetByRecipe(int recipeId)
        {   
            var dbingredient = await _ingredientRepository.GetByRecipe(new Recipe() { RecId = recipeId });
            return Ok(dbingredient);
        }

        #endregion
    }
}
