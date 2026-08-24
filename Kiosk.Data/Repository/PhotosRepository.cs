//-----------------------------------------------------------------------
// Source File:  "PhotosRepository.cs"
// Create Date:  08/18/2026 15:33:00 PM
// Last Updated: 08/18/2026 15:33:00 PM
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
    using KioskApi.Data;
    using KioskApi.Domain.Models;    
    using Microsoft.Extensions.Logging;
    using System.Collections.Generic;
    using System;
    using System.Threading.Tasks;

    public class PhotosRepository : BaseRepository, IPhotosRepository
    {
        #region Constructors
        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="logger"></param>
        /// <param name="dbContext"></param>
        public PhotosRepository(ILogger<IPhotosRepository> logger, KIOSKContext dbContext)
        {
            _logger = logger;
            _context = dbContext;
        }
        #endregion

        #region Methods

        /// <summary>
        /// Retrieve the <see cref="RecipePhoto"/> collection for a recipe.
        /// </summary>
        /// <param name="recipeId"></param>
        /// <param name="photosPath"></param>
        /// <returns></returns>
        public Task<List<RecipePhoto>> GetByRecipeId(int recipeId, string photosPath)
        {
            // Implementation for retrieving photos by recipe ID and photos path
            // Enumerate the files in the specified photosPath directory and create a list of RecipePhoto objects
            var photos = new List<RecipePhoto>();
            try
            {
                // Check if the directory exists and return an empty list if it does not
                if (!System.IO.Directory.Exists(photosPath))
                {
                    _logger.LogWarning($"Photos path does not exist: {photosPath}");
                    photos.Add(new RecipePhoto
                    {
                        RecipeId = recipeId
                    });
                    return Task.FromResult(photos); 
                }

                // Get all files in the directory and create RecipePhoto objects
                var files = System.IO.Directory.GetFiles(photosPath);
                foreach (var file in files)
                {
                    var fileName = System.IO.Path.GetFileName(file);
                    var photo = new RecipePhoto
                    {
                        RecipeId = recipeId,
                        FileName = fileName,
                        FilePath = System.IO.Path.GetDirectoryName(file),
                        ImageUrl = $"/api/photos/{recipeId}/{fileName}",
                        ImageThumbUrl = $"/api/photos/{recipeId}/thumb/{fileName}"
                    };
                    photos.Add(photo);
                }
                return Task.FromResult(photos);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error retrieving photos for recipe ID {recipeId}: {ex.Message}");
                return Task.FromResult(new List<RecipePhoto>());
            }
        }

        #endregion  
    }
}
