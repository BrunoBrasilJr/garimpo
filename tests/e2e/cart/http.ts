import { request } from 'node:https';
import { readFileSync } from 'node:fs';
import type { startHarness } from '../account/harness.mjs';
type Harness = Awaited<ReturnType<typeof startHarness>>;
/** Test-side real HTTPS with the isolated CA, never ignoreHTTPSErrors or a public tunnel. */
export async function send<T = Record<string, unknown>>(app: Harness, path: string, method: string, body?: string, headers: Record<string, string> = {}) {
  return new Promise<{ status: number; body: T; raw: string; cookie: string; csrf: string }>((resolve, reject) => {
    const call = request(app.origin + '/api/v1' + path, { method, ca: readFileSync(app.caPath), rejectUnauthorized: true, agent: false,
      headers: { Origin: app.origin, ...(body === undefined ? {} : { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) }), ...headers } }, response => {
      const chunks: Buffer[] = []; response.on('data', chunk => chunks.push(Buffer.from(chunk))); response.on('end', () => {
        const raw = Buffer.concat(chunks).toString('utf8'), pairs = (response.headers['set-cookie'] ?? []).map(value => value.split(';')[0]!);
        resolve({ status: response.statusCode ?? 0, body: (raw ? JSON.parse(raw) : undefined) as T, raw, cookie: pairs.join('; '), csrf: pairs.find(value => value.startsWith('__Host-garimpo-csrf='))?.split('=')[1] ?? '' });
      });
    }); call.on('error', reject); call.end(body);
  });
}
export async function session(app: Harness, email: string, password: string) {
  const login = await send(app, '/auth/login', 'POST', JSON.stringify({ email, password })); if (login.status !== 200) throw new Error('Isolated role login rejected: ' + login.status);
  return { call: <T = Record<string, unknown>>(path: string, method = 'GET', body?: unknown, key?: string) => send<T>(app, path, method, body === undefined ? undefined : JSON.stringify(body), {
    Cookie: login.cookie, 'X-CSRF-Token': login.csrf, ...(key ? { 'Idempotency-Key': key } : {})
  }) };
}
export function forwarded(headers: Record<string, string>) { return Object.fromEntries(Object.entries(headers).filter(([key]) => ['origin', 'cookie', 'x-csrf-token', 'content-type', 'idempotency-key', 'x-garimpo-account', 'x-garimpo-client', 'authorization'].includes(key.toLowerCase()))); }
