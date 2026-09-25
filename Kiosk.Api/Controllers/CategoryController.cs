//-----------------------------------------------------------------------
// Source File:  "CategoryController.cs"
// Create Date:  02/02/2022 12:33:00 PM
// Last Updated: 09/25/2022 09:07:00 PM
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
    using Microsoft.AspNetCore.Http;
    using Microsoft.AspNetCore.Mvc;
    using Microsoft.Extensions.Configuration;
    using Microsoft.Extensions.Logging;
    using System;
    using System.Threading.Tasks;

    /// <summary>
    /// Endpoints for Categories
    /// </summary>
    [Route("api/[controller]")]
    [ApiController]
    public class CategoryController : BaseController
    {
        #region Fields
        private readonly ILogger _logger;
        private readonly ICategoryRepository _categoryRepository;
        #endregion

        #region Constructors
        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="logger"></param>
        /// <param name="categoryRepository"></param>
        /// <param name="configuration"></param>
        public CategoryController(
            IConfiguration configuration, 
            ILogger<CategoryController> logger,
            ICategoryRepository categoryRepository) : base(configuration)
        {
            _logger = logger;
            _categoryRepository = categoryRepository;
        }

        #endregion

        #region Http Action Endpoints

        /// <summary>
        /// Creates a new category.
        /// </summary>
        /// <param name="category">The category to create.</param>
        /// <returns>A response indicating the success or failure of the operation.</returns>
        [Authorize(Roles = UserRoles.Admin)]
        [HttpPost("AddCategory", Name = "AddCategory")]
        public async Task<IActionResult> AddCategory([FromBody] RecipeCategory category)
        {
            try
            {
                var new_category = await _categoryRepository.Create(category);
                return Ok(new Response { Status = "Success", Message = $"Category '{category.Category}' ({new_category.CatId}) added successfully." });
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new Response
                {
                    Status = "Error",
                    Message = $"AddCategory failed: {ex.Message}"
                });                
            }
        }

        /// <summary>
        /// Delete category.
        /// </summary>
        /// <param name="category">The category to delete.</param>
        /// <returns>A response indicating the success or failure of the operation.</returns>
        [Authorize(Roles = UserRoles.Admin)]
        [HttpPost("DeleteCategory", Name = "DeleteCategory")]
        public async Task<IActionResult> DeleteCategory([FromBody] RecipeCategory category)
        {
            try
            {
                var result = await _categoryRepository.Delete(category);
                return Ok(new Response { Status = "Success", Message = "Category deleted successfully." });
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new Response
                {
                    Status = "Error",
                    Message = $"DeleteCategory failed: {ex.Message}"
                });                
            }
        }

        /// <summary>
        /// Gets a category by its ID.
        /// </summary>
        /// <param name="id">The ID of the category to retrieve.</param>
        /// <returns>The category with the specified ID.</returns>        
        [HttpGet("{id}", Name = "CategoryGetById")]
        public async Task<IActionResult> GetById(string id)
        {
            _logger.LogDebug($"Received get request for /category/{id}");

            try
            {
                var httpCategory = new RecipeCategory() { CatId = int.Parse(id) };
                var dbCategory = await _categoryRepository.Get(httpCategory);
                return Ok(dbCategory);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new Response
                {
                    Status = "Error",
                    Message = $"CategoryGetById failed: {ex.Message}"
                });                
            }                        
        }

        /// <summary>
        /// Gets a category by its ID and/or name.
        /// </summary>
        /// <param name="catId">The ID of the category to retrieve (optional).</param>
        /// <param name="name">The name of the category to retrieve (optional).</param>
        /// <returns>The category matching the specified ID and/or name.</returns>
        [HttpGet]
        [Route("GetCategory")]
        public async Task<IActionResult> GetCategory(int catId, string name)
        {
            _logger.LogDebug($"Received get request for /category/GetCategory?catId={catId}&name={name}");

            try
            {
                var httpCategory = new RecipeCategory() { CatId = catId, Category = name };
                var dbCategory = await _categoryRepository.Get(httpCategory);
                return Ok(dbCategory);    
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new Response
                {
                    Status = "Error",
                    Message = $"GetCategory failed: {ex.Message}"
                });                
            }
        }

        #endregion
    }
}
