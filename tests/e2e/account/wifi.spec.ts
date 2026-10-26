import { request } from 'node:https';
import { readFileSync } from 'node:fs';
import { test, expect } from './fixtures';
import { startWifiRelay } from './wifi-relay.mjs';

test('temporary mobile relay verifies real HTTPS, authenticates customers and excludes staff, mailbox and local files', async ({ app }) => {
  const relay = await startWifiRelay(app);
  const send = (path: string, method = 'GET', body?: unknown, mobile = true) => new Promise<{ status: number; body: Record<string, unknown>; cookies: unknown }>((resolve, reject) => {
    const call = request(relay.origin + path, { method, ca: readFileSync(app.caPath), rejectUnauthorized: true,
      headers: { ...(mobile ? { 'X-Garimpo-Client': 'mobile' } : {}), ...(body ? { 'Content-Type': 'application/json' } : {}) } }, response => {
      let data = ''; response.setEncoding('utf8'); response.on('data', chunk => { data += chunk; });
      response.on('end', () => resolve({ status: response.statusCode ?? 0, body: data ? JSON.parse(data) as Record<string, unknown> : {}, cookies: response.headers['set-cookie'] }));
    });
    call.on('error', reject); call.end(body ? JSON.stringify(body) : undefined);
  });
  try {
    expect((await send('/api/v1/me')).status).toBe(401);
    expect((await send('/api/v1/me', 'GET', undefined, false)).status).toBe(404);
    for (const path of ['/api/v1/demo/messages', '/api/v1/admin/staff', '/server.key', '/test-results/account-ui/credentials.json', '/api/v1/me?extra=value']) expect((await send(path)).status).toBe(404);
    const customer = await app.customer();
    const signed = await send('/api/v1/auth/login', 'POST', { email: customer.input.email, password: customer.input.password });
    expect(signed.status).toBe(200); expect(signed.cookies).toBeUndefined();
    expect(signed.body).toMatchObject({ user: { role: 'USER', context: 'CUSTOMER' } });
    expect(typeof signed.body.refreshToken).toBe('string'); expect(typeof signed.body.accessToken).toBe('string');
    expect((await send('/api/v1/auth/logout', 'POST', { refreshToken: signed.body.refreshToken })).status).toBe(204);
  } finally { await relay.close(); }
});
