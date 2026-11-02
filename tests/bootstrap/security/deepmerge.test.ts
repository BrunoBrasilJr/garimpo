import { createRequire } from 'node:module';
import { expect, test } from 'vitest';

const require = createRequire(import.meta.url);
const merge = require('deepmerge') as (target: unknown, source: unknown, options?: unknown) => Record<string | symbol, unknown>;
const malicious = () => JSON.parse('{"__proto__":{"garimpoInheritedPrivilege":true},"name":"legitimate"}') as Record<string, unknown>;

test('deepmerge rejects source prototype poisoning when the target has no prototype', () => {
  const result = merge(Object.create(null), malicious());
  expect(Object.getPrototypeOf(result)).toBe(Object.prototype);
  expect(result['garimpoInheritedPrivilege']).toBeUndefined();
  expect(result['name']).toBe('legitimate');
});

test('deepmerge rejects prototype poisoning while copying the target itself', () => {
  const result = merge(malicious(), { enabled: true });
  expect(Object.getPrototypeOf(result)).toBe(Object.prototype);
  expect(result['garimpoInheritedPrivilege']).toBeUndefined();
  expect(result['enabled']).toBe(true);
});

test('deepmerge rejects nested prototype poisoning through a null placeholder', () => {
  const result = merge({ session: null }, { session: malicious() });
  expect(Object.getPrototypeOf(result['session'])).toBe(Object.prototype);
  expect((result['session'] as Record<string, unknown>)['garimpoInheritedPrivilege']).toBeUndefined();
  expect(({} as Record<string, unknown>)['garimpoInheritedPrivilege']).toBeUndefined();
});

test('packaged CommonJS and UMD entrypoints reject both source and target poisoning', () => {
  // index.js is upstream source, not a runnable package entrypoint: its build-only
  // dependency is intentionally not distributed. Its reviewed bytes are still verified.
  for (const entrypoint of ['deepmerge', 'deepmerge/dist/umd.js']) {
    const distribution = require(entrypoint) as typeof merge;
    for (const result of [distribution(Object.create(null), malicious()), distribution(malicious(), {})]) {
      expect(Object.getPrototypeOf(result)).toBe(Object.prototype);
      expect(result['garimpoInheritedPrivilege']).toBeUndefined();
    }
  }
});

test('deepmerge preserves nested config, arrays, symbols and custom merge without mutating inputs', () => {
  const symbol = Symbol('configuration');
  const target = { config: { enabled: true, paths: ['one'] }, name: { value: 'first' }, [symbol]: { left: 1 } };
  const source = { config: { paths: ['two'] }, name: { value: 'second' }, [symbol]: { right: 2 } };
  const result = merge(target, source, { customMerge: (key: string) => key === 'name' ? (a: { value: string }, b: { value: string }) => ({ value: a.value + ':' + b.value }) : undefined });
  expect(result['config']).toEqual({ enabled: true, paths: ['one', 'two'] });
  expect(result[symbol]).toEqual({ left: 1, right: 2 });
  expect(result['name']).toEqual({ value: 'first:second' });
  expect(target.config.paths).toEqual(['one']);
  expect(source.config.paths).toEqual(['two']);
});
