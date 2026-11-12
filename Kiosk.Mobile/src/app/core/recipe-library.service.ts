import { Injectable, inject, signal } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';
import { Network } from '@capacitor/network';
import { MobileApi, MobileApiError } from './mobile-api.service';
import { MobileSnapshot, statusSchema, synchronize } from './mobile-sync';
import { RecipeStore } from './recipe-store.service';

export type NoticeKind = 'success' | 'error';

export interface LibraryNotice {
  text: string;
  kind: NoticeKind;
  time: string;
}

const MAX_NOTICES = 20;
export const MANUAL_REFRESH_LIMIT = 5;
export const MANUAL_REFRESH_WINDOW_MS = 30 * 60 * 1000;
const MANUAL_REFRESH_KEY = 'kitchen-kiosk.manual-refreshes';

@Injectable({ providedIn: 'root' })
export class RecipeLibrary {
  private readonly api = inject(MobileApi);
  private readonly store = inject(RecipeStore);
  readonly native = Capacitor.getPlatform() === 'android';
  readonly snapshot = signal<MobileSnapshot | null>(null);
  readonly ready = signal(false);
  readonly configured = signal(false);
  readonly busy = signal(false);
  readonly reachable = signal(false);
  readonly updatesAvailable = signal(false);
  readonly message = signal('Opening recipe storage...');
  readonly messageTime = signal<string | null>(null);
  readonly notices = signal<LibraryNotice[]>([]);
  readonly unread = signal(false);
  readonly lastAttempt = signal<string | null>(null);
  readonly serverName = signal('Home server');
  /** Epoch ms when another manual refresh becomes available, or null when one is available now. */
  readonly refreshBlockedUntil = signal<number | null>(null);
  private initialization?: Promise<void>;
  private checking?: Promise<void>;
  private nextCheck = 0;
  private serverRetryAt = 0;
  private refreshAttempts?: number[];
  private refreshTimer?: ReturnType<typeof setTimeout>;
  private databaseReady = false;
  private active = true;

  initialize(): Promise<void> {
    this.initialization ??= this.open();
    return this.initialization;
  }

  private async open(): Promise<void> {
    this.updateRefreshLimit();
    if (!this.native) {
      this.ready.set(true);
      this.status('Android storage is required for synchronization.');
      return;
    }
    try {
      this.snapshot.set(await this.store.read());
      this.databaseReady = true;
    } catch {
      this.status('Recipe storage could not be opened. Existing data has not been replaced.', 'error');
      this.ready.set(true);
      return;
    }
    this.configured.set(await this.api.configure());
    this.serverName.set(this.api.serverName() ?? 'Home server');
    this.ready.set(true);
    if (!this.configured()) {
      this.status('Server connection is not configured in this build.', 'error');
      return;
    }
    try {
      await App.addListener('appStateChange', state => {
        this.active = state.isActive;
        if (state.isActive) {
          void this.check();
        }
      });
      await Network.addListener('networkStatusChange', status => {
        if (status.connected && this.active) {
          void this.check();
        } else if (!status.connected) {
          this.reachable.set(false);
          this.updatesAvailable.set(false);
          this.status('Offline. Downloaded recipes are still available.');
        }
      });
    } catch {
      this.status('Automatic connection monitoring is unavailable. Updates are checked when the app opens.', 'error');
    }
    await this.check();
  }

  check(): Promise<void> {
    if (this.checking) {
      return this.checking;
    }
    if (!this.databaseReady || !this.configured() || !this.active || Date.now() < Math.max(this.nextCheck, this.serverRetryAt)) {
      return Promise.resolve();
    }
    return this.start();
  }

  /** User-requested sync: bypasses the automatic 30-second throttle but is capped per rolling window. */
  refreshNow(): Promise<void> {
    if (this.checking) {
      return this.checking;
    }
    if (!this.databaseReady || !this.configured()) {
      return Promise.resolve();
    }
    const attempts = this.updateRefreshLimit();
    const until = (time: number) => new Date(time).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    if (this.serverRetryAt > Date.now()) {
      this.status(`The server asked the app to wait. Try again after ${until(this.serverRetryAt)}.`);
      return Promise.resolve();
    }
    const blockedUntil = this.refreshBlockedUntil();
    if (blockedUntil !== null) {
      this.status(`Manual refresh is limited to ${MANUAL_REFRESH_LIMIT} times every 30 minutes. Try again after ${until(blockedUntil)}.`, 'error');
      return Promise.resolve();
    }
    this.saveRefreshAttempts([...attempts, Date.now()]);
    this.updateRefreshLimit();
    return this.start();
  }

