import { z } from 'zod';
import { id } from '../../freight/validation.ts';
import { posting, receipt } from '../returns/validation.ts';
export { request, decision, posting, receipt, extension, rejectedShipment, rejectedDelivery, inspectionException } from '../returns/validation.ts';

const version = z.number().int().min(1).max(2147483647);
const reason = z.string().trim().min(3).max(500).refine(value => !value.includes('\0'));
const date = z.string().datetime().transform(value => new Date(value));
export const offer = z.object({ version, offerId: id, unitId: id.optional(), equivalenceReason: reason }).strict();
export const response = z.object({ version, decision: z.enum(['ACCEPT', 'REJECT']), interaction: posting.shape.interaction }).strict();
export const shipment = posting.omit({ interaction: true });
export const delivery = z.object({ version, deliveredAt: date }).strict();
export const close = z.object({ version, reason }).strict();
export const inspection = receipt;
