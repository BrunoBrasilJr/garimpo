import { createRequire } from 'node:module';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { expect, test } from 'vitest';

const require = createRequire(import.meta.url);
const root = fileURLToPath(new URL('../../../', import.meta.url));
const { minimatch } = require('minimatch');
const { glob } = require('glob');

test('corrected minimatch preserves brace/extglob and exclusion behavior used by tooling', () => {
  expect(minimatch('apps/web/src/main.tsx', 'apps/**/!(*.test).{ts,tsx}')).toBe(true);
  expect(minimatch('apps/web/src/main.test.tsx', 'apps/**/!(*.test).{ts,tsx}')).toBe(false);
  expect(minimatch('tests/bootstrap/security/forge.test.ts', '**/*.test.ts')).toBe(true);
});

test('adversarial globparts preprocessing remains bounded in an isolated process', () => {
  const child = spawnSync(process.execPath, ['-e', `
    const { Minimatch } = require('minimatch');
    new Minimatch('a/' + '**/../'.repeat(24) + 'b', { optimizationLevel: 2 }).match('a/b');
  `], { cwd: root, encoding: 'utf8', timeout: 5000 });
  expect(child.error).toBeUndefined();
  expect(child.signal).toBeNull();
  expect(child.status).toBe(0);
});

test('corrected glob enumerates actual test files and rejects an aborted walk', async () => {
  const files = await glob('tests/bootstrap/security/*.test.ts', { cwd: root, nodir: true });
  expect(files).toContain('tests/bootstrap/security/forge.test.ts');
  expect(files).toContain('tests/bootstrap/security/deepmerge.test.ts');
  const controller = new AbortController(); controller.abort();
  await expect(glob('**/*', { cwd: root, signal: controller.signal })).rejects.toMatchObject({ name: 'AbortError' });
});

test('real Expo config loader still resolves the SDK 57 project with reviewed transitive dependencies', () => {
  const { getConfig } = require('@expo/config');
  const config = getConfig(fileURLToPath(new URL('../../../apps/mobile/', import.meta.url)));
  expect(config.exp.name).toBe('Garimpo');
  expect(config.exp.slug).toBe('garimpo');
  expect(config.exp.platforms).toEqual(['android', 'ios']);
});
