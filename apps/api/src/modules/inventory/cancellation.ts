import type { Clock } from '../../core/clock.ts';
import { enqueue } from '../../core/outbox.ts';
import type { Prisma } from '../../persistence/client.ts';
import { CartError } from '../cart/errors.ts';
import type { OrderRecord } from '../orders/service.ts';

/** The caller owns the offer locks and has resolved this order's holds. */
export async function adjustCancelledStock(tx: Prisma.TransactionClient, clock: Clock, cancellationId: string, order: OrderRecord, affected: Set<string>, unavailable: Set<string>, actorId: string) {
  for (const item of order.items) {
    const delta = item.units.reduce((sum, unit) => {
      if (order.status === 'PENDING') return sum - Number(unavailable.has(unit.id));
      return sum + Number(affected.has(unit.id) && !unavailable.has(unit.id));
    }, 0);
    if (!delta) continue;
    const offer = await tx.offer.findUniqueOrThrow({ where: { id: item.offerId } });
    const next = offer.stockOnHand + delta;
    if (next < 0) throw new CartError(409, 'STOCK_STATE_CONFLICT', 'O saldo físico mudou. Confira as unidades indisponíveis.');
    const updated = await tx.offer.update({ where: { id: offer.id }, data: { stockOnHand: next, version: { increment: 1 } } });
    await tx.stockMovement.create({ data: {
      offerId: offer.id, offerVersion: updated.version, deltaOnHand: delta,
      balanceBefore: offer.stockOnHand, balanceAfter: next, actorId,
      reason: delta < 0 ? 'Indisponibilidade confirmada' : 'Reposição por cancelamento',
      originKey: 'CANCELLATION:' + cancellationId + ':' + offer.id, createdAt: clock.now()
    } });
    await enqueue(tx, { type: 'INVENTORY.STOCK_CHANGED', aggregateId: offer.id, payload: { offerId: offer.id, editionId: offer.editionId, before: offer.stockOnHand, after: next } }, clock);
  }
}
