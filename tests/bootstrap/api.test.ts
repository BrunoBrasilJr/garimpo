import { createServer } from 'node:http';
import { afterEach, expect, test } from 'vitest';
import type { Server } from 'node:http';
import { createApp } from '../../apps/api/src/app';

const servers: Server[] = [];
afterEach(async () => {
  await Promise.all(servers.splice(0).map(server => new Promise<void>((resolve, reject) => {
    server.close(error => error ? reject(error) : resolve());
    server.closeAllConnections();
  })));
});

test('bootstrap serves health over a real local socket and exposes no business route', async () => {
  const server = createServer(createApp());
  servers.push(server);
  await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve));
  const address = server.address();
  if (!address || typeof address === 'string') throw new Error('Expected TCP address.');
  const base = `http://127.0.0.1:${address.port}`;
  const health = await fetch(`${base}/health`);
  expect(health.status).toBe(200);
  expect(await health.json()).toEqual({ status: 'ok', service: 'garimpo-api' });
  expect(health.headers.has('x-powered-by')).toBe(false);
  expect((await fetch(`${base}/api/v1/orders`)).status).toBe(404);
});
