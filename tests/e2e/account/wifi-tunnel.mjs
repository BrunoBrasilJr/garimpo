import { spawn } from 'node:child_process';
import { appendFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { homedir } from 'node:os';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { startWifiRelay } from './wifi-relay.mjs';

export async function startWifiTunnel(app) {
  if (process.env.NODE_TLS_REJECT_UNAUTHORIZED === '0') throw new Error('TLS verification must remain enabled.');
  const executable = resolve(homedir(), '.local/share/garimpo/cloudflared/cloudflared-2026.10.3');
  if (createHash('sha256').update(readFileSync(executable)).digest('hex') !== '053b80b0a23031a038fdbf3c073f59f82b8f1f152aa67971d7383ffafc0dbab0') throw new Error('Unexpected cloudflared bytes.');
  const relay = await startWifiRelay(app);
  const log = resolve(app.directory, 'tunnel.log');
  writeFileSync(log, '', { mode: 0o600 });
  const child = spawn(executable, ['tunnel', '--no-autoupdate', '--protocol', 'http2', '--url', relay.origin,
    '--origin-ca-pool', app.caPath, '--origin-server-name', 'localhost', '--no-tls-verify=false', '--loglevel', 'info'],
  { stdio: ['ignore', 'pipe', 'pipe'], env: { ...process.env, NO_TLS_VERIFY: 'false' } });
  let publicOrigin = '', buffer = '', failure;
  child.on('error', cause => { failure = cause; });
  const record = bytes => {
    const value = bytes.toString(); appendFileSync(log, value);
    buffer = (buffer + value).slice(-16000);
    publicOrigin ||= /https:\/\/[a-z0-9-]+\.trycloudflare\.com/.exec(buffer)?.[0] ?? '';
  };
  child.stdout.on('data', record); child.stderr.on('data', record);
  let closing;
  const close = () => closing ??= (async () => {
    if (child.pid && child.exitCode === null && child.signalCode === null) {
      const exited = new Promise(resolve => child.once('exit', resolve));
      child.kill('SIGTERM');
      const force = setTimeout(() => child.kill('SIGKILL'), 5000);
      try { await exited; } finally { clearTimeout(force); }
    }
    await relay.close();
    console.log('Túnel temporário encerrado.');
  })();
  try {
    for (let attempt = 0; attempt < 60; attempt++) {
      if (failure || child.exitCode !== null) throw new Error('Tunnel process failed. Inspect local tunnel.log.');
      if (publicOrigin) {
        try {
          const response = await fetch(publicOrigin + '/api/v1/me', { headers: { 'X-Garimpo-Client': 'mobile' }, signal: AbortSignal.timeout(5000) });
          const body = await response.json();
          if (response.status === 401 && body.code === 'INVALID_SESSION') {
            const denied = await fetch(publicOrigin + '/api/v1/demo/messages', { headers: { 'X-Garimpo-Client': 'mobile' }, signal: AbortSignal.timeout(5000) });
            if (denied.status !== 404) throw new Error('Technical route must not be public.');
            writeFileSync(resolve(app.directory, 'wifi.json'), JSON.stringify({ origin: publicOrigin, checked: new Date().toISOString(), tls: 'verified', mailbox: 'not exposed' }, null, 2), { mode: 0o600 });
            return { origin: publicOrigin, close };
          }
        } catch { /* Startup/DNS propagation: retry, never bypass TLS. */ }
      }
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    throw new Error('Tunnel did not become ready with verified HTTPS. Inspect local tunnel.log.');
  } catch (cause) { await close(); throw cause; }
}
