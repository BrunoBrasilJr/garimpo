import type { ReviewPurchases, ReviewPurchase, ReviewPurchaseKey } from '../../apps/api/src/modules/reviews/purchases.ts';
/** Deliberately test-only: runtime has no environment/HTTP switch to select this fixture. */
export class PurchaseFixture implements ReviewPurchases {
  readonly rows = new Map<string, ReviewPurchase>();
  private key(key: ReviewPurchaseKey) { return JSON.stringify([key.userId, key.editionId, key.orderId]); }
  set(key: ReviewPurchaseKey, value: ReviewPurchase = { status: 'KNOWN', delivered: true, retainedUnits: 1 }) { this.rows.set(this.key(key), value); }
  async inspect(_tx: Parameters<ReviewPurchases['inspect']>[0], key: ReviewPurchaseKey): Promise<ReviewPurchase> { return this.rows.get(this.key(key)) ?? { status: 'KNOWN', delivered: false, retainedUnits: 0 }; }
}
