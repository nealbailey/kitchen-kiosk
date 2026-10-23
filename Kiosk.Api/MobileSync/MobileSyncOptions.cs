namespace KioskApi.MobileSync
{
    /// <summary>
    /// Settings for the read-only Kitchen Kiosk Mobile sync endpoints (configuration section <c>MobileSync</c>).
    /// </summary>
    public class MobileSyncOptions
    {
        /// <summary>
        /// Configuration section name.
        /// </summary>
        public const string SectionName = "MobileSync";

        /// <summary>
        /// Shortest accepted shared key.
        /// </summary>
        public const int MinimumApiKeyLength = 32;

        /// <summary>
        /// Master switch. Mobile sync endpoints answer 503 unless this is true.
        /// </summary>
        public bool Enabled { get; set; }

        /// <summary>
        /// Shared key that mobile builds send in the <c>X-Kiosk-Mobile-Key</c> header.
        /// </summary>
        public string ApiKey { get; set; }

        /// <summary>
        /// Status checks accepted per minute across all clients.
        /// </summary>
        public int StatusRequestsPerMinute { get; set; } = 120;

        /// <summary>
        /// Manifest and recipe-body requests accepted per minute across all clients.
        /// </summary>
        public int DataRequestsPerMinute { get; set; } = 60;

        /// <summary>
        /// Manifest and recipe-body requests allowed to run at the same time.
        /// </summary>
        public int MaxConcurrentDataRequests { get; set; } = 2;
    }
}
