//-----------------------------------------------------------------------
// Source File:  "ImagesHelper.cs"
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
namespace Kiosk.Data.Helpers
{
    using SkiaSharp;
    using System;
    using System.IO;

    public class ImagesHelper
    {
        /// <summary>
        /// Resizes the image on-demand at runtime.
        /// Setting either width or height to 0 will maintain aspect ratio.
        /// </summary>
        /// <param name="image">The image <see cref="byte"/> stream.</param>
        /// <param name="width">The image width (optional). Default is 1920px.</param>
        /// <param name="height">The image height (optional). Default is 0px.</param>
        /// <exception cref="System.ArgumentNullException">The exception that is thrown when a null reference (Nothing in Visual Basic) is passed to a method that does not accept it as a valid argument.</exception>
        /// <exception cref="System.ArgumentException">The exception that is thrown when one of the arguments provided to a method is not valid.</exception>
        /// <exception cref="InvalidDataException">Image format not recognised or content invalid.</exception>
        /// <returns><see cref="byte"/> array.</returns>
        public static byte[] ResizeImage(byte[] imageBytes, int width = 1920, int height = 0)
        {
            if (imageBytes == null)
                return System.Array.Empty<byte>(); // imageBytes;

            if (width == 0 && height == 0)
                return imageBytes;

            using var source = SKBitmap.Decode(imageBytes)
                ?? throw new InvalidDataException("Image format not recognised or content invalid.");

            if (width > 0 && width > source.Width)
                return imageBytes;

            if (height > 0 && height > source.Height)
                return imageBytes;

            // A zero dimension is derived from the other to preserve aspect ratio.
            int targetWidth = width > 0 ? width : Math.Max(1, (int)Math.Round((double)source.Width * height / source.Height));
            int targetHeight = height > 0 ? height : Math.Max(1, (int)Math.Round((double)source.Height * width / source.Width));

            var info = new SKImageInfo(targetWidth, targetHeight, SKColorType.Rgba8888, SKAlphaType.Premul);
            using var resized = source.Resize(info, new SKSamplingOptions(SKCubicResampler.Mitchell))
                ?? throw new InvalidOperationException("Image resize failed.");
            using var image = SKImage.FromBitmap(resized);
            using var data = image.Encode(SKEncodedImageFormat.Jpeg, 90);
            return data.ToArray();
        }

        /// <summary>
        /// Gets the full path to the photos directory for a single recipe.
        /// </summary>
        /// <param name="recId">The recipe ID.</param>
        /// <param name="imagesFolder">The root folder containing all recipe photos.</param>
        /// <param name="path">Out. The calculated path to the photos for the specific recipe.</param>
        /// <returns>A boolean indicating whether the path was found.</returns>
        public static bool GetFullPhotosPath(int recId, string imagesFolder, out string path)
        {
            path = string.Empty;
            if (string.IsNullOrEmpty(imagesFolder))
                return false;            

            if (!Directory.Exists(imagesFolder))
                return false;

            // _photosPath is the root path to the photos directory. 
            // The format will be: {_photosPath}/{recId} - {RecipeName}
            // Search for the directory that starts with 'recId -' and return that path, or the first match.            
            string[] dirs = Directory.GetDirectories(imagesFolder, $"{recId} *");
            if (dirs.Length == 0)
                return false;            

            path = dirs[0];
            return true;
        }
    }
}