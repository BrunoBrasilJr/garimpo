import { randomUUID } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { Client } from 'pg';

if (!process.env.TEST_DATABASE_URL) throw new Error('Private separate TEST_DATABASE_URL required');
const url = new URL(process.env.TEST_DATABASE_URL);
if (url.pathname !== '/garimpo_test' || !['127.0.0.1', 'localhost'].includes(url.hostname)) throw new Error('Isolated test database required');
const schema = 'task030_' + randomUUID().replaceAll('-', '');
const client = new Client({ connectionString: url.href });
await client.connect();
try { await client.query('CREATE SCHEMA "' + schema + '"'); }
finally { await client.end(); }
url.searchParams.set('schema', schema);
const env = { ...process.env, DATABASE_URL: url.href, TEST_DATABASE_URL: url.href };
for (const args of [
  ['node_modules/prisma/build/index.js', 'migrate', 'deploy', '--config', 'apps/api/prisma/prisma.config.ts'],
  ['node_modules/vitest/vitest.mjs', 'run', '--config', 'tests/operations/restore/vitest.config.ts']
]) {
  const result = spawnSync(process.execPath, args, { env, stdio: 'inherit' });
  if (result.error || result.status !== 0) process.exit(result.status ?? 1);
}
