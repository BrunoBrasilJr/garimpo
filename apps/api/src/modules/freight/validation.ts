import { z } from 'zod';
import { FreightError } from './errors.ts';
const integer = z.number().int().min(0).max(2147483647);
export const zip = z.string().trim().regex(/^\d{5}-?\d{3}$/).transform(value => value.replace('-', ''));
const range = z.object({ startZip: zip, endZip: zip }).strict().refine(value => value.startZip <= value.endZip, 'Confira o início e o fim da faixa.');
const ranges = z.array(range).min(1).max(100).refine(value => {
  const sorted = [...value].sort((a, b) => a.startZip.localeCompare(b.startZip)); return sorted.every((item, index) => !index || sorted[index - 1]!.endZip < item.startZip);
}, 'Faixas do mesmo cadastro não podem se sobrepor.');
const shape = { region: z.string().trim().min(1).max(100).refine(value => !value.includes('\0')), served: z.boolean(), amountCents: integer.min(1).nullable(), deliveryDays: integer.max(3650).nullable(), ranges };
export const create = z.object(shape).strict().refine(value => value.served ? value.amountCents !== null && value.deliveryDays !== null : value.amountCents === null && value.deliveryDays === null, 'Informe preço e prazo somente para regiões atendidas.');
export const update = z.object(shape).partial().extend({ version: integer.min(1) }).strict().refine(value => Object.keys(value).length > 1);
export const list = z.object({ page: z.coerce.number().int().min(1).max(100000).default(1), pageSize: z.coerce.number().int().min(1).max(100).default(20) }).strict();
export const id = z.string().uuid().transform(value => value.toLowerCase());
export type RateInput = z.infer<typeof create>;
export type RateUpdate = z.infer<typeof update>;
export type RateQuery = z.infer<typeof list>;
export function parse<T>(schema: z.ZodType<T>, value: unknown): T {
  const result = schema.safeParse(value); if (!result.success) throw new FreightError(422, 'INVALID_FREIGHT_INPUT', 'Confira região, faixa de CEP, preço, prazo e revisão informados.'); return result.data;
}
