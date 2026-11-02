import { expect, test } from 'vitest';
import { spawn } from 'node:child_process';
import { createServer } from 'node:net';
import { once } from 'node:events';

for (const mode of ['source', 'compiled'] as const) test(`actual API ${mode} entry serves health and preserves HTTPS guards`, async () => {
  const probe = createServer(); await new Promise<void>(resolve => probe.listen(0, '127.0.0.1', resolve));
  const address = probe.address(); if (!address || typeof address === 'string') throw new Error('Expected loopback port.');
  const port = address.port; await new Promise<void>(resolve => probe.close(() => resolve()));
  const env = { ...process.env, PORT: String(port), HOST: '127.0.0.1' };
  // This probe needs no data or local mailbox; leave the parent's environment intact.
  for (const key of ['DATABASE_URL', 'TEST_DATABASE_URL', 'TLS_CERT_PATH', 'TLS_KEY_PATH', 'GARIMPO_MESSAGE_MODE']) delete (env as Record<string, string | undefined>)[key];
  const child = spawn(process.execPath, mode === 'source' ? ['--experimental-strip-types', 'apps/api/src/server.ts'] : ['apps/api/dist/server.js'], { env, stdio: ['ignore', 'pipe', 'pipe'] });
  const closed = once(child, 'close'); let output = '';
  child.stdout.on('data', value => { output += String(value); }); child.stderr.on('data', value => { output += String(value); });
  try {
    let ready = false;
    for (let i = 0; i < 100; i++) {
      if (child.exitCode !== null) throw new Error('API process exited before listening. ' + output);
      try { const response = await fetch(`http://127.0.0.1:${port}/health`); if (response.ok) { expect(await response.json()).toMatchObject({ status: 'ok', service: 'garimpo-api' }); ready = true; break; } } catch { /* Readiness poll, bounded below. */ }
      await new Promise(resolve => setTimeout(resolve, 30));
    }
    expect(ready, 'Actual process must listen. ' + output).toBe(true);
    const denied = await fetch(`http://127.0.0.1:${port}/api/v1/me/wishlist`); expect(denied.status).toBe(403); expect(await denied.json()).toMatchObject({ code: 'HTTPS_REQUIRED' });
  } finally { child.kill('SIGTERM'); await closed; }
});
