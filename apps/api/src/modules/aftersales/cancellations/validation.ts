import { z } from 'zod';
import { id } from '../../freight/validation.ts';

const reason = z.string().trim().min(3).max(500).refine(value => !value.includes('\0'));
export const direct = z.object({ reason }).strict();
export const unavailable = z.object({
  reason,
  version: z.number().int().min(1).max(2147483647),
  unitIds: z.array(id).min(1).max(10000).refine(ids => new Set(ids).size === ids.length)
}).strict();
export const retry = z.object({ reason, scenario: z.enum(['SUCCEEDED', 'FAILED']).optional() }).strict();
export type CancellationInput = z.infer<typeof direct> | z.infer<typeof unavailable>;
