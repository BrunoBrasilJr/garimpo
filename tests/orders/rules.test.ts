import { expect, test } from 'vitest';
import { calendarDay, dayStart, afterDay } from '../../apps/api/src/modules/orders/calendar.ts';
import { logistics, customerList, staffList, detail } from '../../apps/api/src/modules/orders/history-validation.ts';
test('calendar filters use São Paulo day boundaries with an exclusive end instead of UTC midnight', () => { expect(dayStart('2026-11-03').toISOString()).toBe('2026-11-03T03:00:00.000Z'); expect(afterDay('2026-11-03').toISOString()).toBe('2026-11-04T03:00:00.000Z'); });
test('calendar validation rejects normalized impossible dates and handles leap-day rollover', () => { for (const date of ['2026-02-30', '2026-2-03', '1899-12-31', '2026-11-03T00:00:00Z']) expect(calendarDay(date)).toBe(false); expect(afterDay('2024-02-29').toISOString()).toBe('2024-03-01T03:00:00.000Z'); });
test('own filters cannot select a different customer and all pages/periods are bounded and coherent', () => { expect(customerList.safeParse({ customerEmail: 'other@example.invalid' }).success).toBe(false); expect(staffList.parse({ customerEmail: ' BUYER@EXAMPLE.INVALID ' }).customerEmail).toBe('buyer@example.invalid'); expect(customerList.safeParse({ fromDate: '2026-11-04', throughDate: '2026-11-03' }).success).toBe(false); expect(customerList.safeParse({ pageSize: 1000 }).success).toBe(false); expect(detail.safeParse({ paymentPage: 0 }).success).toBe(false); });
test('manual logistics has separate original shipping and effective delivery commands without financial authority', () => {
  const common = { version: 2, reason: 'Etapa conferida pela equipe' };
  expect(logistics.safeParse({ ...common, status: 'PREPARING' }).success).toBe(true);
  expect(logistics.safeParse({ ...common, status: 'SHIPPED', trackingCode: 'SYNTHETIC-123', postedAt: '2026-11-03T12:00:00.000Z' }).success).toBe(true);
  expect(logistics.safeParse({ ...common, status: 'DELIVERED', deliveredAt: '2026-11-04T12:00:00.000Z' }).success).toBe(true);
  for (const status of ['PAID', 'CANCELLED', 'REFUNDED']) expect(logistics.safeParse({ ...common, status }).success).toBe(false);
});
test('tracking, versions and actual date formats are validated without accepting substitute/return shipments', () => {
  const value = { version: 1, status: 'SHIPPED', reason: 'Postagem efetiva', trackingCode: 'TEST-123', postedAt: '2026-11-03T12:00:00.000Z' };
  for (const patch of [{ version: 0 }, { trackingCode: '' }, { trackingCode: 'bad\nvalue' }, { postedAt: 'amanhã' }, { kind: 'SUBSTITUTE' }, { amountCents: 1 }, { deliveredAt: value.postedAt }]) expect(logistics.safeParse({ ...value, ...patch }).success).toBe(false);
});
