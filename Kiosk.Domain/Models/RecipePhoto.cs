using System;
using System.Collections.Generic;

#nullable disable

namespace KioskApi.Domain.Models
{
    public partial class RecipePhoto
    {
        /// <summary>
        /// Gets or sets the recipe ID associated with the photo. This property represents the unique identifier of the recipe to which the photo belongs.
        /// </summary>
        public int RecipeId { get; set; }

        /// <summary>
        /// Gets or sets the file name of the photo. This property represents the name of the photo file, including its extension (e.g., "photo.jpg").
        /// </summary>
        public string FileName { get; set; }

        /// <summary>
        /// Gets or sets the file path of the photo. This property represents the directory path where the photo file is stored.
        /// </summary>
        public string FilePath { get; set; }
        
        /// <summary>
        /// Gets the full path of the file by combining the FilePath and FileName.
        /// </summary>
        public string FileFullPath { get { return GetFileFullPath(); }}

        /// <summary>
        /// Gets or sets the image URL of the photo. The URL for the full-size image.
        /// </summary>
        public string ImageUrl { get; set; }

        /// <summary>
        /// Returns a string representation of the RecipePhoto object, which is the full path of the file.
        /// If the full path is null, it returns the default string representation of the object.
        /// </summary>
        /// <returns></returns>
        public override string ToString()
        {
            return GetFileFullPath() ?? base.ToString();
        }

        /// <summary>
        /// Gets the full path of the file by combining the FilePath and FileName properties.
        /// If either property is null or empty, it returns null.
        /// </summary>
        /// <returns>The full path of the file, or null if either property is null or empty.</returns>
        protected string GetFileFullPath()
        {
            if (string.IsNullOrEmpty(FilePath) || string.IsNullOrEmpty(FileName))
                return null;

            return System.IO.Path.Combine(FilePath, FileName);
        }

    }
}
