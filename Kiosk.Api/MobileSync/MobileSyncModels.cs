using System.Collections.Generic;

namespace KioskApi.MobileSync
{
    /// <summary>
    /// Response of <c>GET api/mobile/status</c>.
    /// </summary>
    public class MobileSyncStatus
    {
        /// <summary>Mobile sync contract version.</summary>
        public int ContractVersion { get; set; }
        /// <summary>Always true; a disabled server answers 503 <c>sync_disabled</c>.</summary>
        public bool SyncEnabled { get; set; }
        /// <summary>Opaque revision of the whole recipe collection and category catalog.</summary>
        public string CollectionRevision { get; set; }
        /// <summary>Number of recipes in the manifest.</summary>
        public int RecipeCount { get; set; }
        /// <summary>Number of categories in the manifest.</summary>
        public int CategoryCount { get; set; }
        /// <summary>Largest accepted <see cref="MobileRecipeBodiesRequest.Ids"/> list.</summary>
        public int MaxRecipesPerRequest { get; set; }
    }

    /// <summary>
    /// Response of <c>GET api/mobile/manifest</c>.
    /// </summary>
    public class MobileSyncManifest
    {
        /// <summary>Mobile sync contract version.</summary>
        public int ContractVersion { get; set; }
        /// <summary>Opaque revision of exactly this manifest.</summary>
        public string CollectionRevision { get; set; }
        /// <summary>Complete category catalog, ordered by id.</summary>
        public IReadOnlyList<MobileCategory> Categories { get; set; }
        /// <summary>Complete recipe inventory, ordered by id.</summary>
        public IReadOnlyList<MobileManifestEntry> Recipes { get; set; }
    }

    /// <summary>
    /// A recipe category.
    /// </summary>
    public class MobileCategory
    {
        /// <summary>Category id.</summary>
        public int Id { get; set; }
        /// <summary>Category name.</summary>
        public string Name { get; set; }
    }

    /// <summary>
    /// A manifest entry: recipe id and content revision.
    /// </summary>
    public class MobileManifestEntry
    {
        /// <summary>Recipe id.</summary>
        public int Id { get; set; }
        /// <summary>Opaque recipe content revision.</summary>
        public string Revision { get; set; }
    }

    /// <summary>
    /// Request body of <c>POST api/mobile/recipes</c>.
    /// </summary>
    public class MobileRecipeBodiesRequest
    {
        /// <summary>Distinct positive recipe ids.</summary>
        public List<int> Ids { get; set; }
    }

    /// <summary>
    /// Response of <c>POST api/mobile/recipes</c>.
    /// </summary>
    public class MobileRecipeBodiesResponse
    {
        /// <summary>Mobile sync contract version.</summary>
        public int ContractVersion { get; set; }
        /// <summary>Requested recipes that exist, ordered by id.</summary>
        public IReadOnlyList<MobileRecipe> Recipes { get; set; }
        /// <summary>Requested ids that no longer exist.</summary>
        public IReadOnlyList<int> MissingIds { get; set; }
    }

    /// <summary>
    /// Reader-visible recipe text, author username, and recommended flag. Excludes user ids, emails, and photos.
    /// </summary>
    public class MobileRecipe
    {
        /// <summary>Recipe id.</summary>
        public int Id { get; set; }
        /// <summary>Opaque content revision; compare with the manifest entry.</summary>
        public string Revision { get; set; }
        /// <summary>Title.</summary>
        public string Title { get; set; }
        /// <summary>Description.</summary>
        public string Description { get; set; }
        /// <summary>Instructions as stored (may contain <c>&lt;br /&gt;</c>).</summary>
        public string Instructions { get; set; }
        /// <summary>Stored recipe date (no time zone), display only.</summary>
        public string Date { get; set; }
        /// <summary>Primary category id.</summary>
        public int PrimaryCategoryId { get; set; }
        /// <summary>Username of the recipe owner; null if the owner no longer exists.</summary>
        public string Author { get; set; }
        /// <summary>True when any user has marked the recipe as a favorite (the web app's thumbs-up).</summary>
        public bool Recommended { get; set; }
        /// <summary>Mapped category ids, ascending.</summary>
        public IReadOnlyList<int> CategoryIds { get; set; }
        /// <summary>Ingredient lines, case-insensitive alphabetical.</summary>
        public IReadOnlyList<string> Ingredients { get; set; }
    }

    /// <summary>
    /// Error body returned by the mobile sync endpoints.
    /// </summary>
    public class MobileSyncError
    {
        /// <summary>Stable machine-readable code.</summary>
        public string Code { get; set; }
        /// <summary>Human-readable explanation.</summary>
        public string Message { get; set; }
    }
}
