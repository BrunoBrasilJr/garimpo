import { createServer, request as secureRequest } from 'node:https';
import { createServer as plainServer, request as plainRequest } from 'node:http';
import { mkdtempSync, readFileSync, chmodSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { createApp } from '../../apps/api/src/app.ts';
import type { CatalogOptions } from '../../apps/api/src/modules/catalog/router.ts';
import type { ReviewOptions } from '../../apps/api/src/modules/reviews/router.ts';
import type { CheckoutOptions } from '../../apps/api/src/modules/cart/router.ts';
import type { PaymentOptions } from '../../apps/api/src/modules/payments/router.ts';

export const origin = 'https://localhost:5173';
export interface Reply<T> { status: number; body: T; raw: Buffer; cookie: string; csrf: string; headers: import('node:http').IncomingHttpHeaders }
export const web = (reply: Pick<Reply<unknown>, 'cookie' | 'csrf'>) => ({ Origin: origin, Cookie: reply.cookie, 'X-CSRF-Token': reply.csrf });
export async function openCatalogServer(options: CatalogOptions, reviews?: ReviewOptions, checkout?: CheckoutOptions, payments?: PaymentOptions) {
  const directory = mkdtempSync(join(tmpdir(), 'garimpo-catalog-http-'));
  const key = join(directory, 'server.key'), cert = join(directory, 'server.pem');
  execFileSync('openssl', ['req', '-x509', '-newkey', 'rsa:2048', '-nodes', '-days', '1', '-keyout', key,
    '-out', cert, '-subj', '/CN=localhost', '-addext', 'subjectAltName=DNS:localhost,IP:127.0.0.1'], { stdio: 'ignore' });
  chmodSync(key, 0o600); const ca = readFileSync(cert);
  const app = createApp(options, undefined, options, reviews, checkout, payments), secure = createServer({ key: readFileSync(key), cert: ca }, app), plain = plainServer(app);
  await Promise.all([secure, plain].map(server => new Promise<void>(resolve => { server.listen(0, '127.0.0.1', resolve); })));
  return {
    async call<T = Record<string, unknown>>(path: string, method = 'GET', payload?: unknown, headers: Record<string, string> = {}, plaintext = false): Promise<Reply<T>> {
      const body = payload === undefined ? undefined : Buffer.isBuffer(payload) ? payload : Buffer.from(JSON.stringify(payload));
      const address = (plaintext ? plain : secure).address(); if (!address || typeof address === 'string') throw new Error('Missing TCP listener.');
      return new Promise((resolve, reject) => {
        const request = (plaintext ? plainRequest : secureRequest)({ hostname: '127.0.0.1', port: address.port, path: '/api/v1' + path,
          method, ca, agent: false, headers: { ...(body ? { 'Content-Type': Buffer.isBuffer(payload) ? 'application/octet-stream' : 'application/json', 'Content-Length': body.length } : {}), ...headers }
        }, response => {
          const chunks: Buffer[] = [];
          response.on('data', chunk => chunks.push(Buffer.from(chunk)));
          response.on('end', () => {
            const raw = Buffer.concat(chunks), pairs = (response.headers['set-cookie'] ?? []).map(value => value.split(';')[0]!);
            resolve({ status: response.statusCode ?? 0, body: (raw.length && response.headers['content-type']?.includes('application/json') ? JSON.parse(raw.toString()) : null) as T,
              raw, headers: response.headers, cookie: pairs.join('; '), csrf: pairs.find(value => value.startsWith('__Host-garimpo-csrf='))?.split('=')[1] ?? '' });
          });
        });
        request.on('error', reject); if (body) request.write(body); request.end();
      });
    },
    async close() { await Promise.all([secure, plain].map(server => new Promise<void>((resolve, reject) => { server.close(error => error ? reject(error) : resolve()); server.closeAllConnections(); }))); }
  };
}
