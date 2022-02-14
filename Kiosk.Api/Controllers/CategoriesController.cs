//-----------------------------------------------------------------------
// Source File:  "CategoriesController.cs"
// Create Date:  02/02/2022 12:33:00 PM
// Last Updated: 02/14/2022 11:42:00 PM
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
namespace Kiosk.Api.Controllers
{
    using Kiosk.Data.Repository;
    using KioskApi.Controllers;
    using KioskApi.Domain.Models;
    using Microsoft.AspNetCore.Mvc;
    using Microsoft.Extensions.Configuration;
    using Microsoft.Extensions.Logging;
    using System;
    using System.Threading.Tasks;

    /// <summary>
    /// Endpoints for categories
    /// </summary>
    [Route("api/[controller]")]
    [ApiController]
    public class CategoriesController : BaseController
    {
        #region Fields
        private readonly ILogger _logger;
        private readonly ICategoryRepository _categoryRepository;
        #endregion

        #region Constructors
        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="configuration"></param>
        /// <param name="logger"></param>
        /// <param name="categoryRepository"></param>
        public CategoriesController(
            IConfiguration configuration,
            ILogger<CategoriesController> logger,
            ICategoryRepository categoryRepository) : base(configuration)
        {
            _logger = logger;
            _categoryRepository = categoryRepository;
        }
        #endregion

        #region Http Action Endpoints

        /// <summary>
        /// Fetch a collection of <see cref="RecipeCategory"/> instances.
        /// </summary>        
        /// <returns></returns>
        [HttpGet(Name = "GetCategories")]
        public async Task<IActionResult> GetCategories()
        {
            try
            {
               var categories = await _categoryRepository.GetAll();
                return Ok(categories);
            }
            catch (Exception ex)
            {
                return BadRequest(new Response { Status = "Failed", Message = $"Unable to retrieve the categories due to an error: '{ex.Message}'" });
            }
        }

        #endregion
    }
}
