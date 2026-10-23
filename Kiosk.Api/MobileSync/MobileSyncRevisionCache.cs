using KioskApi.Data;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace KioskApi.MobileSync
{
    /// <summary>
    /// A coherent, immutable manifest of the recipe collection.
    /// </summary>
    public sealed class MobileSyncSnapshot
    {
        internal MobileSyncSnapshot(long generation, IReadOnlyList<MobileCategory> categories, IReadOnlyList<MobileManifestEntry> recipes)
        {
            Generation = generation;
            Categories = categories;
            Recipes = recipes;
            CollectionRevision = MobileSyncCatalog.ComputeCollectionRevision(recipes, categories);
        }

        internal long Generation { get; }

        /// <summary>Category catalog ordered by id.</summary>
        public IReadOnlyList<MobileCategory> Categories { get; }

        /// <summary>Recipe ids and revisions ordered by id.</summary>
        public IReadOnlyList<MobileManifestEntry> Recipes { get; }

        /// <summary>Revision covering <see cref="Categories"/> and <see cref="Recipes"/>.</summary>
        public string CollectionRevision { get; }
    }

    /// <summary>
    /// Thrown when no coherent snapshot can be produced right now (for example during recipe writes).
    /// </summary>
    public class MobileSyncPendingException : Exception
    {
        /// <summary>Constructor.</summary>
        public MobileSyncPendingException() : base("The recipe collection is changing; try again shortly.") { }
    }

    /// <summary>
    /// Process-wide cache of the mobile manifest. Rebuilt lazily after API writes signal a change;
    /// direct database edits are picked up only after a service restart.
    /// </summary>
    public class MobileSyncRevisionCache
    {
        private const int MaxBuildAttempts = 3;
        private static readonly TimeSpan RetryDelay = TimeSpan.FromMilliseconds(250);

        private readonly IServiceScopeFactory _scopeFactory;
        private readonly SemaphoreSlim _buildGate = new SemaphoreSlim(1, 1);
        private long _generation;
        private int _activeWrites;
        private int _buildCount;
        private MobileSyncSnapshot _snapshot;

        /// <summary>Constructor.</summary>
        public MobileSyncRevisionCache(IServiceScopeFactory scopeFactory)
        {
            _scopeFactory = scopeFactory;
        }

        /// <summary>Number of completed snapshot builds (diagnostics/tests).</summary>
        public int BuildCount => Volatile.Read(ref _buildCount);

        /// <summary>Call before a write that can change mobile-visible data.</summary>
        public void BeginWrite()
        {
            Interlocked.Increment(ref _activeWrites);
            Interlocked.Increment(ref _generation);
        }

        /// <summary>Call after the write finishes, whether or not it succeeded.</summary>
        public void EndWrite()
        {
            Interlocked.Increment(ref _generation);
            Interlocked.Decrement(ref _activeWrites);
        }

        /// <summary>
        /// Return the current snapshot, rebuilding at most once for any number of concurrent callers.
        /// </summary>
        /// <exception cref="MobileSyncPendingException">Writes kept the collection changing.</exception>
        public async Task<MobileSyncSnapshot> GetSnapshotAsync(CancellationToken cancellationToken)
        {
            var current = TryGetCurrent();
            if (current != null)
                return current;

            await _buildGate.WaitAsync(cancellationToken);
            try
            {
                for (var attempt = 0; attempt < MaxBuildAttempts; attempt++)
                {
                    current = TryGetCurrent();
                    if (current != null)
                        return current;

                    if (Volatile.Read(ref _activeWrites) == 0)
                    {
                        var generation = Interlocked.Read(ref _generation);
                        var built = await BuildAsync(generation, cancellationToken);
                        Interlocked.Increment(ref _buildCount);
                        if (Volatile.Read(ref _activeWrites) == 0 && Interlocked.Read(ref _generation) == generation)
                        {
                            Volatile.Write(ref _snapshot, built);
                            return built;
                        }
                    }

                    await Task.Delay(RetryDelay, cancellationToken);
                }

                throw new MobileSyncPendingException();
            }
            finally
            {
                _buildGate.Release();
            }
        }

        private MobileSyncSnapshot TryGetCurrent()
        {
            var snapshot = Volatile.Read(ref _snapshot);
            return snapshot != null
                && Volatile.Read(ref _activeWrites) == 0
                && snapshot.Generation == Interlocked.Read(ref _generation)
                ? snapshot
                : null;
        }

        private async Task<MobileSyncSnapshot> BuildAsync(long generation, CancellationToken cancellationToken)
        {
            using var scope = _scopeFactory.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<KIOSKContext>();
            var categories = await MobileSyncCatalog.LoadCategoriesAsync(context, cancellationToken);
            var recipes = await MobileSyncCatalog.LoadRecipesAsync(context, null, cancellationToken);
            var entries = recipes.Select(r => new MobileManifestEntry { Id = r.Id, Revision = r.Revision }).ToList();
            return new MobileSyncSnapshot(generation, categories, entries);
        }
    }
}
