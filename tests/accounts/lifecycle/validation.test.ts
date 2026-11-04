import { expect, test } from 'vitest';
import { closure, restriction, correction, reactivation, list, confirmation } from '../../../apps/api/src/modules/accounts/blocking-validation.ts';
test('closure requires literal explicit confirmation and rejects invented identity, role and erase fields', () => {
  expect(closure.safeParse({ confirm: true }).success).toBe(true);
  for (const value of [{}, { confirm: 'true' }, { confirm: false }, { confirm: true, erase: true }, { confirm: true, userId: 'other' }]) expect(closure.safeParse(value).success).toBe(false);
});
test('customer mutations require a bounded real reason/revision and do not accept authority or current email replacement', () => {
  const revision = 'a'.repeat(64);
  expect(restriction.safeParse({ revision, reason: 'Motivo sintético' }).success).toBe(true);
  for (const value of [{ reason: 'Sem revisão' }, { revision, reason: '' }, { revision, reason: 'ok\0bad' }, { revision, reason: 'Texto', role: 'ADMIN' }]) expect(restriction.safeParse(value).success).toBe(false);
  expect(correction.parse({ revision, email: ' NEW@EXAMPLE.INVALID ' }).email).toBe('new@example.invalid');
  expect(correction.safeParse({ revision }).success).toBe(false); expect(correction.safeParse({ revision, closedAt: null }).success).toBe(false);
});
test('public reactivation is scoped to email/token and customer search is bounded without secret filters', () => {
  expect(reactivation.parse({ email: ' BUYER@EXAMPLE.INVALID ' }).email).toBe('buyer@example.invalid');
  expect(reactivation.safeParse({ email: 'buyer@example.invalid', unblock: true }).success).toBe(false);
  expect(confirmation.safeParse({ token: 'wrong' }).success).toBe(false);
  expect(list.safeParse({ pageSize: 1000 }).success).toBe(false); expect(list.safeParse({ passwordHash: 'secret' }).success).toBe(false);
});
