import { expect, test } from 'vitest';
import { randomUUID } from 'node:crypto';
import { orderDeadline } from '../../apps/api/src/modules/orders/service.ts';
import * as input from '../../apps/api/src/modules/orders/validation.ts';
test('pending deadlines start at order creation, preserving full thirty minutes and forty-eight hours in UTC', () => {
  const now = new Date('2026-11-02T23:59:59.999Z'); expect(orderDeadline('PIX', now).getTime() - now.getTime()).toBe(1800000); expect(orderDeadline('BOLETO', now).toISOString()).toBe('2026-11-04T23:59:59.999Z'); expect(now.toISOString()).toBe('2026-11-02T23:59:59.999Z');
});
test('quotes and order commands cannot carry caller prices, duplicate offers, overflow quantities or payment approval', () => {
  const offerId = randomUUID(), line = { offerId, quantity: 1 };
  expect(() => input.parse(input.quote, { items: [line, line], zip: '01000000' })).toThrow();
  expect(() => input.parse(input.quote, { items: [{ offerId, quantity: 1001 }], zip: '01000000' })).toThrow();
  expect(() => input.parse(input.quote, { items: [line], zip: '01000000', priceCents: 1 })).toThrow();
  const order = { checkoutId: randomUUID(), addressId: randomUUID(), version: 1, freightRevision: 'a'.repeat(64), method: 'PIX' };
  expect(input.parse(input.create, order).method).toBe('PIX'); expect(() => input.parse(input.create, { ...order, method: 'CARD' })).toThrow(); expect(() => input.parse(input.create, { ...order, approved: true })).toThrow();
});