  private start(): Promise<void> {
    this.nextCheck = Date.now() + 30000;
    this.checking = this.refresh().finally(() => { this.checking = undefined; });
    return this.checking;
  }

  /** Prunes stored attempts to the current window and updates refreshBlockedUntil. */
  private updateRefreshLimit(): number[] {
    const now = Date.now();
    const attempts = this.loadRefreshAttempts().filter(time => time <= now && now - time < MANUAL_REFRESH_WINDOW_MS);
    this.saveRefreshAttempts(attempts);
    clearTimeout(this.refreshTimer);
    if (attempts.length < MANUAL_REFRESH_LIMIT) {
      this.refreshBlockedUntil.set(null);
      return attempts;
    }
    const until = attempts[attempts.length - MANUAL_REFRESH_LIMIT] + MANUAL_REFRESH_WINDOW_MS;
    this.refreshBlockedUntil.set(until);
    this.refreshTimer = setTimeout(() => this.updateRefreshLimit(), until - now + 50);
    return attempts;
  }

  private loadRefreshAttempts(): number[] {
    if (!this.refreshAttempts) {
      try {
        const value: unknown = JSON.parse(localStorage.getItem(MANUAL_REFRESH_KEY) ?? '[]');
        this.refreshAttempts = Array.isArray(value) ? value.filter((time): time is number => Number.isFinite(time)).sort((a, b) => a - b) : [];
      } catch {
        this.refreshAttempts = [];
      }
    }
    return this.refreshAttempts;
  }

  /** Persisted so restarting the app does not reset the limit; memory still enforces it if storage fails. */
  private saveRefreshAttempts(attempts: number[]): void {
    this.refreshAttempts = attempts;
    try {
      localStorage.setItem(MANUAL_REFRESH_KEY, JSON.stringify(attempts));
    } catch {
      // Best effort only.
    }
  }

  private async refresh(): Promise<void> {
    this.busy.set(true);
    this.lastAttempt.set(new Date().toISOString());
    this.status('Checking the home server...');
    try {
      const status = statusSchema.parse(await this.api.status());
      this.reachable.set(true);
      this.updatesAvailable.set(this.snapshot()?.collectionRevision !== status.collectionRevision);
      if (this.updatesAvailable()) {
        this.status('Downloading recipe changes...');
        const result = await synchronize(this.api, this.store);
        this.snapshot.set(result.snapshot);
        const summary = `Recipes synchronized: ${result.added} added, ${result.updated} updated, ${result.removed} removed.`;
        const after = statusSchema.parse(await this.api.status());
        this.updatesAvailable.set(after.collectionRevision !== result.snapshot.collectionRevision);
        this.status(this.updatesAvailable() ? `${summary} More changes are available; check again shortly.` : summary, 'success');
      } else {
        this.status('Recipes are up to date.');
      }
    } catch (error) {
      this.reachable.set(false);
      this.updatesAvailable.set(false);
      const messages: Record<string, string> = {
        unauthorized: 'The server rejected this build\'s mobile key.',
        rate_limited: 'The server is busy. Please try again later.',
        server_unavailable: 'Server synchronization is disabled or temporarily unavailable.',
        tls_failed: 'The home server\'s certificate is not trusted on this device. Downloaded recipes are unchanged.',
      };
      if (error instanceof MobileApiError && error.code === 'unreachable') {
        this.status('Home server not reachable. Downloaded recipes are still available.');
      } else {
        this.status(error instanceof MobileApiError
          ? messages[error.code] ?? 'The server could not complete synchronization. Downloaded recipes are unchanged.'
          : 'Synchronization failed before saving. The last saved recipes remain available.', 'error');
      }
      if (error instanceof MobileApiError) {
        this.serverRetryAt = Math.max(this.serverRetryAt, Date.now() + error.retryAfterSeconds * 1000);
      }
    } finally {
      this.busy.set(false);
    }
  }

  markRead(): void {
    this.unread.set(false);
  }

  /** Updates the current status; a notice kind also records it and flags it as unread. */
  private status(text: string, kind?: NoticeKind): void {
    const time = new Date().toISOString();
    this.message.set(text);
    this.messageTime.set(time);
    if (!kind) {
      return;
    }
    const [latest, ...older] = this.notices();
    if (latest?.text === text) {
      this.notices.set([{ ...latest, time }, ...older]);
      return;
    }
    this.notices.set([{ text, kind, time }, ...this.notices()].slice(0, MAX_NOTICES));
    this.unread.set(true);
  }
}