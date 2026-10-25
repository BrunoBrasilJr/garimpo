import { expect, test } from 'vitest';
import { hashPassword, verifyPassword, passwordParameters, tokenHash, secret, sameHash } from '../../apps/api/src/modules/accounts/credentials';
import { parse, registration } from '../../apps/api/src/modules/accounts/validation';

test('approved scrypt parameters, random salts, valid/wrong/unknown/malformed credentials', async () => {
  const password = 'Uma senha longa de teste!';
  const start = performance.now();
  const first = await hashPassword(password), second = await hashPassword(password);
  expect(first).not.toBe(second);
  expect(first).toMatch(/^scrypt\$1\$131072\$8\$1\$[0-9a-f]{32}\$[0-9a-f]{128}$/);
  expect(first).not.toContain(password);
  expect(passwordParameters).toEqual({ N: 131072, r: 8, p: 1, maxmem: 268435456 });
  expect(await verifyPassword(password, first)).toBe(true);
  expect(await verifyPassword('wrong', first)).toBe(false);
  expect(await verifyPassword(password)).toBe(false);
  expect(await verifyPassword(password, 'scrypt$1$1$8$1$bad$bad')).toBe(false);
  console.info(`Scrypt validation elapsed: ${Math.round(performance.now() - start)} ms; approved cost preserved, no performance SLA inferred.`);
});
test('opaque tokens use 32 random bytes and hashes are separated by purpose', () => {
  const value = secret(); expect(value).toMatch(/^[\w-]{43}$/); expect(secret()).not.toBe(value);
  expect(sameHash(tokenHash('access', value), tokenHash('refresh', value))).toBe(false);
  expect(sameHash(tokenHash('access', value), tokenHash('access', value))).toBe(true);
  expect(sameHash('bad', 'bad')).toBe(false);
});
test('public registration rejects role/context injection and counts Unicode code points', () => {
  const input = { name: 'Teste', email: ' TESTE@example.invalid ', password: 'Uma senha longa de teste!' };
  expect(parse(registration, input).email).toBe('teste@example.invalid');
  for (const fields of [{ role: 'ADMIN' }, { context: 'STAFF' }, { emailVerifiedAt: new Date().toISOString() }]) {
    expect(() => parse(registration, { ...input, ...fields })).toThrow();
  }
  expect(() => parse(registration, { ...input, password: '😀'.repeat(8) })).toThrow();
});
