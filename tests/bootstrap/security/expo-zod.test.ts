import { createRequire } from 'node:module';
import { expect, test } from 'vitest';

const require = createRequire(import.meta.url);
const cliRequire = createRequire(require.resolve('@expo/cli/package.json'));
const zodVersion = cliRequire('zod/package.json').version;
const { PluginSchema, DevToolsPluginOutputSchema } = cliRequire('./build/src/start/server/DevToolsPlugin.schema.js');

test('Expo CLI resolves the corrected Zod version', () => {
  expect(zodVersion).toBe('4.6.7');
});

test('real Expo plugin schema accepts valid metadata and rejects invalid input', () => {
  expect(PluginSchema.safeParse({ packageName: 'fixture-plugin', packageRoot: '/fixture' }).success).toBe(true);
  expect(PluginSchema.safeParse({ packageName: '', packageRoot: '/fixture' }).success).toBe(false);
  expect(PluginSchema.safeParse({ packageName: 'fixture-plugin', packageRoot: '/fixture', cliExtensions: { description: 'fixture', commands: [], entryPoint: 'index.js' } }).success).toBe(false);
});

test('real Expo output schema preserves validation with corrected Zod', () => {
  expect(DevToolsPluginOutputSchema.safeParse([{ type: 'text', text: 'fixture', level: 'info' }]).success).toBe(true);
  expect(DevToolsPluginOutputSchema.safeParse([{ type: 'text', text: 123 }]).success).toBe(false);
});
