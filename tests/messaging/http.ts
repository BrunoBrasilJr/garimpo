import { createServer as httpsServer, request as httpsRequest } from 'node:https';
import { createServer as httpServer, request as httpRequest } from 'node:http';
import type { IncomingHttpHeaders } from 'node:http';
import { mkdirSync, readFileSync, chmodSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { resolve } from 'node:path';
import { createApp } from '../../apps/api/src/app';
import type { AccountsOptions } from '../../apps/api/src/modules/accounts/router';
import type { MessagingOptions } from '../../apps/api/src/modules/messaging/config';

export const origin = 'https://localhost:5173';
export const mobile = (token?: string): Record<string, string> => ({ 'X-Garimpo-Client': 'mobile', ...(token ? { Authorization: `Bearer ${token}` } : {}) });
export interface Reply<T> { status: number; body: T; headers: IncomingHttpHeaders; cookie: string; csrf: string }
export const web = (reply: Pick<Reply<unknown>, 'cookie' | 'csrf'>): Record<string, string> => ({ Origin: origin, Cookie: reply.cookie, 'X-CSRF-Token': reply.csrf });

export async function openServer(options: AccountsOptions, messaging?: MessagingOptions) {
  const directory = resolve('test-results/messaging', randomUUID());
  mkdirSync(directory, { recursive: true, mode: 0o700 });
  const keyPath = resolve(directory, 'server.key'), certPath = resolve(directory, 'server.pem');
  execFileSync('openssl', ['req', '-x509', '-newkey', 'rsa:2048', '-nodes', '-days', '1', '-keyout', keyPath,
    '-out', certPath, '-subj', '/CN=localhost', '-addext', 'subjectAltName=DNS:localhost,IP:127.0.0.1'], { stdio: 'ignore' });
  chmodSync(keyPath, 0o600);
  const ca = readFileSync(certPath);
  const app = createApp({ ...options, webOrigin: origin }, messaging);
  const secure = httpsServer({ key: readFileSync(keyPath), cert: ca }, app);
  const plain = httpServer(app);
  await Promise.all([secure, plain].map(server => new Promise<void>(resolve => { server.listen(0, '127.0.0.1', resolve); })));
  function port(server: typeof secure | typeof plain) {
    const address = server.address();
    if (!address || typeof address === 'string') throw new Error('Missing TCP test listener.');
    return address.port;
  }
  return {
    async call<T = Record<string, unknown>>(path: string, method = 'GET', payload?: unknown, headers: Record<string, string> = mobile(), plaintext = false): Promise<Reply<T>> {
      const body = payload === undefined ? undefined : JSON.stringify(payload);
      return new Promise((resolve, reject) => {
        const request = (plaintext ? httpRequest : httpsRequest)({ hostname: '127.0.0.1', port: port(plaintext ? plain : secure),
          path: '/api/v1' + path, method, ca, agent: false,
          headers: { ...headers, ...(body === undefined ? {} : { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) }) }
        }, response => {
          const chunks: Buffer[] = [];
          response.on('data', chunk => chunks.push(Buffer.from(chunk)));
          response.on('end', () => {
            const text = Buffer.concat(chunks).toString('utf8');
            const pairs = (response.headers['set-cookie'] ?? []).map(value => value.split(';')[0]!);
            const csrf = pairs.find(value => value.startsWith('__Host-garimpo-csrf='))?.split('=')[1] ?? '';
            resolve({ status: response.statusCode ?? 0, body: (text && text !== 'No Content' ? JSON.parse(text) : null) as T,
              headers: response.headers, cookie: pairs.join('; '), csrf });
          });
        });
        request.on('error', reject);
        if (body !== undefined) request.write(body);
        request.end();
      });
    },
    async close() {
      await Promise.all([secure, plain].map(server => new Promise<void>((resolve, reject) => {
        server.close(error => error ? reject(error) : resolve()); server.closeAllConnections();
      })));
    }
  };
}
