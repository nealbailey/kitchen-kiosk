//-----------------------------------------------------------------------
// Source File:  "PhotosController.cs"
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
    using Microsoft.AspNetCore.Mvc;
    using Microsoft.Extensions.Configuration;
    using Microsoft.Extensions.Logging;
    using System.Threading.Tasks;

    /// <summary>
    /// Endpoints for Photos
    /// </summary>
    [Route("api/[controller]")]
    [ApiController]
    public class PhotosController : BaseController
    {
        #region Fields
        private readonly ILogger _logger;
        private readonly IPhotosRepository _photosRepository;
        #endregion

        #region Constructors
        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="configuration"></param>
        /// <param name="logger"></param>
        /// <param name="photosRepository"></param>
        public PhotosController(
            IConfiguration configuration,
            ILogger<PhotosController> logger,
            IPhotosRepository photosRepository) : base(configuration)
        {
            _logger = logger;
            _photosRepository = photosRepository;
        }
        #endregion

        #region Http Action Endpoints

        /// <summary>
        /// Get photos for a specific recipe.
        /// </summary>
        /// <param name="id">The recipe id.</param>
        /// <returns></returns>
        [HttpGet("{id}")]        
        public async Task<IActionResult> GetById(int id)
        {   
            base.GetFullPhotosPath(id, out string photosPath);
            var dbphotos = await _photosRepository.GetByRecipeId(id, photosPath);
            return Ok(dbphotos);
        }

        /// <summary>
        /// Get a specific photo for a specific recipe.
        /// </summary>
        /// <param name="id">The recipe id.</param>
        /// <param name="fileName">The file name of the photo.</param>
        /// <returns></returns>
        [HttpGet("{id}/{fileName}")]        
        public async Task<IActionResult> GetPhoto(int id, string fileName)
        {   
            base.GetFullPhotosPath(id, out string photosPath);
            var imagePath = System.IO.Path.Combine(photosPath, fileName);

            if (!System.IO.File.Exists(imagePath))            
                return NotFound();
            
            try
            {
                var imageBytes = await System.IO.File.ReadAllBytesAsync(imagePath);
                return File(imageBytes, "image/jpeg");
            }
            catch (System.Exception ex)
            {
                _logger.LogError(ex, $"Error retrieving photo: {fileName} for recipe id: {id}");
                return StatusCode(500, "Internal server error");
            }
        }

         /// <summary>
        /// Get a specific photo for a specific recipe.
        /// </summary>
        /// <param name="id">The recipe id.</param>
        /// <param name="fileName">The file name of the photo.</param>
        /// <returns></returns>
        [HttpGet("thumb/{id}/{fileName}")]        
        public async Task<IActionResult> GetPhotoThumb(int id, string fileName)
        {   
            base.GetFullPhotosPath(id, out string photosPath);
            var imagePath = System.IO.Path.Combine(photosPath, fileName);

            if (!System.IO.File.Exists(imagePath))            
                return NotFound();
            
            try
            {
                var imageBytes = await System.IO.File.ReadAllBytesAsync(imagePath);
                return File(imageBytes, "image/jpeg");
            }
            catch (System.Exception ex)
            {
                _logger.LogError(ex, $"Error retrieving photo: {fileName} for recipe id: {id}");
                return StatusCode(500, "Internal server error");
            }
        }

        #endregion
    }
}
