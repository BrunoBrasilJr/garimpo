export type DiscountType = 'PERCENT' | 'FIXED';
export interface PricingTarget { kind: 'OFFER' | 'EDITION' | 'GENRE'; id: string }
export interface NamedPricingTarget extends PricingTarget { label: string }
export interface DiscountView { id: string; type: DiscountType; amount: number; startsAt: string; endsAt: string; active: boolean; version: number }
export interface PromotionView extends DiscountView { name: string; offers: { id: string; label: string }[] }
export interface CouponView extends DiscountView { code: string; minimumEligibleCents: number; allowPromotional: boolean; totalLimit: number | null; perUserLimit: number | null; targets: NamedPricingTarget[]; usage: { status: 'NOT_INTEGRATED' } }
export interface PricingPage<T> { items: T[]; page: number; pageSize: number; total: number }
export interface PricedUnit { id: string; offerId: string; basePriceCents: number; promotionalPriceCents: number; promotionId: string | null; couponDiscountCents: number; netPriceCents: number }
export interface PriceQuote { units: PricedUnit[]; baseSubtotalCents: number; promotionalSubtotalCents: number; eligibleSubtotalCents: number; couponId: string | null; couponDiscountCents: number; totalCents: number }
