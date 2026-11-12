import { Injectable } from '@angular/core';
import { CapacitorHttp } from '@capacitor/core';
import { z } from 'zod';
import { SyncApi } from './mobile-sync';

const configurationSchema = z.object({
  apiBase: z.literal('https://recipes.baileysoft.lan/api'),
  mobileKey: z.string().min(32).max(1024),
});

export class MobileApiError extends Error {
  constructor(readonly code: string, readonly retryAfterSeconds = 30) {
    super(code);
  }
}

@Injectable({ providedIn: 'root' })
export class MobileApi implements SyncApi {
  private configuration?: z.infer<typeof configurationSchema>;

  async configure(): Promise<boolean> {
    try {
      const response = await fetch('assets/mobile-connection.json', { cache: 'no-store' });
      if (!response.ok) {
        return false;
      }
      const parsed = configurationSchema.safeParse(await response.json());
      this.configuration = parsed.success ? parsed.data : undefined;
      return !!this.configuration;
    } catch {
      return false;
    }
  }

  /** Host name of the configured API server, without scheme, port, or path. */
  serverName(): string | null {
    return this.configuration ? new URL(this.configuration.apiBase).hostname : null;
  }

  status(): Promise<unknown> {
    return this.request('GET', 'status');
  }

  manifest(): Promise<unknown> {
    return this.request('GET', 'manifest');
  }

  bodies(ids: number[]): Promise<unknown> {
    return this.request('POST', 'recipes', { ids });
  }

  private async request(method: 'GET' | 'POST', operation: string, data?: { ids: number[] }): Promise<unknown> {
    if (!this.configuration) {
      throw new MobileApiError('not_configured');
    }
    let response: Awaited<ReturnType<typeof CapacitorHttp.request>>;
    try {
      response = await CapacitorHttp.request({
        method,
        url: `${this.configuration.apiBase}/mobile/${operation}`,
        headers: { 'X-Kiosk-Mobile-Key': this.configuration.mobileKey, 'Content-Type': 'application/json', Accept: 'application/json' },
        data,
        connectTimeout: 10000,
        readTimeout: 20000,
        disableRedirects: true,
        responseType: 'json',
      });
    } catch (error) {
      // Certificate problems are configuration errors; other transport failures mean the server is out of reach.
      const detail = error && typeof error === 'object' ? `${(error as { code?: unknown }).code ?? ''} ${(error as { message?: unknown }).message ?? ''}` : '';
      throw new MobileApiError(/ssl|certificate|trust anchor/i.test(detail) ? 'tls_failed' : 'unreachable', 0);
    }
    if (response.status !== 200) {
      const retryHeader = Object.entries(response.headers).find(([name]) => name.toLowerCase() === 'retry-after')?.[1];
      const seconds = Number(retryHeader);
      const retryAfter = Number.isFinite(seconds) && seconds > 0 ? seconds
        : retryHeader ? Math.max(30, (Date.parse(retryHeader) - Date.now()) / 1000) : 30;
      const code = response.status === 401 ? 'unauthorized' : response.status === 429 ? 'rate_limited'
        : response.status === 503 ? 'server_unavailable' : 'server_error';
      throw new MobileApiError(code, Number.isFinite(retryAfter) ? retryAfter : 30);
    }
    return response.data;
  }
}