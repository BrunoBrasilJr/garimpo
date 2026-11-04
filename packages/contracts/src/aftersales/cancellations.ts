import type { OrderStage } from '../orders/index.js';

export interface CancellationResult {
  id: string;
  orderId: string;
  orderStatus: OrderStage;
  orderVersion: number;
  unitIds: string[];
  unavailableUnitIds: string[];
  refundId: string | null;
  replacementChargeId: string | null;
  createdAt: string;
}
