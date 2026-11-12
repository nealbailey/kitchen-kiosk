import { z } from 'zod';

const id = z.number().int().positive();
const revision = z.string().min(1).max(200);
const categorySchema = z.object({ id, name: z.string().min(1).max(1000) });
const entrySchema = z.object({ id, revision });
export const recipeSchema = z.object({
  id,
  revision,
  title: z.string().min(1).max(10000),
  description: z.string().nullable(),
  instructions: z.string().nullable(),
  date: z.string().refine(value => Number.isFinite(Date.parse(value)), 'Invalid recipe date'),
  primaryCategoryId: id,
  author: z.string().nullable(),
  recommended: z.boolean(),
  categoryIds: z.array(id).max(1000),
  ingredients: z.array(z.string()).max(10000),
});
export const statusSchema = z.object({
  contractVersion: z.literal(1),
  syncEnabled: z.literal(true),
  collectionRevision: revision,
  recipeCount: z.number().int().min(0).max(10000),
  categoryCount: z.number().int().min(0).max(1000),
  maxRecipesPerRequest: z.number().int().min(1).max(100),
});
const manifestSchema = z.object({
  contractVersion: z.literal(1),
  collectionRevision: revision,
  categories: z.array(categorySchema).max(1000),
  recipes: z.array(entrySchema).max(10000),
});
const bodiesSchema = z.object({
  contractVersion: z.literal(1),
  recipes: z.array(recipeSchema).max(100),
  missingIds: z.array(id).max(100),
});
export const snapshotSchema = z.object({
  collectionRevision: revision,
  categories: z.array(categorySchema).max(1000),
  recipes: z.array(recipeSchema).max(10000),
  syncedAt: z.string().datetime(),
});

export type MobileRecipe = z.infer<typeof recipeSchema>;
export type MobileCategory = z.infer<typeof categorySchema>;
export type MobileSnapshot = z.infer<typeof snapshotSchema>;
export type MobileStatus = z.infer<typeof statusSchema>;

export interface SyncApi {
  status(): Promise<unknown>;
  manifest(): Promise<unknown>;
  bodies(ids: number[]): Promise<unknown>;
}

export interface SnapshotStore {
  read(): Promise<MobileSnapshot | null>;
  commit(snapshot: MobileSnapshot): Promise<void>;
}

export interface SyncResult {
  snapshot: MobileSnapshot;
  changed: boolean;
  added: number;
  updated: number;
  removed: number;
}

class CollectionChanged extends Error {}

function uniqueIds(entries: { id: number }[]): void {
  if (new Set(entries.map(entry => entry.id)).size !== entries.length) {
    throw new Error('The server returned duplicate identifiers.');
  }
}

export function validateSnapshot(input: unknown): MobileSnapshot {
  const snapshot = snapshotSchema.parse(input);
  uniqueIds(snapshot.categories);
  uniqueIds(snapshot.recipes);
  const categories = new Set(snapshot.categories.map(category => category.id));
  for (const recipe of snapshot.recipes) {
    if (!categories.has(recipe.primaryCategoryId)
      || recipe.categoryIds.some(categoryId => !categories.has(categoryId))
      || new Set(recipe.categoryIds).size !== recipe.categoryIds.length) {
      throw new Error('A recipe references an invalid category.');
    }
  }
  return snapshot;
}

export async function synchronize(api: SyncApi, store: SnapshotStore): Promise<SyncResult> {
  const stored = await store.read();
  const previous = stored ? validateSnapshot(stored) : null;
  const status = statusSchema.parse(await api.status());
  if (previous?.collectionRevision === status.collectionRevision) {
    return { snapshot: previous, changed: false, added: 0, updated: 0, removed: 0 };
  }

  const existing = new Map(previous?.recipes.map(recipe => [recipe.id, recipe]) ?? []);
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const manifest = manifestSchema.parse(await api.manifest());
      uniqueIds(manifest.categories);
      uniqueIds(manifest.recipes);
      if (manifest.collectionRevision === status.collectionRevision
        && (manifest.recipes.length !== status.recipeCount || manifest.categories.length !== status.categoryCount)) {
        throw new Error('The manifest does not match the reported collection counts.');
      }
      const expected = new Map(manifest.recipes.map(entry => [entry.id, entry.revision]));
      const changed = manifest.recipes.filter(entry => existing.get(entry.id)?.revision !== entry.revision);
      const downloaded = new Map<number, MobileRecipe>();
      for (let offset = 0; offset < changed.length; offset += status.maxRecipesPerRequest) {
        const ids = changed.slice(offset, offset + status.maxRecipesPerRequest).map(entry => entry.id);
        const response = bodiesSchema.parse(await api.bodies(ids));
        uniqueIds(response.recipes);
        if (response.missingIds.length || response.recipes.length !== ids.length
          || response.recipes.some(recipe => !ids.includes(recipe.id) || expected.get(recipe.id) !== recipe.revision)) {
          throw new CollectionChanged('The collection changed during download. Please retry.');
        }
        response.recipes.forEach(recipe => downloaded.set(recipe.id, recipe));
      }
      const snapshot = validateSnapshot({
        collectionRevision: manifest.collectionRevision,
        categories: manifest.categories,
        recipes: manifest.recipes.map(entry => downloaded.get(entry.id) ?? existing.get(entry.id)),
        syncedAt: new Date().toISOString(),
      });
      await store.commit(snapshot);
      return {
        snapshot,
        changed: true,
        added: changed.filter(entry => !existing.has(entry.id)).length,
        updated: changed.filter(entry => existing.has(entry.id)).length,
        removed: [...existing.keys()].filter(recipeId => !expected.has(recipeId)).length,
      };
    } catch (error) {
      if (!(error instanceof CollectionChanged) || attempt === 1) {
        throw error;
      }
    }
  }
  throw new Error('Synchronization could not finish.');
}