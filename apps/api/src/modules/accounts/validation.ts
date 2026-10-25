import { z } from 'zod';
import { AccountError } from './errors.ts';

const name = z.string().trim().min(1).max(160);
export const email = z.string().trim().toLowerCase().email().max(254);
const password = z.string().refine(value => { const length = Array.from(value).length; return length >= 15 && length <= 128; });
export const registration = z.object({ name, email, password }).strict();
export const loginInput = z.object({ email, password: z.string().refine(value => { const length = Array.from(value).length; return length >= 1 && length <= 128; }) }).strict();
export const profileInput = z.object({ name }).strict();
export const staffInput = z.object({ name, email, password, role: z.enum(['ADMIN', 'OPERATOR']) }).strict();
export const staffPatch = z.object({ name: name.optional(), role: z.enum(['ADMIN', 'OPERATOR']).optional() }).strict()
  .refine(value => Object.keys(value).length > 0);
export const reasonInput = z.object({ reason: z.string().trim().min(1).max(500) }).strict();
export const addressInput = z.object({
  recipient: name, zip: z.string().regex(/^\d{8}$/), region: z.string().regex(/^[A-Z]{2}$/),
  city: z.string().trim().min(1).max(120), neighborhood: z.string().trim().min(1).max(120),
  street: z.string().trim().min(1).max(200), number: z.string().trim().min(1).max(40),
  complement: z.string().trim().max(200).optional()
}).strict();
export const addressPatch = addressInput.partial().refine(value => Object.keys(value).length > 0);
export const idInput = z.string().uuid();
export function parse<T>(schema: z.ZodType<T>, input: unknown): T {
  const result = schema.safeParse(input);
  if (result.success) return result.data;
  const fields: Record<string, string[]> = {};
  for (const issue of result.error.issues) fields[String(issue.path[0] ?? 'form')] = ['Verifique este campo.'];
  throw new AccountError(422, 'INVALID_INPUT', fields);
}
