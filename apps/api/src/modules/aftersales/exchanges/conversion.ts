import type { Prisma } from '../../../persistence/client.ts';
import type { Exchange } from './model.ts';

/** Preserve the original case and its evidence, and transfer only the unresolved units. */
export async function convertExchange(tx: Prisma.TransactionClient, row: Exchange, ids: string[], reason: string, now: Date, actorId: string | null) {
  const physical = row.shipments.find(item => item.kind === 'EXCHANGE_RETURN');
  await tx.exchangeItem.updateMany({ where: { exchangeId: row.id, orderUnitId: { in: ids } }, data: { active: false } });
  const state = row.inspectedAt ? 'AWAITING_REFUND' : physical ? 'IN_TRANSIT' : row.approvedAt ? 'AWAITING_POSTING' : 'REQUESTED';
  const result = await tx.returnRequest.create({ data: {
    orderId: row.orderId, state, reason, createdAt: now, approvedAt: row.approvedAt,
    postingDueAt: row.postingDueAt, inspectedAt: row.inspectedAt,
    items: { create: row.items.filter(item => ids.includes(item.orderUnitId)).map(item => ({ orderUnitId: item.orderUnitId, inspection: item.inspection })) }
  } });
  if (physical) await tx.shipment.create({ data: {
    returnId: result.id, orderId: row.orderId, kind: 'RETURN', trackingCode: physical.trackingCode,
    postedAt: physical.postedAt, deliveredAt: physical.deliveredAt, createdById: actorId ?? physical.createdById, createdAt: now
  } });
  const evidence = await tx.evidence.findMany({ where: { exchangeId: row.id } });
  if (evidence.length) await tx.evidence.createMany({ data: evidence.map(value => ({
    returnId: result.id, actorId: value.actorId, source: value.source, position: value.position, mediaType: value.mediaType,
    content: value.content, createdAt: value.createdAt
  })) });
  return result.id;
}
