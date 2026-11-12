import { MobileRecipe, MobileSnapshot, SnapshotStore, SyncApi, synchronize } from './mobile-sync';

const recipe: MobileRecipe = {
  id: 1, revision: 'recipe-1', title: 'Soup', description: null, instructions: '<p>Cook.</p>',
  date: '2026-11-12T12:00:00', primaryCategoryId: 1, author: 'Cook', recommended: false,
  categoryIds: [1], ingredients: ['Water'],
};
const categories = [{ id: 1, name: 'Soups' }];
const snapshot: MobileSnapshot = {
  collectionRevision: 'old', categories, recipes: [recipe], syncedAt: '2026-11-10T12:00:00.000Z',
};

describe('mobile synchronization', () => {
  let saved: MobileSnapshot | null;
  let commits: number;
  let requests: number[][];
  let manifests: number;
  let api: SyncApi;
  let store: SnapshotStore;

  beforeEach(() => {
    saved = null;
    commits = 0;
    requests = [];
    manifests = 0;
    store = {
      read: async () => saved,
      commit: async value => { commits++; saved = value; },
    };
    api = {
      status: async () => ({ contractVersion: 1, syncEnabled: true, collectionRevision: 'new', recipeCount: 1, categoryCount: 1, maxRecipesPerRequest: 100 }),
      manifest: async () => { manifests++; return { contractVersion: 1, collectionRevision: 'new', categories, recipes: [{ id: 1, revision: 'recipe-1' }] }; },
      bodies: async ids => { requests.push(ids); return { contractVersion: 1, recipes: [recipe], missingIds: [] }; },
    };
  });

  it('downloads the first complete collection before committing', async () => {
    const result = await synchronize(api, store);
    expect(requests).toEqual([[1]]);
    expect(commits).toBe(1);
    expect(result.added).toBe(1);
    expect(saved?.collectionRevision).toBe('new');
  });

  it('does not request a manifest or bodies for an equal committed revision', async () => {
    saved = { ...snapshot, collectionRevision: 'new' };
    expect((await synchronize(api, store)).changed).toBe(false);
    expect(manifests).toBe(0);
    expect(commits).toBe(0);
    expect(requests).toEqual([]);
  });

  it('reuses unchanged bodies and refreshes the category catalog', async () => {
    saved = snapshot;
    api.manifest = async () => ({ contractVersion: 1, collectionRevision: 'new', categories: [{ id: 1, name: 'Renamed' }], recipes: [{ id: 1, revision: 'recipe-1' }] });
    await synchronize(api, store);
    expect(requests).toEqual([]);
    expect(saved?.categories[0].name).toBe('Renamed');
  });

  it('applies authoritative deletion including an empty collection', async () => {
    saved = snapshot;
    api.manifest = async () => ({ contractVersion: 1, collectionRevision: 'empty', categories: [], recipes: [] });
    expect((await synchronize(api, store)).removed).toBe(1);
    expect(saved?.recipes).toEqual([]);
  });

  it('preserves the previous snapshot on a failed transfer', async () => {
    saved = snapshot;
    api.manifest = async () => ({ contractVersion: 1, collectionRevision: 'new', categories, recipes: [{ id: 1, revision: 'changed' }] });
    api.bodies = async () => { throw new Error('Offline'); };
    await expect(synchronize(api, store)).rejects.toThrow('Offline');
    expect(saved).toBe(snapshot);
    expect(commits).toBe(0);
  });

  it('rejects an incomplete manifest matching the status revision without replacing saved data', async () => {
    saved = snapshot;
    api.manifest = async () => ({ contractVersion: 1, collectionRevision: 'new', categories, recipes: [] });

    await expect(synchronize(api, store)).rejects.toThrow('collection counts');
    expect(saved).toBe(snapshot);
    expect(commits).toBe(0);
  });

  it('restarts a mismatched batch once and never commits mixed revisions', async () => {
    api.bodies = async () => ({ contractVersion: 1, recipes: [{ ...recipe, revision: 'wrong' }], missingIds: [] });
    await expect(synchronize(api, store)).rejects.toThrow('collection changed');
    expect(manifests).toBe(2);
    expect(commits).toBe(0);
  });

  it('rejects duplicate identifiers and invalid category references', async () => {
    api.manifest = async () => ({ contractVersion: 1, collectionRevision: 'new', categories, recipes: [{ id: 1, revision: 'recipe-1' }, { id: 1, revision: 'recipe-1' }] });
    await expect(synchronize(api, store)).rejects.toThrow('duplicate');
    api.status = async () => ({ contractVersion: 1, syncEnabled: true, collectionRevision: 'new', recipeCount: 1, categoryCount: 0, maxRecipesPerRequest: 100 });
    api.manifest = async () => ({ contractVersion: 1, collectionRevision: 'new', categories: [], recipes: [{ id: 1, revision: 'recipe-1' }] });
    await expect(synchronize(api, store)).rejects.toThrow('invalid category');
    expect(commits).toBe(0);
  });

  it('honors the advertised batch bound and downloads only changed bodies', async () => {
    saved = snapshot;
    const recipes = [recipe, { ...recipe, id: 2 }, { ...recipe, id: 3 }];
    api.status = async () => ({ contractVersion: 1, syncEnabled: true, collectionRevision: 'new', recipeCount: 3, categoryCount: 1, maxRecipesPerRequest: 1 });
    api.manifest = async () => ({ contractVersion: 1, collectionRevision: 'new', categories, recipes: recipes.map(value => ({ id: value.id, revision: value.revision })) });
    api.bodies = async ids => { requests.push(ids); return { contractVersion: 1, recipes: recipes.filter(value => ids.includes(value.id)), missingIds: [] }; };
    const result = await synchronize(api, store);
    expect(requests).toEqual([[2], [3]]);
    expect(result.added).toBe(2);
  });
});