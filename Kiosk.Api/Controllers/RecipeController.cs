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
    using Kiosk.Api.Extensions;
    using Kiosk.Data.Repository;
    using KioskApi.Domain.Models;
    using Microsoft.AspNetCore.Mvc;
    using Microsoft.Extensions.Configuration;
    using Microsoft.Extensions.Logging;
    using Newtonsoft.Json;
    using System;
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
        [HttpPost(Name = "InsertRecipe")]
        public async Task<IActionResult> InsertRecipe()
        {
            var HttpBody = Request.GetRawBodyStringAsync().Result;
            try
            {
                dynamic x = JsonConvert.DeserializeObject<dynamic>(HttpBody);
                var recipe = new Recipe()
                {
                    Useruid = x.useruid,                    
                    Title = x.title,
                    Date = DateTime.Parse(x.date),
                    Instructions = x.instructions,
                    Description = x.description,
                    CatId = x.primaryCategory.catId
                };
            }
            catch(Exception ex)
            {
                System.Diagnostics.Debug.WriteLine(ex.Message);
            }            

            return Ok();
        }

        #endregion
    }
}
