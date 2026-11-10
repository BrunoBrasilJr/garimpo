import { spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import { createServer, request as httpsRequest } from 'node:https';
import { createWriteStream, readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { resolve } from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';

const id = '[a-f0-9-]{36}';
const customerRoutes = [
  ['POST', '/auth/(?:login|refresh|logout)'],
  ['GET', '/me'],
  ['GET', '/me/addresses'],
  ['GET', '/me/(?:wishlist|availability-alerts|cart|checkout|payment-attempts|orders|reviews)'],
  ['GET', '/me/(?:orders|payment-attempts|returns|exchanges)/' + id],
  ['POST', '/me/(?:availability-alerts|cart/items|cart/merge)'],
  ['PUT|DELETE', '/me/wishlist/' + id],
  ['DELETE', '/me/availability-alerts/' + id],
  ['PATCH|DELETE', '/me/cart/items/' + id],
  ['POST', '/(?:checkouts|checkout/quote|orders)'],
  ['PATCH', '/checkouts/' + id + '/address'],
  ['POST', '/checkouts/' + id + '/simulated-card-payments'],
  ['POST', '/orders/' + id + '/simulated-payments'],
  ['GET', '/orders/' + id + '/aftersales'],
  ['POST', '/orders/' + id + '/(?:returns|exchanges)'],
  ['POST', '/exchanges/' + id + '/substitute-offers/' + id + '/response'],
  ['POST', '/aftersales/' + id + '/evidence'],
  ['GET', '/aftersales/' + id + '/evidence/' + id]
].map(([method, path]) => new RegExp('^(?:' + method + ') /api/v1' + path + '$'));
const catalog = new RegExp('^/api/v1/(?:catalog/filters|editions(?:/' + id + '(?:/reviews)?)?)$');
const photo = new RegExp('^/api/v1/media/products/' + id + '\\.(?:jpg|png|webp)$');
const forwardedHeaders = ['authorization', 'accept', 'content-type', 'content-length', 'idempotency-key',
  'x-garimpo-client', 'x-garimpo-account'];

function reject(response, status) {
  if (!response.headersSent) response.writeHead(status, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' });
  response.end('{}');
}

export async function androidTunnel(app, directory) {
  if (process.env.NODE_TLS_REJECT_UNAUTHORIZED === '0') throw new Error('TLS must remain verified.');
  const executable = resolve(homedir(), '.local/share/garimpo/cloudflared/cloudflared-2026.10.3');
  const hash = createHash('sha256').update(readFileSync(executable)).digest('hex');
  if (hash !== '053b80b0a23031a038fdbf3c073f59f82b8f1f152aa67971d7383ffafc0dbab0') throw new Error('Unexpected cloudflared bytes.');
  const ca = readFileSync(app.caPath);
  const relay = createServer({ key: readFileSync(resolve(app.directory, 'server.key')), cert: readFileSync(resolve(app.directory, 'server.pem')) },
    (request, response) => {
      const [path] = (request.url ?? '').split('?'), method = request.method;
      const mobile = request.headers['x-garimpo-client'] === 'mobile';
      const publicRead = method === 'GET' && (photo.test(path) || (mobile && catalog.test(path)));
      if (!publicRead && (!mobile || !customerRoutes.some(rule => rule.test(method + ' ' + path)))) return reject(response, 404);
      const headers = Object.fromEntries(forwardedHeaders.filter(name => request.headers[name] !== undefined)
        .map(name => [name, request.headers[name]]));
      const upstream = httpsRequest(new URL(request.url, app.origin), { method, headers, ca, rejectUnauthorized: true, timeout: 20000 }, incoming => {
        const outgoing = { ...incoming.headers, 'cache-control': 'no-store' }; delete outgoing['set-cookie'];
        response.writeHead(incoming.statusCode ?? 502, outgoing); incoming.pipe(response);
      });
      upstream.on('timeout', () => upstream.destroy());
      upstream.on('error', () => reject(response, 502));
      request.on('aborted', () => upstream.destroy());
      request.pipe(upstream);
    });
  await new Promise((ready, fail) => { relay.once('error', fail); relay.listen(0, '127.0.0.1', ready); });
  const child = spawn(executable, ['tunnel', '--no-autoupdate', '--protocol', 'http2', '--url', 'https://localhost:' + relay.address().port,
    '--origin-ca-pool', app.caPath, '--origin-server-name', 'localhost', '--no-tls-verify=false'], { stdio: ['ignore', 'pipe', 'pipe'] });
  const log = createWriteStream(resolve(directory, 'android-tunnel.log'), { mode: 0o600 });
  let origin, failure, buffer = '', closing;
  child.once('error', error => { failure = error; });
  for (const stream of [child.stdout, child.stderr]) stream.on('data', bytes => {
    log.write(bytes);
    buffer = (buffer + bytes.toString()).slice(-12000);
    origin ||= /https:\/\/[a-z0-9-]+\.trycloudflare\.com/.exec(buffer)?.[0];
  });
  const close = () => closing ??= (async () => {
    clearTimeout(expiry);
    if (child.pid && child.exitCode === null && child.signalCode === null) {
      const exited = new Promise(done => child.once('exit', done));
      child.kill('SIGTERM');
      const timer = setTimeout(() => child.kill('SIGKILL'), 5000);
      try { await exited; } finally { clearTimeout(timer); }
    }
    await new Promise(done => { relay.close(done); relay.closeAllConnections(); });
    log.end();
  })();
  const expiry = setTimeout(() => { void close(); }, 45 * 60000);
  try {
    const headers = { 'X-Garimpo-Client': 'mobile' };
    for (let attempt = 0; attempt < 60; attempt++) {
      if (failure || child.exitCode !== null) throw new Error('Android tunnel failed.');
      if (origin) {
        const get = path => fetch(origin + path, { headers, signal: AbortSignal.timeout(5000) }).then(async reply => {
          await reply.arrayBuffer(); return reply.status;
        });
        const result = await Promise.all(['/catalog/filters', '/me', '/admin/staff', '/demo/messages', '/server.key']
          .map(path => get('/api/v1' + path))).catch(() => []);
        if (result.join(',') === '200,401,404,404,404') return { origin, close };
      }
      await delay(1000);
    }
    throw new Error('Android tunnel HTTPS probes failed.');
  } catch (error) { await close(); throw error; }
}
