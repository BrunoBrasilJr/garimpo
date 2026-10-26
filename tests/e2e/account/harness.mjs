import { randomBytes, randomUUID } from 'node:crypto';
import { mkdirSync, writeFileSync, readFileSync, chmodSync } from 'node:fs';
import { resolve } from 'node:path';
import { execFileSync, spawnSync } from 'node:child_process';
import { createServer } from 'node:https';
import express from 'express';
import { Client } from 'pg';
import { createApp } from '../../../apps/api/src/app.ts';
import { createDatabase } from '../../../apps/api/src/persistence/client.ts';
import { Accounts } from '../../../apps/api/src/modules/accounts/service.ts';
import { firstAdmin, createStaff } from '../../../apps/api/src/modules/accounts/staff/service.ts';
import { MessageProtection } from '../../../apps/api/src/modules/messaging/protection.ts';
import { AccessMessages } from '../../../apps/api/src/modules/messaging/service.ts';
import { consumeRegistration, deliverNext } from '../../../apps/api/src/modules/messaging/worker.ts';
import { fixtureClock } from './clock.mjs';

export async function startHarness({ realtime = false } = {}) {
  const started = Date.now();
  const stage = name => console.log(`UI fixture ${name}: ${Date.now() - started}ms`);
  const value = process.env.TEST_DATABASE_URL;
  if (!value) throw new Error('Separate TEST_DATABASE_URL required.');
  const url = new URL(value);
  if (url.pathname !== '/garimpo_test' || !['127.0.0.1', 'localhost'].includes(url.hostname)) throw new Error('Only isolated loopback/garimpo_test accepted.');
  const schema = `task006_${randomUUID().replaceAll('-', '')}`;
  const setup = new Client({ connectionString: value });
  await setup.connect();
  try { await setup.query(`CREATE SCHEMA "${schema}"`); } finally { await setup.end(); }
  url.searchParams.set('schema', schema);
  const directory = resolve('test-results/account-ui', schema); mkdirSync(directory, { recursive: true, mode: 0o700 });
  const migration = spawnSync(process.execPath, ['node_modules/prisma/build/index.js', 'migrate', 'deploy', '--config', 'apps/api/prisma/prisma.config.ts'],
    { env: { ...process.env, DATABASE_URL: url.href }, encoding: 'utf8' });
  writeFileSync(resolve(directory, 'migration.log'), String(migration.stdout) + String(migration.stderr), { mode: 0o600 });
  if (migration.status !== 0) throw new Error('Fixture migration failed; inspect retained migration log.');
  stage('migrated');
  const caKey = resolve(directory, 'ca.key'), caPath = resolve(directory, 'ca.pem'), keyPath = resolve(directory, 'server.key'), certPath = resolve(directory, 'server.pem');
  const openssl = args => execFileSync('openssl', args, { stdio: 'ignore' });
  openssl(['req', '-x509', '-newkey', 'rsa:2048', '-nodes', '-days', '2', '-keyout', caKey, '-out', caPath, '-subj', '/CN=Garimpo isolated UI test CA',
    '-addext', 'basicConstraints=critical,CA:TRUE', '-addext', 'keyUsage=critical,keyCertSign,cRLSign']);
  openssl(['req', '-new', '-newkey', 'rsa:2048', '-nodes', '-keyout', keyPath, '-out', resolve(directory, 'server.csr'), '-subj', '/CN=localhost']);
  const publicHost = process.env.ACCOUNT_TEST_PUBLIC_HOST ?? 'localhost';
  if (!/^(localhost|(?:\d{1,3}\.){3}\d{1,3})$/.test(publicHost)) throw new Error('Fixture public host must be localhost or a LAN IPv4 address.');
  const extension = resolve(directory, 'server.ext');
  writeFileSync(extension, 'basicConstraints=critical,CA:FALSE\nkeyUsage=critical,digitalSignature,keyEncipherment\nextendedKeyUsage=serverAuth\nsubjectAltName=DNS:localhost,IP:127.0.0.1' + (publicHost !== 'localhost' ? ',IP:' + publicHost : '') + '\n', { mode: 0o600 });
  openssl(['x509', '-req', '-in', resolve(directory, 'server.csr'), '-CA', caPath, '-CAkey', caKey, '-CAcreateserial', '-out', certPath, '-days', '2', '-extfile', extension]);
  for (const path of [caKey, keyPath]) chmodSync(path, 0o600);
  stage('certificates');
  const db = createDatabase(url.href), { clock, advance } = fixtureClock(realtime);
  const accounts = new Accounts(db, clock), encryptionKey = randomBytes(32).toString('hex'), technicalSecret = randomBytes(32).toString('base64url');
  const adminEmail = `admin-${randomUUID()}@example.invalid`, adminPassword = randomBytes(24).toString('base64url');
  const operatorEmail = `operator-${randomUUID()}@example.invalid`, operatorPassword = randomBytes(24).toString('base64url');
  await firstAdmin(accounts, { name: 'Admin de teste', email: adminEmail, password: adminPassword });
  const signed = await accounts.login(adminEmail, adminPassword);
  await createStaff(accounts, signed.accessToken, { name: 'Operador de teste', email: operatorEmail, password: operatorPassword, role: 'OPERATOR' });
  stage('synthetic accounts');
  const web = express();
  const server = createServer({ key: readFileSync(keyPath), cert: readFileSync(certPath) }, web);
  const host = process.env.ACCOUNT_TEST_HOST ?? '127.0.0.1';
  if (!['127.0.0.1', '0.0.0.0'].includes(host)) throw new Error('Unsupported test listener.');
  const port = Number(process.env.ACCOUNT_TEST_PORT ?? 0);
  if (!Number.isInteger(port) || port < 0 || port > 65535) throw new Error('Invalid test port.');
  await new Promise((resolve, reject) => { server.once('error', reject); server.listen(port, host, resolve); });
  const address = server.address(); if (!address || typeof address === 'string') throw new Error('TCP listener required.');
  const origin = `https://${publicHost}:${address.port}`;
  const config = { db, clock, webOrigin: origin };
  web.use(createApp(config, { ...config, mode: 'local-test', encryptionKey, technicalSecret }));
  web.use((request, response, next) => {
    response.set('Content-Security-Policy', "default-src 'self'; script-src 'self'; style-src 'self'; connect-src 'self'; img-src 'self' data:; base-uri 'none'; frame-ancestors 'none'");
    response.set('Referrer-Policy', 'no-referrer'); response.set('X-Content-Type-Options', 'nosniff');
    next();
  });
  web.use(express.static(resolve('apps/web/dist')));
  const protection = new MessageProtection(encryptionKey, technicalSecret), messages = new AccessMessages(accounts, protection, origin);
  const credentials = { adminEmail, adminPassword, operatorEmail, operatorPassword };
  writeFileSync(resolve(directory, 'credentials.json'), JSON.stringify(credentials, null, 2), { mode: 0o600 });
  return {
    origin, directory, caPath, schema, credentials,
    advance,
    async customer() {
      const input = { name: 'Titular de teste', email: `${randomUUID()}@example.invalid`, password: randomBytes(24).toString('base64url') };
      return { input, user: await accounts.register(input) };
    },
    async message(recipient, type) {
      for (let index = 0; index < 100; index++) { const result = await consumeRegistration(messages); if (result === 'EMPTY') break; if (result === 'FAILED') throw new Error('Local preparation failed.'); }
      for (let index = 0; index < 100; index++) { const result = await deliverNext(messages); if (result === 'EMPTY') break; if (result === 'FAILED') throw new Error('Local delivery failed.'); }
      const rows = await db.demoMessage.findMany({ where: { type }, orderBy: [{ createdAt: 'desc' }, { id: 'desc' }] });
      for (const row of rows) {
        const body = JSON.parse(protection.open(row.id, row.restrictedBody));
        if (body.recipient === recipient) return { ...body, token: new URLSearchParams(new URL(body.link).hash.split('?')[1]).get('token') };
      }
      throw new Error('Expected protected message not found.');
    },
    async close() {
      await new Promise((resolve, reject) => { server.close(error => error ? reject(error) : resolve()); server.closeAllConnections(); });
      await db.$disconnect();
    }
  };
}
