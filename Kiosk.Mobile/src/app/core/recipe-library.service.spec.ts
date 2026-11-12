import { TestBed } from '@angular/core/testing';
import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';
import { Network } from '@capacitor/network';
import { vi } from 'vitest';
import { MANUAL_REFRESH_LIMIT, MANUAL_REFRESH_WINDOW_MS, RecipeLibrary } from './recipe-library.service';
import { MobileApi, MobileApiError } from './mobile-api.service';
import { RecipeStore } from './recipe-store.service';
import { MobileSnapshot } from './mobile-sync';

vi.mock('@capacitor/app', () => ({ App: { addListener: vi.fn() } }));
vi.mock('@capacitor/network', () => ({ Network: { addListener: vi.fn() } }));

describe('RecipeLibrary', () => {
  const snapshot: MobileSnapshot = { collectionRevision: 'same', categories: [], recipes: [], syncedAt: '2026-11-12T12:00:00.000Z' };
  let api: { configure: ReturnType<typeof vi.fn>; serverName: ReturnType<typeof vi.fn>; status: ReturnType<typeof vi.fn> };
  let store: { read: ReturnType<typeof vi.fn>; commit: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    localStorage.clear();
    vi.spyOn(Capacitor, 'getPlatform').mockReturnValue('android');
    vi.mocked(App.addListener).mockResolvedValue({ remove: async () => undefined });
    vi.mocked(Network.addListener).mockResolvedValue({ remove: async () => undefined });
    api = { configure: vi.fn().mockResolvedValue(true), serverName: vi.fn().mockReturnValue('recipes.example.lan'), status: vi.fn().mockResolvedValue({ contractVersion: 1, syncEnabled: true, collectionRevision: 'same', recipeCount: 0, categoryCount: 0, maxRecipesPerRequest: 100 }) };
    store = { read: vi.fn().mockResolvedValue(snapshot), commit: vi.fn() };
    TestBed.configureTestingModule({ providers: [RecipeLibrary, { provide: MobileApi, useValue: api }, { provide: RecipeStore, useValue: store }] });
  });

  afterEach(() => { vi.restoreAllMocks(); vi.useRealTimers(); });

  it('loads local data before status and throttles repeated checks', async () => {
    const library = TestBed.inject(RecipeLibrary);
    await library.initialize();
    await Promise.all([library.check(), library.check()]);
    expect(library.snapshot()).toEqual(snapshot);
    expect(api.status).toHaveBeenCalledTimes(1);
    expect(store.commit).not.toHaveBeenCalled();
    expect(library.reachable()).toBe(true);
    expect(library.serverName()).toBe('recipes.example.lan');
  });

  it('keeps saved data visible after an unauthorized response and honors retry delays', async () => {
    vi.useFakeTimers();
    api.status.mockRejectedValue(new MobileApiError('rate_limited', 120));
    const library = TestBed.inject(RecipeLibrary);
    await library.initialize();
    vi.advanceTimersByTime(60000);
    await library.check();
    expect(api.status).toHaveBeenCalledTimes(1);
    expect(library.snapshot()).toEqual(snapshot);
    expect(library.reachable()).toBe(false);
  });

  it('does not contact the server when the database cannot open', async () => {
    store.read.mockRejectedValue(new Error('Storage unavailable'));
    const library = TestBed.inject(RecipeLibrary);
    await library.initialize();
    expect(api.status).not.toHaveBeenCalled();
    expect(library.message()).toContain('storage');
  });

  it('automatically commits available updates after opening the saved library', async () => {
    api.status.mockResolvedValue({ contractVersion: 1, syncEnabled: true, collectionRevision: 'new', recipeCount: 0, categoryCount: 0, maxRecipesPerRequest: 100 });
    Object.assign(api, { manifest: vi.fn().mockResolvedValue({ contractVersion: 1, collectionRevision: 'new', recipes: [], categories: [] }) });
    const library = TestBed.inject(RecipeLibrary);

    await library.initialize();

    expect(store.commit).toHaveBeenCalledOnce();
    expect(library.snapshot()?.collectionRevision).toBe('new');
    expect(library.updatesAvailable()).toBe(false);
    expect(library.message()).toContain('synchronized');
    expect(library.unread()).toBe(true);
    expect(library.notices()[0]).toMatchObject({ kind: 'success', text: library.message() });
  });

  it('keeps an up-to-date check quiet but shows it as the current message', async () => {
    const library = TestBed.inject(RecipeLibrary);
    await library.initialize();
    expect(library.message()).toBe('Recipes are up to date.');
    expect(library.messageTime()).not.toBeNull();
    expect(library.unread()).toBe(false);
    expect(library.notices()).toEqual([]);
  });

  it('does not flag an unreachable server as a new notification', async () => {
    api.status.mockRejectedValue(new MobileApiError('unreachable', 0));
    const library = TestBed.inject(RecipeLibrary);
    await library.initialize();
    expect(library.message()).toContain('not reachable');
    expect(library.unread()).toBe(false);
    expect(library.notices()).toEqual([]);
  });

  it('flags errors once until a different notice arrives', async () => {
    vi.useFakeTimers();
    api.status.mockRejectedValue(new MobileApiError('unauthorized', 0));
    const library = TestBed.inject(RecipeLibrary);
    await library.initialize();
    expect(library.unread()).toBe(true);
    expect(library.notices()[0]).toMatchObject({ kind: 'error', text: expect.stringContaining('mobile key') });

    library.markRead();
    vi.advanceTimersByTime(31000);
    await library.check();
    expect(api.status).toHaveBeenCalledTimes(2);
    expect(library.unread()).toBe(false);
    expect(library.notices().length).toBe(1);
  });

  it('lets the user refresh past the automatic throttle up to the limit per window', async () => {
    vi.useFakeTimers();
    const library = TestBed.inject(RecipeLibrary);
    await library.initialize();
    for (let i = 0; i < MANUAL_REFRESH_LIMIT; i++) {
      await library.refreshNow();
    }
    expect(api.status).toHaveBeenCalledTimes(1 + MANUAL_REFRESH_LIMIT);
    expect(library.refreshBlockedUntil()).not.toBeNull();

    await library.refreshNow();
    expect(api.status).toHaveBeenCalledTimes(1 + MANUAL_REFRESH_LIMIT);
    expect(library.message()).toContain('limited to 5');
    expect(library.unread()).toBe(true);

    vi.advanceTimersByTime(MANUAL_REFRESH_WINDOW_MS + 100);
    expect(library.refreshBlockedUntil()).toBeNull();
    await library.refreshNow();
    expect(api.status).toHaveBeenCalledTimes(2 + MANUAL_REFRESH_LIMIT);
  });

  it('keeps the refresh limit across app restarts', async () => {
    const now = Date.now();
    localStorage.setItem('kitchen-kiosk.manual-refreshes', JSON.stringify(Array.from({ length: MANUAL_REFRESH_LIMIT }, (_, i) => now - i * 1000)));
    const library = TestBed.inject(RecipeLibrary);
    await library.initialize();
    expect(library.refreshBlockedUntil()).toBe(now - (MANUAL_REFRESH_LIMIT - 1) * 1000 + MANUAL_REFRESH_WINDOW_MS);
    await library.refreshNow();
    expect(api.status).toHaveBeenCalledTimes(1);
  });

  it('ignores manual taps while a check is already running', async () => {
    const library = TestBed.inject(RecipeLibrary);
    const opening = library.initialize();
    await Promise.resolve();
    await Promise.all([library.refreshNow(), opening]);
    expect(api.status).toHaveBeenCalledTimes(1);
  });
});
