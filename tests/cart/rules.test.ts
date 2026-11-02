import { expect, test } from 'vitest';
import { z } from 'zod';
import { CHECKOUT_MILLISECONDS, quantities, unitIdentity } from '../../apps/api/src/modules/cart/rules';
import { requirePendingCapacity } from '../../apps/api/src/modules/checkout/pending-orders';
import * as input from '../../apps/api/src/modules/cart/validation';

test('cart has no item deadline and bounded quantities cannot allocate an unbounded unit snapshot', () => {
  expect(CHECKOUT_MILLISECONDS).toBe(900000); expect(() => quantities([{ quantity: 1000 }])).not.toThrow();
  for (const quantity of [0, -1, 0.5, Infinity, 1001]) expect(() => quantities([{ quantity }])).toThrow();
  expect(() => quantities([{ quantity: 999 }, { quantity: 2 }])).toThrow(); expect(() => quantities(Array.from({ length: 101 }, () => ({ quantity: 1 })))).toThrow();
});
test('frozen unit identities are stable, distinct across lines/indices and accepted by the actual UUID schema', () => {
  const id = '6201cd77-f874-4b55-ae37-b3c264e4d064', values = Array.from({ length: 1000 }, (_, index) => unitIdentity(id, index));
  expect(new Set(values).size).toBe(1000); expect(values[9]).toBe(unitIdentity(id, 9)); expect(values[9]).not.toBe(unitIdentity('other-line', 9));
  for (const value of values) expect(z.string().uuid().safeParse(value).success).toBe(true);
});
test('pending-order capacity never treats absent, malformed or third pending order as free capacity', () => {
  for (const count of [0, 1, 2]) expect(() => requirePendingCapacity({ status: 'KNOWN', count })).not.toThrow();
  expect(() => requirePendingCapacity({ status: 'UNAVAILABLE' })).toThrow();
  for (const count of [-1, 0.5, NaN, 3, 4]) expect(() => requirePendingCapacity({ status: 'KNOWN', count })).toThrow();
});
test('wire rejects extra authority/prices, missing price confirmation, invalid keys and duplicate-free overflow', () => {
  const offerId = '6201cd77-f874-4b55-ae37-b3c264e4d064';
  expect(() => input.parse(input.reserve, { version: 1 })).toThrow();
  expect(() => input.parse(input.add, { version: 1, offerId, quantity: 1, priceCents: 1, userId: offerId })).toThrow();
  expect(() => input.parse(input.key, 'ambiguous,key')).toThrow(); expect(() => input.parse(input.merge, { version: 1, items: Array.from({ length: 101 }, () => ({ offerId, quantity: 1 })) })).toThrow();
  expect(input.parse(input.preview, { couponCode: '  disco_10 ' })).toEqual({ couponCode: 'DISCO_10' });
});
