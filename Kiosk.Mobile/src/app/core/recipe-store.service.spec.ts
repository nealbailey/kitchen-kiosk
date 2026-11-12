import { RecipeStore } from './recipe-store.service';
import { SQLiteConnection } from '@capacitor-community/sqlite';
import { vi } from 'vitest';
import { MobileSnapshot } from './mobile-sync';

describe('RecipeStore', () => {
  const snapshot: MobileSnapshot = { collectionRevision: 'empty', categories: [], recipes: [], syncedAt: '2026-11-12T12:00:00.000Z' };

  afterEach(() => vi.restoreAllMocks());

  it('stores the complete snapshot with one parameterized transactional statement', async () => {
    const run = vi.fn().mockResolvedValue({});
    const database = { open: vi.fn(), execute: vi.fn(), run };
    vi.spyOn(SQLiteConnection.prototype, 'createConnection').mockResolvedValue(database as never);
    await new RecipeStore().commit(snapshot);
    expect(run).toHaveBeenCalledWith(expect.stringContaining('ON CONFLICT'), [JSON.stringify(snapshot)], true);
  });

  it('loads and validates the committed snapshot after opening the database', async () => {
    const database = { open: vi.fn(), execute: vi.fn(), query: vi.fn().mockResolvedValue({ values: [{ payload: JSON.stringify(snapshot) }] }) };
    vi.spyOn(SQLiteConnection.prototype, 'createConnection').mockResolvedValue(database as never);
    expect(await new RecipeStore().read()).toEqual(snapshot);
  });

  it('surfaces a malformed stored snapshot instead of silently clearing it', async () => {
    const database = { open: vi.fn(), execute: vi.fn(), query: vi.fn().mockResolvedValue({ values: [{ payload: '{}' }] }) };
    vi.spyOn(SQLiteConnection.prototype, 'createConnection').mockResolvedValue(database as never);
    await expect(new RecipeStore().read()).rejects.toThrow();
  });
});