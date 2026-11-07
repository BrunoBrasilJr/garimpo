import { z } from 'zod';
import { calendarDay } from '../orders/calendar.ts';
import { CartError } from '../cart/errors.ts';

const day = z.string().refine(value => calendarDay(value) && value <= '9998-12-31');
export const query = z.object({
  from: day, to: day, asOf: z.string().datetime().optional(),
  page: z.coerce.number().int().min(1).max(1000000).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20)
}).strict().refine(value => value.from <= value.to);
export type ReportQuery = z.infer<typeof query>;
export function parse(value: unknown) {
  const result = query.safeParse(value);
  if (!result.success) throw new CartError(422, 'INVALID_REPORT_PERIOD', 'Confira as datas e a paginação do relatório.');
  return result.data;
}
