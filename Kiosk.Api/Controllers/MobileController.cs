namespace KioskApi.Controllers
{
    using KioskApi.Data;
    using KioskApi.MobileSync;
    using Microsoft.AspNetCore.Http;
    using Microsoft.AspNetCore.Mvc;
    using System.Linq;
    using System.Threading;
    using System.Threading.Tasks;

    /// <summary>
    /// Read-only text sync for Kitchen Kiosk Mobile. Requires the <c>X-Kiosk-Mobile-Key</c> header.
    /// </summary>
    [Route("api/mobile")]
    [Produces("application/json")]
    public class MobileController : ControllerBase
    {
        private readonly MobileSyncRevisionCache _cache;
        private readonly KIOSKContext _context;

        /// <summary>
        /// Constructor
        /// </summary>
        public MobileController(MobileSyncRevisionCache cache, KIOSKContext context)
        {
            _cache = cache;
            _context = context;
        }

        /// <summary>
        /// Lightweight availability check returning the cached collection revision.
        /// </summary>
        [HttpGet("status")]
        [MobileSyncAccess(MobileSyncOperation.Status)]
        public async Task<IActionResult> GetStatus(CancellationToken cancellationToken)
        {
            var snapshot = await GetSnapshotOrNull(cancellationToken);
            if (snapshot == null)
                return Pending();

            return Ok(new MobileSyncStatus
            {
                ContractVersion = MobileSyncCatalog.ContractVersion,
                SyncEnabled = true,
                CollectionRevision = snapshot.CollectionRevision,
                RecipeCount = snapshot.Recipes.Count,
                CategoryCount = snapshot.Categories.Count,
                MaxRecipesPerRequest = MobileSyncCatalog.MaxRecipesPerRequest
            });
        }

        /// <summary>
        /// Complete recipe id/revision inventory and category catalog.
        /// </summary>
        [HttpGet("manifest")]
        [MobileSyncAccess(MobileSyncOperation.Data)]
        public async Task<IActionResult> GetManifest(CancellationToken cancellationToken)
        {
            var snapshot = await GetSnapshotOrNull(cancellationToken);
            if (snapshot == null)
                return Pending();

            return Ok(new MobileSyncManifest
            {
                ContractVersion = MobileSyncCatalog.ContractVersion,
                CollectionRevision = snapshot.CollectionRevision,
                Categories = snapshot.Categories,
                Recipes = snapshot.Recipes
            });
        }

        /// <summary>
        /// Recipe bodies for up to <see cref="MobileSyncCatalog.MaxRecipesPerRequest"/> distinct ids.
        /// </summary>
        [HttpPost("recipes")]
        [MobileSyncAccess(MobileSyncOperation.Data)]
        public async Task<IActionResult> GetRecipes([FromBody] MobileRecipeBodiesRequest request, CancellationToken cancellationToken)
        {
            var ids = request?.Ids;
            if (ids == null || ids.Count == 0 || ids.Count > MobileSyncCatalog.MaxRecipesPerRequest)
                return BadRequestError($"Provide 1 to {MobileSyncCatalog.MaxRecipesPerRequest} recipe ids.");
            if (ids.Any(id => id <= 0) || ids.Distinct().Count() != ids.Count)
                return BadRequestError("Recipe ids must be distinct positive integers.");

            var recipes = await MobileSyncCatalog.LoadRecipesAsync(_context, ids, cancellationToken);
            var found = recipes.Select(r => r.Id).ToHashSet();

            return Ok(new MobileRecipeBodiesResponse
            {
                ContractVersion = MobileSyncCatalog.ContractVersion,
                Recipes = recipes,
                MissingIds = ids.Where(id => !found.Contains(id)).OrderBy(id => id).ToList()
            });
        }

        private async Task<MobileSyncSnapshot> GetSnapshotOrNull(CancellationToken cancellationToken)
        {
            try
            {
                return await _cache.GetSnapshotAsync(cancellationToken);
            }
            catch (MobileSyncPendingException)
            {
                return null;
            }
        }

        private IActionResult Pending()
        {
            Response.Headers.RetryAfter = "5";
            return MobileSyncAccessFilter.Error(StatusCodes.Status503ServiceUnavailable, "revision_pending", "The recipe collection is changing; try again shortly.");
        }

        private IActionResult BadRequestError(string message) =>
            MobileSyncAccessFilter.Error(StatusCodes.Status400BadRequest, "invalid_request", message);
    }
}
