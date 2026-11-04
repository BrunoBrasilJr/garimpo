import type { RefundView } from '../payments/index.js';

export type ReturnState = 'REQUESTED' | 'AWAITING_POSTING' | 'IN_TRANSIT' | 'AWAITING_REFUND'
  | 'REJECTED' | 'REJECTED_AWAITING_SHIPMENT' | 'REJECTED_IN_TRANSIT' | 'REJECTED_DELIVERED' | 'COMPLETED' | 'EXPIRED';

export interface ReturnView {
  id: string;
  orderId: string;
  state: ReturnState;
  version: number;
  reason: string;
  createdAt: string;
  approvedAt: string | null;
  postingDueAt: string | null;
  inspectedAt: string | null;
  items: { id: string; orderItemId: string; inspection: string | null }[];
  evidence: { id: string; mediaType: string; source: string }[];
  shipments: { id: string; kind: string; trackingCode: string; postedAt: string; deliveredAt: string | null }[];
  refund: RefundView | null;
}
