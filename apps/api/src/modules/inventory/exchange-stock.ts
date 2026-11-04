import type { Clock } from '../../core/clock.ts';
import { enqueue } from '../../core/outbox.ts';
import type { Prisma } from '../../persistence/client.ts';
import { CartError } from '../cart/errors.ts';
import { captureAvailability, publishAvailability } from '../engagement/availability.ts';
import { lockOffers } from './reservations.ts';

export async function changeExchangeHolds(tx: Prisma.TransactionClient, clock: Clock, substitutes: { id: string; offerId: string }[], reason: 'REJECTED' | 'EXPIRED' | 'RELEASED') {
  const offers = substitutes.map(value => value.offerId), ids = substitutes.map(value => value.id);
  await lockOffers(tx, offers);
  const before = await captureAvailability(tx, offers, null);
  await tx.reservation.updateMany({ where: { substituteId: { in: ids }, status: 'ACTIVE' },
    data: { status: reason === 'EXPIRED' ? 'EXPIRED' : 'RELEASED', releasedAt: clock.now() } });
  await tx.substituteOffer.updateMany({ where: { id: { in: ids }, state: { in: ['OFFERED', 'ACCEPTED'] } }, data: { state: reason } });
  await publishAvailability(tx, before, clock);
}

export async function dispatchSubstitutes(tx: Prisma.TransactionClient, clock: Clock, actorId: string,
  lines: { id: string; offerId: string; originalOfferId: string | null }[]) {
  const offers = lines.flatMap(line => [line.offerId, ...(line.originalOfferId ? [line.originalOfferId] : [])]);
  await lockOffers(tx, offers);
  const before = await captureAvailability(tx, offers, clock.now());
  for (const line of lines) {
    const reserved = await tx.reservation.updateMany({ where: { substituteId: line.id, offerId: line.offerId, status: 'ACTIVE', expiresAt: { gt: clock.now() } },
      data: { status: 'CONSUMED', releasedAt: clock.now() } });
    if (reserved.count !== 1) throw new CartError(409, 'EXCHANGE_HOLD_UNAVAILABLE', 'A reserva do substituto está indisponível.');
    const moves = [{ offerId: line.offerId, delta: -1, code: 'OUT' }];
    if (line.originalOfferId) moves.push({ offerId: line.originalOfferId, delta: 1, code: 'IN' });
    for (const move of moves) {
      const previous = await tx.offer.findUniqueOrThrow({ where: { id: move.offerId } });
      const stockOnHand = previous.stockOnHand + move.delta;
      if (stockOnHand < 0) throw new CartError(409, 'EXCHANGE_STOCK_CONFLICT', 'Confira o saldo físico do substituto.');
      const updated = await tx.offer.update({ where: { id: move.offerId }, data: { stockOnHand, version: { increment: 1 } } });
      await tx.stockMovement.create({ data: { offerId: move.offerId, offerVersion: updated.version, actorId,
        deltaOnHand: move.delta, balanceBefore: previous.stockOnHand, balanceAfter: stockOnHand,
        originKey: 'EXCHANGE:' + line.id + ':' + move.code, reason: move.delta < 0 ? 'Envio de substituto' : 'Reposição do original apto', createdAt: clock.now() } });
      await enqueue(tx, { type: 'INVENTORY.STOCK_CHANGED', aggregateId: move.offerId,
        payload: { offerId: move.offerId, editionId: previous.editionId, before: previous.stockOnHand, after: stockOnHand }, clock);
    }
    await tx.substituteOffer.update({ where: { id: line.id }, data: { state: 'SHIPPED' } });
  }
  await publishAvailability(tx, before, clock);
}
