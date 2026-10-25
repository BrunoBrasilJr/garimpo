import { randomUUID } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const { Client } = createRequire(new URL('../../apps/api/package.json', import.meta.url))('pg');

const root = fileURLToPath(new URL('../../', import.meta.url));
const value = process.env.TEST_DATABASE_URL;
if (!value) throw new Error('Source the protected PostgreSQL environment first: TEST_DATABASE_URL is required.');
const url = new URL(value);
if (url.pathname !== '/garimpo_test' || !['localhost', '127.0.0.1'].includes(url.hostname)) {
  throw new Error('Integration tests require a separate loopback/garimpo_test database. No development fallback.');
}
const suite = process.argv[2] ?? 'core';
if (!['core', 'accounts', 'messaging'].includes(suite)) throw new Error('Unknown integration suite.');
const schema = `task${suite === 'core' ? '003' : suite === 'accounts' ? '004' : '005'}_${randomUUID().replaceAll('-', '')}`;
url.searchParams.set('schema', schema);
const admin = new Client({ connectionString: value });
try {
  await admin.connect();
  // Schema is generated internally from a UUID; no user input is interpolated.
  await admin.query(`CREATE SCHEMA "${schema}"`);
} finally {
  await admin.end();
}
console.info(`Isolated integration schema: ${schema}; retained for evidence, no reset/drop/truncate.`);
const env = { ...process.env, DATABASE_URL: url.href, TEST_DATABASE_URL: url.href };
for (const args of [
  ['node_modules/prisma/build/index.js', 'migrate', 'deploy', '--config', 'apps/api/prisma/prisma.config.ts'],
  ['node_modules/vitest/vitest.mjs', 'run', '--config', `tests/${suite}/vitest.integration.config.ts`]
]) {
  const result = spawnSync(process.execPath, args, { cwd: root, env, stdio: 'inherit' });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}
