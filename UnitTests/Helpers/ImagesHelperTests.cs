namespace UnitTests.Helpers
{
    using Kiosk.Data.Helpers;
    using Microsoft.VisualStudio.TestTools.UnitTesting;
    using SkiaSharp;

    [TestClass]
    public class ImagesHelperTests
    {
        private static byte[] CreateJpeg(int width, int height)
        {
            using var bitmap = new SKBitmap(width, height);
            bitmap.Erase(SKColors.Orange);
            using var image = SKImage.FromBitmap(bitmap);
            return image.Encode(SKEncodedImageFormat.Jpeg, 90).ToArray();
        }

        [TestMethod]
        public void ResizeImage_WidthOnly_PreservesAspectRatio()
        {
            var result = ImagesHelper.ResizeImage(CreateJpeg(400, 200), 100);

            using var bitmap = SKBitmap.Decode(result);
            Assert.AreEqual(100, bitmap.Width);
            Assert.AreEqual(50, bitmap.Height);
        }

        [TestMethod]
        public void ResizeImage_LargerThanSource_ReturnsOriginal()
        {
            var original = CreateJpeg(100, 100);

            Assert.AreSame(original, ImagesHelper.ResizeImage(original, 500));
        }

        [TestMethod]
        public void ResizeImage_NullInput_ReturnsEmpty()
        {
            Assert.AreEqual(0, ImagesHelper.ResizeImage(null).Length);
        }
    }
}
