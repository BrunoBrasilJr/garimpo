import { expect, test } from 'vitest';
import { quote, promoted } from '../../apps/api/src/modules/pricing/calculate';
import type { PriceUnit, PromotionRule, CouponRule } from '../../apps/api/src/modules/pricing/calculate';
const now = new Date('2026-11-02T18:00:00Z'), startsAt = new Date('2026-11-01T00:00:00Z'), endsAt = new Date('2026-12-01T00:00:00Z');
const unit = (id: string, cents: number, extra: Partial<PriceUnit> = {}): PriceUnit => ({ id, offerId: id, editionId: 'edition-' + id, genreIds: ['genre-' + id], basePriceCents: cents, ...extra });
const promo = (id: string, type: 'PERCENT' | 'FIXED', amount: number, offerIds = ['a']): PromotionRule => ({ id, type, amount, offerIds, active: true, startsAt, endsAt });
const coupon = (extra: Partial<CouponRule> = {}): CouponRule => ({ id: 'coupon', type: 'FIXED', amount: 100, minimumEligibleCents: 0, allowPromotional: true, targets: [], active: true, startsAt, endsAt, ...extra });

test('overlapping percentage/fixed promotions choose the lowest result without stacking', () => {
  const result = quote([unit('a', 10000)], [promo('percent', 'PERCENT', 2000), promo('fixed', 'FIXED', 1500)], null, now);
  expect(result.units[0]).toMatchObject({ promotionalPriceCents: 8000, promotionId: 'percent', netPriceCents: 8000 }); expect(result.totalCents).toBe(8000);
});
test('promotion boundaries are start-inclusive and end-exclusive, and inactive/scheduled rules do not apply', () => {
  const rule = promo('p', 'FIXED', 100);
  expect(promoted(unit('a', 500), [rule], startsAt).priceCents).toBe(400); expect(promoted(unit('a', 500), [rule], endsAt).priceCents).toBe(500);
  expect(promoted(unit('a', 500), [{ ...rule, active: false }], now).priceCents).toBe(500);
  expect(promoted(unit('a', 500), [{ ...rule, startsAt: new Date(now.getTime() + 1) }], now).priceCents).toBe(500);
});
test('basis points truncate fractional cents exactly rather than using a floating price', () => {
  expect(promoted(unit('a', 101), [promo('p', 'PERCENT', 333)], now).priceCents).toBe(98);
  expect(quote([unit('a', 3)], [], coupon({ type: 'PERCENT', amount: 5000 }), now).couponDiscountCents).toBe(1);
});
test('fixed promotion never makes a negative price and zero subtotal does not divide by zero', () => {
  const result = quote([unit('a', 50)], [promo('p', 'FIXED', 1000)], coupon(), now); expect(result.totalCents).toBe(0); expect(result.couponDiscountCents).toBe(0); expect(result.units[0]!.netPriceCents).toBe(0);
});
test('equal promotion results have a stable winning ID regardless of input order', () => {
  const a = promo('a', 'FIXED', 100), b = promo('b', 'FIXED', 100);
  expect(promoted(unit('a', 500), [b, a], now).promotionId).toBe('a'); expect(promoted(unit('a', 500), [a, b], now).promotionId).toBe('a');
});
test('coupon minimum considers only eligible products after promotions, excluding unrelated cart value', () => {
  const units = [unit('a', 10000), unit('b', 50000)], promotions = [promo('p', 'FIXED', 2000)];
  expect(() => quote(units, promotions, coupon({ minimumEligibleCents: 9000, targets: [{ kind: 'OFFER', id: 'a' }] }), now)).toThrow(/mínimo/);
  const result = quote(units, promotions, coupon({ amount: 99999, minimumEligibleCents: 8000, targets: [{ kind: 'OFFER', id: 'a' }] }), now);
  expect(result.eligibleSubtotalCents).toBe(8000); expect(result.couponDiscountCents).toBe(8000); expect(result.totalCents).toBe(50000);
});
test('non-accumulating coupon excludes promotional units and leaves them at the winning promotion price', () => {
  const result = quote([unit('a', 1000), unit('b', 1000)], [promo('p', 'FIXED', 200)], coupon({ allowPromotional: false, type: 'PERCENT', amount: 5000 }), now);
  expect(result.eligibleSubtotalCents).toBe(1000); expect(result.units.map(item => item.netPriceCents)).toEqual([800, 500]); expect(result.totalCents).toBe(1300);
});
test('offer, edition and genre targets form a union without granting multiple discounts to the same unit', () => {
  const result = quote([unit('a', 100), unit('b', 200), unit('c', 300), unit('d', 400)], [], coupon({ type: 'PERCENT', amount: 5000, targets: [{ kind: 'OFFER', id: 'a' }, { kind: 'EDITION', id: 'edition-b' }, { kind: 'GENRE', id: 'genre-c' }, { kind: 'GENRE', id: 'genre-a' }] }), now);
  expect(result.eligibleSubtotalCents).toBe(600); expect(result.couponDiscountCents).toBe(300); expect(result.totalCents).toBe(700); expect(result.units.map(item => item.couponDiscountCents)).toEqual([50, 100, 150, 0]);
});
test('unrestricted coupon rates proportional shares by largest remainders and preserves every cent', () => {
  const result = quote([unit('a', 199), unit('b', 100)], [], coupon({ type: 'PERCENT', amount: 2000 }), now);
  expect(result.couponDiscountCents).toBe(59); expect(result.units.map(item => item.couponDiscountCents)).toEqual([39, 20]); expect(result.totalCents).toBe(240);
});
test('equal remainders use stable unit IDs, including when input order changes', () => {
  const items = [unit('b', 1), unit('a', 1), unit('c', 1)], rule = coupon({ amount: 1 });
  const amounts = (values: PriceUnit[]) => Object.fromEntries(quote(values, [], rule, now).units.map(item => [item.id, item.couponDiscountCents]));
  expect(amounts(items)).toEqual({ a: 1, b: 0, c: 0 }); expect(amounts([...items].reverse())).toEqual({ a: 1, b: 0, c: 0 });
});
test('large integer prices retain exact allocations and cannot create credit', () => {
  const result = quote([unit('a', 2147483647), unit('b', 2147483647)], [], coupon({ type: 'PERCENT', amount: 5000 }), now);
  expect(result.baseSubtotalCents).toBe(4294967294); expect(result.totalCents).toBe(2147483647); expect(result.units.map(item => item.couponDiscountCents)).toEqual([1073741824, 1073741823]);
  expect(result.units.reduce((sum, item) => sum + item.netPriceCents, 0)).toBe(result.totalCents);
});
test('duplicate unit identities, fractional/negative prices and invalid percentages fail rather than silently round', () => {
  for (const items of [[unit('a', 1), unit('a', 1)], [unit('a', -1)], [unit('a', 1.5)]]) expect(() => quote(items, [], null, now)).toThrow();
  expect(() => quote([unit('a', 100)], [promo('p', 'PERCENT', 10001)], null, now)).toThrow();
});
test('inactive or expired coupons and an empty matching target set are rejected', () => {
  expect(() => quote([unit('a', 100)], [], coupon({ active: false }), now)).toThrow();
  expect(() => quote([unit('a', 100)], [], coupon({ endsAt: now }), now)).toThrow();
  expect(() => quote([unit('a', 100)], [], coupon({ targets: [{ kind: 'EDITION', id: 'other' }] }), now)).toThrow();
});
