import type { DiscountType, PriceQuote, PricingTarget } from '@garimpo/contracts';
import { PricingError } from './errors.ts';
export interface DiscountRule { type: DiscountType; amount: number }
export interface TimedDiscount extends DiscountRule { id: string; active: boolean; startsAt: Date; endsAt: Date }
export interface PromotionRule extends TimedDiscount { offerIds: string[] }
export interface CouponRule extends TimedDiscount { minimumEligibleCents: number; allowPromotional: boolean; targets: PricingTarget[] }
export interface PriceUnit { id: string; offerId: string; editionId: string; genreIds: string[]; basePriceCents: number }
const invalid = () => new PricingError(422, 'INVALID_PRICING', 'Confira os valores, unidades e regras de desconto.');
function integer(value: number) { if (!Number.isSafeInteger(value) || value < 0) throw invalid(); return BigInt(value); }
function money(value: bigint) { if (value > BigInt(Number.MAX_SAFE_INTEGER) || value < 0n) throw invalid(); return Number(value); }
export const current = (rule: TimedDiscount, now: Date) => rule.active && rule.startsAt.getTime() <= now.getTime() && rule.endsAt.getTime() > now.getTime();
export function discount(base: number, rule: DiscountRule) {
  const total = integer(base), amount = integer(rule.amount);
  if (!amount || !['PERCENT', 'FIXED'].includes(rule.type) || rule.type === 'PERCENT' && amount > 10000n) throw invalid();
  const value = rule.type === 'PERCENT' ? total * amount / 10000n : amount;
  return money(value > total ? total : value);
}
export function promoted(unit: Pick<PriceUnit, 'offerId' | 'basePriceCents'>, promotions: PromotionRule[], now: Date) {
  integer(unit.basePriceCents); let priceCents = unit.basePriceCents, promotionId: string | null = null;
  for (const rule of promotions) {
    if (!current(rule, now) || !rule.offerIds.includes(unit.offerId)) continue;
    const price = unit.basePriceCents - discount(unit.basePriceCents, rule);
    if (price < priceCents || price === priceCents && (promotionId === null || rule.id < promotionId)) { priceCents = price; promotionId = rule.id; }
  } return { priceCents, promotionId };
}
export function matches(unit: PriceUnit, targets: PricingTarget[]) {
  return !targets.length || targets.some(target => target.kind === 'OFFER' ? target.id === unit.offerId : target.kind === 'EDITION' ? target.id === unit.editionId : target.kind === 'GENRE' && unit.genreIds.includes(target.id));
}
/** Pure exact quote. Caller reserves usage separately; freight is deliberately absent. */
export function quote(units: PriceUnit[], promotions: PromotionRule[], coupon: CouponRule | null, now: Date): PriceQuote {
  if (new Set(units.map(unit => unit.id)).size !== units.length || units.some(unit => !unit.id)) throw invalid();
  const priced = units.map(unit => { const price = promoted(unit, promotions, now); return { id: unit.id, offerId: unit.offerId, basePriceCents: unit.basePriceCents, promotionalPriceCents: price.priceCents, promotionId: price.promotionId, couponDiscountCents: 0, netPriceCents: price.priceCents }; });
  const baseSubtotal = units.reduce((sum, unit) => sum + integer(unit.basePriceCents), 0n), promotionalSubtotal = priced.reduce((sum, unit) => sum + integer(unit.promotionalPriceCents), 0n);
  let eligibleSubtotal = 0n, totalDiscount = 0n;
  if (coupon) {
    if (!current(coupon, now)) throw new PricingError(422, 'COUPON_UNAVAILABLE', 'Este cupom não está ativo neste período.');
    const eligible = priced.map((unit, index) => ({ unit, source: units[index]! })).filter(item => (coupon.allowPromotional || item.unit.promotionId === null) && matches(item.source, coupon.targets));
    if (!eligible.length) throw new PricingError(422, 'COUPON_NOT_APPLICABLE', 'Este cupom não se aplica aos itens informados.');
    eligibleSubtotal = eligible.reduce((sum, item) => sum + integer(item.unit.promotionalPriceCents), 0n);
    if (eligibleSubtotal < integer(coupon.minimumEligibleCents)) throw new PricingError(422, 'COUPON_MINIMUM_NOT_MET', 'O subtotal dos itens elegíveis após promoções não alcança o mínimo do cupom.');
    totalDiscount = integer(discount(money(eligibleSubtotal), coupon));
    if (totalDiscount && eligibleSubtotal) {
      const allocations = eligible.map(item => { const numerator = integer(item.unit.promotionalPriceCents) * totalDiscount; return { unit: item.unit, quotient: numerator / eligibleSubtotal, remainder: numerator % eligibleSubtotal }; });
      let extra = totalDiscount - allocations.reduce((sum, item) => sum + item.quotient, 0n);
      allocations.sort((a, b) => a.remainder !== b.remainder ? a.remainder > b.remainder ? -1 : 1 : a.unit.id < b.unit.id ? -1 : 1);
      for (const item of allocations) { const value = item.quotient + (extra > 0n ? 1n : 0n); if (extra > 0n) extra--; item.unit.couponDiscountCents = money(value); item.unit.netPriceCents -= money(value); }
    }
  }
  return { units: priced, baseSubtotalCents: money(baseSubtotal), promotionalSubtotalCents: money(promotionalSubtotal), eligibleSubtotalCents: money(eligibleSubtotal), couponId: coupon?.id ?? null, couponDiscountCents: money(totalDiscount), totalCents: money(promotionalSubtotal - totalDiscount) };
}
