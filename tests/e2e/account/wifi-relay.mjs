import { createServer, request as upstreamRequest } from 'node:https';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

// The public test origin exposes only the mobile customer's existing API.
function allowed(method, path) {
  if (method === 'POST' && /^\/api\/v1\/auth\/(register|login|refresh|logout|password-reset(?:\/confirm)?|email-verification(?:\/confirm)?|email-change\/confirm)$/.test(path)) return true;
  if (path === '/api/v1/me') return ['GET', 'PATCH'].includes(method);
  if (path === '/api/v1/me/email-change') return method === 'POST';
  if (path === '/api/v1/me/addresses') return ['GET', 'POST'].includes(method);
  return ['PATCH', 'DELETE'].includes(method) && /^\/api\/v1\/me\/addresses\/[a-f0-9-]{36}$/.test(path);
}
export async function startWifiRelay(app) {
  const ca = readFileSync(app.caPath);
  const server = createServer({ key: readFileSync(resolve(app.directory, 'server.key')), cert: readFileSync(resolve(app.directory, 'server.pem')) }, (request, response) => {
    if (request.headers['x-garimpo-client'] !== 'mobile' || !allowed(request.method ?? '', request.url ?? '')) {
      response.writeHead(404, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }); response.end('{"message":"Not found"}'); return;
    }
    const headers = { ...request.headers, host: new URL(app.origin).host };
    // Cookies are a web credential and must never cross this mobile-only relay.
    delete headers.cookie;
    const upstream = upstreamRequest(new URL(request.url, app.origin), { method: request.method, headers, ca, rejectUnauthorized: true, timeout: 15000 }, incoming => {
      const outgoing = { ...incoming.headers }; delete outgoing['set-cookie'];
      response.writeHead(incoming.statusCode ?? 502, outgoing); incoming.pipe(response);
    });
    upstream.on('timeout', () => upstream.destroy(new Error('Upstream timeout')));
    upstream.on('error', () => { if (!response.headersSent) response.writeHead(502, { 'Content-Type': 'application/json' }); response.end('{"message":"Test connection unavailable"}'); });
    request.on('aborted', () => upstream.destroy()); request.pipe(upstream);
  });
  await new Promise((resolve, reject) => { server.once('error', reject); server.listen(0, '127.0.0.1', resolve); });
  const address = server.address();
  if (!address || typeof address === 'string') throw new Error('TCP relay required.');
  return { origin: `https://localhost:${address.port}`, close: () => new Promise((resolve, reject) => {
    server.close(error => error ? reject(error) : resolve()); server.closeAllConnections();
  }) };
}
