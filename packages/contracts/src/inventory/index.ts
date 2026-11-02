import type { OfferKind } from '../catalog/index.js';
export interface StockMovementView {
  id: string; offerId: string; offerVersion: number; deltaOnHand: number; balanceBefore: number; balanceAfter: number;
  reason: string; actorName: string | null; createdAt: string;
}
export interface StockOfferView {
  id: string; kind: OfferKind; active: boolean; version: number; stockOnHand: number;
  reservedQuantity: number | null; protectedQuantity: number | null; availableQuantity: number | null;
  movements: StockMovementView[]; movementCount: number;
}
export interface StockEditionView {
  id: string; title: string; active: boolean; lowStockNewThreshold: number;
  bindingsStatus: 'KNOWN' | 'UNAVAILABLE'; newPhysical: number; usedPhysical: number;
  newAvailable: number | null; usedAvailable: number | null;
  lowStockNew: boolean | null; lowStockUsed: boolean | null; offers: StockOfferView[];
}
export interface StockPage { items: StockEditionView[]; page: number; pageSize: number; total: number; totalPages: number }
export interface StockAdjustmentResult { movement: StockMovementView; stockOnHand: number; version: number }
