import { expect, test } from 'vitest';
import { MobileAccountClient } from '../../../apps/mobile/src/features/account/client';
test('confirmed closure clears device credentials without a logout request and never reuses the old access', async () => {
  let refresh: string | null = null; const requests: { path: string; authorization: string | null }[] = [];
  const client = new MobileAccountClient('https://example.invalid', { get: async () => refresh, set: async value => { refresh = value; }, clear: async () => { refresh = null; } }, async (value, init) => {
    const path = new URL(String(value)).pathname; requests.push({ path, authorization: new Headers(init?.headers).get('Authorization') });
    return path.endsWith('/auth/login') ? new Response(JSON.stringify({ accessToken: 'old-access', refreshToken: 'old-refresh', user: { context: 'CUSTOMER', role: 'USER' } }), { status: 200 }) : new Response(JSON.stringify({ code: 'INVALID_SESSION' }), { status: 401 });
  });
  await client.login('buyer@example.invalid', 'synthetic password'); await client.forgetClosedAccount();
  expect(refresh).toBeNull(); await expect(client.request('/me')).rejects.toMatchObject({ status: 401 }); expect(requests).toEqual([{ path: '/api/v1/auth/login', authorization: null }, { path: '/api/v1/me', authorization: null }]);
});
test('device cleanup failure remains visible and a retry can remove the revoked credential without contacting logout', async () => {
  let fail = true, refresh: string | null = 'already-revoked', requests = 0;
  const client = new MobileAccountClient('https://example.invalid', { get: async () => refresh, set: async value => { refresh = value; }, clear: async () => { if (fail) throw new Error('synthetic secure store failure'); refresh = null; } }, async () => { requests++; throw new Error('Unexpected network call.'); });
  await expect(client.forgetClosedAccount()).rejects.toMatchObject({ status: 0 }); fail = false; await client.forgetClosedAccount(); expect(refresh).toBeNull(); expect(requests).toBe(0);
});
