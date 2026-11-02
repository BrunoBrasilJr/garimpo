import { z } from 'zod';
import { CartError } from './errors.ts';
export const id = z.string().uuid().transform(value => value.toLowerCase()), version = z.number().int().min(1).max(2147483647), quantity = z.number().int().min(1).max(1000);
export const couponCode = z.string().trim().toUpperCase().regex(/^[A-Z0-9_-]{3,40}$/);
export const preview = z.object({ couponCode: couponCode.optional() }).strict();
export const add = z.object({ version, offerId: id, quantity }).strict();
export const update = z.object({ version, quantity }).strict();
export const remove = z.object({ version: z.coerce.number().int().min(1).max(2147483647) }).strict();
export const merge = z.object({ version, items: z.array(z.object({ offerId: id, quantity }).strict()).max(100) }).strict();
export const reserve = z.object({ version, pricingRevision: z.string().regex(/^[a-f0-9]{64}$/), couponCode: couponCode.optional() }).strict();
export const key = z.string().min(1).max(128).regex(/^[A-Za-z0-9._:-]+$/);
export function parse<T>(schema: z.ZodType<T>, value: unknown): T { const result = schema.safeParse(value); if (!result.success) throw new CartError(422, 'INVALID_CART', 'Confira os itens, quantidades e revisão do carrinho.'); return result.data; }
