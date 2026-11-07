import { randomUUID } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
const { Client } = createRequire(new URL('../../apps/api/package.json', import.meta.url))('pg');

export async function isolated(namespace, config, pattern) {
  const value = process.env.TEST_DATABASE_URL;
  if (!value) throw new Error('Private separate TEST_DATABASE_URL required.');
  const url = new URL(value);
  if (url.pathname !== '/garimpo_test' || !['127.0.0.1', 'localhost'].includes(url.hostname) || !/^\d{3}$/.test(namespace)) throw new Error('Only isolated loopback test database accepted.');
  const schema = 'task' + namespace + '_' + randomUUID().replaceAll('-', '');
  const client = new Client({ connectionString: value });
  try { await client.connect(); await client.query('CREATE SCHEMA "' + schema + '"'); }
  finally { await client.end(); }
  url.searchParams.set('schema', schema);
  console.info('Validation schema: ' + schema + '; retained, no original reset.');
  const env = { ...process.env, DATABASE_URL: url.href, TEST_DATABASE_URL: url.href };
  for (const args of [
    ['node_modules/prisma/build/index.js', 'migrate', 'deploy', '--config', 'apps/api/prisma/prisma.config.ts'],
    ['node_modules/vitest/vitest.mjs', 'run', '--config', config, ...(pattern ? ['--testNamePattern', pattern] : [])]
  ]) {
    const result = spawnSync(process.execPath, args, { env, stdio: 'inherit' });
    if (result.error || result.status !== 0) process.exit(result.status ?? 1);
  }
}
