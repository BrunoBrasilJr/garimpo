import { z } from 'zod';
import { id } from '../../freight/validation.ts';

const reason = z.string().trim().min(3).max(500).refine(value => !value.includes('\0'));
const version = z.number().int().min(1).max(2147483647);
const date = z.string().datetime().transform(value => new Date(value));
const trackingCode = z.string().trim().min(1).max(120).refine(value => !/[\u0000-\u001f\u007f]/.test(value));
const unique = (ids: string[]) => new Set(ids).size === ids.length;
export const request = z.object({
  reason, items: z.array(z.object({ orderItemId: id, quantity: z.number().int().min(1).max(1000) }).strict()).min(1).max(1000)
}).strict().refine(value => unique(value.items.map(item => item.orderItemId)));
export const decision = z.object({ version, reason, decision: z.enum(['APPROVE', 'REJECT']) }).strict();
export const posting = z.object({
  version, trackingCode, postedAt: date,
  interaction: z.object({ channel: z.enum(['PHONE', 'EMAIL', 'IN_PERSON', 'MESSAGING']), reference: reason, occurredAt: date }).strict().optional()
}).strict();
export const receipt = z.object({
  version, reason, receivedAt: date, units: z.array(z.object({ id, result: z.enum(['FIT', 'UNFIT', 'REJECTED']) }).strict()).min(1).max(10000),
  evidenceIds: z.array(id).max(5).default([])
}).strict().refine(value => unique(value.units.map(unit => unit.id)) && unique(value.evidenceIds));
export const authorization = z.object({ version, reason, unitIds: z.array(id).min(1).max(10000).refine(unique), scenario: z.enum(['FAILED', 'SUCCEEDED']).optional() }).strict();
export const extension = z.object({ version, reason, dueAt: date }).strict();
export const rejectedShipment = z.object({ version, trackingCode, postedAt: date }).strict();
export const rejectedDelivery = z.object({ version, deliveredAt: date }).strict();
export const inspectionException = z.object({ version, reason, decision: z.enum(['APPROVE_UNFIT', 'KEEP_REJECTION']) }).strict();
