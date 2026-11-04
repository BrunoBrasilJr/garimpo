import { z } from 'zod';
import { calendarDay } from './calendar.ts';
import { CartError } from '../cart/errors.ts';
export { id } from '../freight/validation.ts';
export { key } from './validation.ts';
export const stage = z.enum(['PENDING', 'PAID', 'PREPARING', 'SEPARATED', 'SHIPPED', 'DELIVERED', 'CANCELLED']);
const page = z.coerce.number().int().min(1).max(1000000).default(1), pageSize = z.coerce.number().int().min(1).max(30).default(10), day = z.string().refine(v => calendarDay(v) && v <= '9998-12-31');
const filters = { page, pageSize, status: stage.optional(), fromDate: day.optional(), throughDate: day.optional(), payableOnly: z.literal('true').optional() };
const period = (v: { fromDate?: string | undefined; throughDate?: string | undefined; payableOnly?: string | undefined; status?: string | undefined }) => (!v.fromDate || !v.throughDate || v.fromDate <= v.throughDate) && (!v.payableOnly || !v.status || v.status === 'PENDING');
export const customerList = z.object(filters).strict().refine(period);
export const staffList = z.object({ ...filters, customerEmail: z.string().trim().toLowerCase().email().max(254).optional() }).strict().refine(period);
export const detail = z.object({ paymentPage: page, refundPage: page }).strict();
const version = z.number().int().min(1).max(2147483647), reason = z.string().trim().min(3).max(500).refine(v => !v.includes('\0')), instant = z.string().datetime().refine(v => new Date(v).getUTCFullYear() >= 1900);
export const logistics = z.discriminatedUnion('status', [
  z.object({ version, status: z.literal('PREPARING'), reason }).strict(), z.object({ version, status: z.literal('SEPARATED'), reason }).strict(),
  z.object({ version, status: z.literal('SHIPPED'), reason, trackingCode: z.string().trim().min(1).max(120).refine(v => Array.from(v).every(c => c.charCodeAt(0) >= 32 && c.charCodeAt(0) !== 127)), postedAt: instant }).strict(),
  z.object({ version, status: z.literal('DELIVERED'), reason, deliveredAt: instant }).strict()
]);
export type CustomerList = z.infer<typeof customerList>;
export type StaffList = z.infer<typeof staffList>;
export type DetailQuery = z.infer<typeof detail>;
export type LogisticsInput = z.infer<typeof logistics>;
export function parse<T>(schema: z.ZodType<T>, value: unknown): T { const r = schema.safeParse(value); if (!r.success) throw new CartError(422, 'INVALID_ORDER_INPUT', 'Confira filtros, revisão, etapa, rastreio e datas efetivas.'); return r.data; }
