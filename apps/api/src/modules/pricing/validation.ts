import { z } from 'zod';
import { PricingError } from './errors.ts';
const integer = z.number().int().min(0).max(2147483647), id = z.string().uuid();
const instant = z.string().datetime().refine(value => new Date(value).getUTCFullYear() >= 1900);
const common = { type: z.enum(['PERCENT', 'FIXED']), amount: integer.min(1), startsAt: instant, endsAt: instant, active: z.boolean().optional() };
export const target = z.object({ kind: z.enum(['OFFER', 'EDITION', 'GENRE']), id }).strict();
const targets = z.array(target).max(1000).refine(value => new Set(value.map(item => item.kind + ':' + item.id)).size === value.length, 'Alvos repetidos.');
const offerIds = z.array(id).min(1).max(1000).refine(value => new Set(value).size === value.length, 'Ofertas repetidas.');
const couponShape = { ...common, code: z.string().trim().toUpperCase().regex(/^[A-Z0-9_-]{3,40}$/), minimumEligibleCents: integer.optional(), allowPromotional: z.boolean().optional(), totalLimit: integer.min(1).nullable().optional(), perUserLimit: integer.min(1).nullable().optional(), targets: targets.optional() };
const promotionShape = { ...common, name: z.string().trim().min(1).max(200), offerIds };
function valid(value: { type: string; amount: number; startsAt: string; endsAt: string }) { return (value.type !== 'PERCENT' || value.amount <= 10000) && Date.parse(value.endsAt) > Date.parse(value.startsAt); }
export const couponCreate = z.object(couponShape).strict().refine(valid, 'Confira percentual e intervalo de validade.');
export const promotionCreate = z.object(promotionShape).strict().refine(valid, 'Confira percentual e intervalo de validade.');
const { code: immutableCode, ...couponEditable } = couponShape; void immutableCode;
export const couponPatch = z.object(couponEditable).partial().extend({ version: integer.min(1) }).strict().refine(value => Object.keys(value).length > 1);
export const promotionPatch = z.object(promotionShape).partial().extend({ version: integer.min(1) }).strict().refine(value => Object.keys(value).length > 1);
export const listQuery = z.object({ page: z.coerce.number().int().min(1).max(100000).default(1), pageSize: z.coerce.number().int().min(1).max(100).default(20), active: z.enum(['true', 'false']).transform(value => value === 'true').optional() }).strict();
export type CouponCreate = z.infer<typeof couponCreate>;
export type CouponPatch = z.infer<typeof couponPatch>;
export type PromotionCreate = z.infer<typeof promotionCreate>;
export type PromotionPatch = z.infer<typeof promotionPatch>;
export type PricingQuery = z.infer<typeof listQuery>;
export function parse<T>(schema: z.ZodType<T>, input: unknown): T {
  const result = schema.safeParse(input); if (!result.success) throw new PricingError(422, 'INVALID_PRICING', 'Confira os campos, alvos e período do desconto.'); return result.data;
}
