import type { Clock } from '../core/clock.ts';
import type { CommercialBindings } from '../modules/catalog/lifecycle.ts';
import { reservedQuantities } from '../modules/inventory/reservations.ts';

export function commercialBindings(clock: Clock): CommercialBindings {
  return {
    async inspect(tx, editionId, offerIds) {
      const held = await reservedQuantities(tx, offerIds, clock.now());
      const offer = { in: offerIds };
      const hasHistory = Boolean(
        await tx.orderItem.findFirst({ where: { editionId, offerId: offer }, select: { id: true } })
        ?? await tx.checkoutItem.findFirst({ where: { offerId: offer }, select: { id: true } })
        ?? await tx.orderUnit.findFirst({ where: { currentOfferId: offer }, select: { id: true } })
        ?? await tx.stockMovement.findFirst({ where: { offerId: offer }, select: { id: true } })
      );
      const offers = Object.fromEntries(offerIds.map(id => {
        // Paid stock was already removed from physical inventory.
        const quantity = held.get(id) ?? 0;
        return [id, { reservedQuantity: quantity, protectedQuantity: quantity }];
      }));
      return { status: 'KNOWN', hasHistory, offers };
    }
  };
}
