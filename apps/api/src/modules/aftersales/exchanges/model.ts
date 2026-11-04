import type { ExchangeView } from '@garimpo/contracts';
import type { Prisma } from '../../../persistence/client.ts';
import type { z } from 'zod';
import type * as input from './validation.ts';

export const includeExchange = {
  order: true,
  items: {
    include: { orderUnit: { include: { orderItem: true } }, substitutes: { orderBy: { createdAt: 'asc' } } },
    orderBy: { orderUnitId: 'asc' }
  },
  shipments: { orderBy: { createdAt: 'asc' } },
  evidence: { select: { id: true, source: true, mediaType: true } }
} satisfies Prisma.ExchangeRequestInclude;
export type Exchange = Prisma.ExchangeRequestGetPayload<{ include: typeof includeExchange }>;

export type ExchangeCommand =
  | { type: 'decision'; data: z.infer<typeof input.decision> }
  | { type: 'posting'; data: z.infer<typeof input.posting> }
  | { type: 'receipt'; data: z.infer<typeof input.inspection> }
  | { type: 'offer'; data: z.infer<typeof input.offer> }
  | { type: 'response'; data: z.infer<typeof input.response>; substituteId: string }
  | { type: 'shipment'; data: z.infer<typeof input.shipment> }
  | { type: 'delivery'; data: z.infer<typeof input.delivery> }
  | { type: 'cancel' | 'convert'; data: z.infer<typeof input.close> }
  | { type: 'extension'; data: z.infer<typeof input.extension> }
  | { type: 'rejected-shipment'; data: z.infer<typeof input.rejectedShipment> }
  | { type: 'rejected-delivery'; data: z.infer<typeof input.rejectedDelivery> }
  | { type: 'inspection-exception'; data: z.infer<typeof input.inspectionException> };

export const live = (row: Exchange) => row.items.flatMap(item => item.substitutes).filter(item => item.state === 'OFFERED' || item.state === 'ACCEPTED');

export function exchangeView(row: Exchange): ExchangeView {
  return {
    id: row.id, orderId: row.orderId, state: row.state, version: row.version, reason: row.reason,
    createdAt: row.createdAt.toISOString(), postingDueAt: row.postingDueAt?.toISOString() ?? null,
    waitingDueAt: row.waitingDueAt?.toISOString() ?? null, convertedReturnId: row.convertedReturnId,
    items: row.items.map(item => ({ id: item.orderUnitId, orderItemId: item.orderUnit.orderItemId,
      editionId: item.orderUnit.orderItem.editionId, active: item.active, inspection: item.inspection })),
    substitutes: row.items.flatMap(item => item.substitutes.map(substitute => ({
      id: substitute.id, unitId: item.orderUnitId, offerId: substitute.offerId, state: substitute.state,
      equivalenceReason: substitute.equivalenceReason, expiresAt: substitute.expiresAt.toISOString()
    }))),
    shipments: row.shipments.map(item => ({ id: item.id, kind: item.kind, trackingCode: item.trackingCode,
      postedAt: item.postedAt.toISOString(), deliveredAt: item.deliveredAt?.toISOString() ?? null })),
    evidence: row.evidence
  };
}
