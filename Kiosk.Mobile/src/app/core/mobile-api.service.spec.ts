import { CapacitorHttp } from '@capacitor/core';
import { vi } from 'vitest';
import { MobileApi } from './mobile-api.service';

vi.mock('@capacitor/core', () => ({
  CapacitorHttp: { request: vi.fn() },
}));

describe('MobileApi', () => {
  const mobileKey = 'synthetic-test-mobile-key-not-a-secret';

  afterEach(() => { vi.resetAllMocks(); vi.unstubAllGlobals(); });

  async function configuredApi(): Promise<MobileApi> {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({ apiBase: 'https://recipes.baileysoft.lan/api', mobileKey }) }));
    const api = new MobileApi();
    expect(api.serverName()).toBeNull();
    expect(await api.configure()).toBe(true);
    expect(api.serverName()).toBe('recipes.baileysoft.lan');
    return api;
  }

  it('uses the exact API base, native HTTP, bounded timeouts, and no redirects', async () => {
    const api = await configuredApi();
    const request = vi.mocked(CapacitorHttp.request).mockResolvedValue({ status: 200, data: {}, headers: {}, url: '' });
    await api.bodies([1]);
    expect(request).toHaveBeenCalledWith(expect.objectContaining({
      url: 'https://recipes.baileysoft.lan/api/mobile/recipes', method: 'POST', data: { ids: [1] },
      disableRedirects: true, connectTimeout: 10000, readTimeout: 20000,
      headers: expect.objectContaining({ 'X-Kiosk-Mobile-Key': mobileKey }),
    }));
  });

  it('fails closed without configuration and never contacts the server', async () => {
    const request = vi.mocked(CapacitorHttp.request);
    await expect(new MobileApi().status()).rejects.toThrow('not_configured');
    expect(request).not.toHaveBeenCalled();
  });

  it('surfaces retry-after without exposing server payloads or credentials', async () => {
    const api = await configuredApi();
    vi.mocked(CapacitorHttp.request).mockResolvedValue({ status: 429, data: 'private server message', headers: { 'Retry-After': '120' }, url: '' });
    await expect(api.status()).rejects.toMatchObject({ code: 'rate_limited', retryAfterSeconds: 120, message: 'rate_limited' });
  });

  it('separates certificate failures from an unreachable server', async () => {
    const api = await configuredApi();
    vi.mocked(CapacitorHttp.request).mockRejectedValueOnce({ code: 'SSLHandshakeException', message: 'Trust anchor for certification path not found.' });
    await expect(api.status()).rejects.toMatchObject({ code: 'tls_failed' });
    vi.mocked(CapacitorHttp.request).mockRejectedValueOnce({ code: 'UnknownHostException', message: 'Unable to resolve host' });
    await expect(api.status()).rejects.toMatchObject({ code: 'unreachable' });
  });
});