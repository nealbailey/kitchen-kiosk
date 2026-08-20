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
    using SixLabors.ImageSharp;
    using SixLabors.ImageSharp.Formats.Jpeg;
    using SixLabors.ImageSharp.Processing;    
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
        /// <exception cref="SixLabors.ImageSharp.UnknownImageFormatException">Image format not recognised.</exception>
        /// <exception cref="SixLabors.ImageSharp.InvalidImageContentException">Image contains invalid content.</exception>
        /// <returns><see cref="byte"/> array.</returns>
        public static byte[] ResizeImage(byte[] imageBytes, int width = 1920, int height = 0)
        {
            if (imageBytes == null)
                return System.Array.Empty<byte>(); // imageBytes;

            if (width == 0 && height == 0)
                return imageBytes;

            byte[] resizedImageBytes = imageBytes;
            using (var img = Image.Load(imageBytes))
            {
                if (width > 0 && width > img.Width)                
                    return resizedImageBytes;

                if (height > 0 && height > img.Height)
                    return resizedImageBytes;

                // All supported resampling algorithms:
                // https://docs.sixlabors.com/api/ImageSharp/SixLabors.ImageSharp.Processing.KnownResamplers.html
                // img.Mutate(x => x.Resize(1280, 0, KnownResamplers.NearestNeighbor));
                
                img.Mutate(x => x.Resize(width, height));
                using (var memoryStream = new MemoryStream())
                {
                    img.Save(memoryStream, new JpegEncoder());
                    resizedImageBytes = memoryStream.ToArray();
                }
            }
            return resizedImageBytes;
        }
    }
}