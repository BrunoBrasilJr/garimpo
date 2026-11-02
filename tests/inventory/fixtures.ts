import type { CommercialBindings } from '../../apps/api/src/modules/catalog/lifecycle.ts';
/** Isolated fixtures only. Never imported by runtime modules or chosen through environment flags. */
export const isolatedNoCommercialBindings: CommercialBindings = {
  async inspect(_tx, _editionId, offerIds) {
    return { status: 'KNOWN', hasHistory: false, offers: Object.fromEntries(offerIds.map(id => [id, { reservedQuantity: 0, protectedQuantity: 0 }])) };
  }
};
