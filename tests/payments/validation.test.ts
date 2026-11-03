import { expect, test } from 'vitest';
import { randomUUID } from 'node:crypto';
import { card, charge, page, retry } from '../../apps/api/src/modules/payments/validation.ts';
const input = { version: 1, addressId: randomUUID(), freightRevision: 'a'.repeat(64), scenario: 'PENDING' };
test('card command uses accepted address/version and explicitly bounded simulator scenarios', () => {
  expect(card.safeParse(input).success).toBe(true);
  for (const extra of [{ amountCents: 1 }, { approved: true }, { now: '2099-01-01' }, { version: 0 }, { scenario: 'LATE' }]) expect(card.safeParse({ ...input, ...extra }).success).toBe(false);
});
test('charge and refund commands reject financial amounts, missing identities and extra privileges', () => {
  expect(charge.safeParse({ chargeId: randomUUID(), scenario: 'APPROVED' }).success).toBe(true);
  expect(charge.safeParse({ scenario: 'APPROVED' }).success).toBe(false);
  expect(retry.safeParse({ scenario: 'SUCCEEDED', authorized: true }).success).toBe(false);
});
test('activity pages have a bounded size and no customer-selected owner filter', () => {
  expect(page.parse({})).toEqual({ page: 1, pageSize: 10 });
  expect(page.safeParse({ pageSize: 31 }).success).toBe(false); expect(page.safeParse({ userId: randomUUID() }).success).toBe(false);
});
