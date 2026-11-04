export type ExchangeState = 'REQUESTED' | 'AWAITING_POSTING' | 'IN_TRANSIT' | 'WAITING_SUBSTITUTE'
  | 'SHIPPED' | 'DELIVERED' | 'REJECTED' | 'REJECTED_AWAITING_SHIPMENT' | 'REJECTED_IN_TRANSIT'
  | 'REJECTED_DELIVERED' | 'CANCELLED' | 'EXPIRED' | 'CONVERTED';

export interface ExchangeView {
  id: string;
  orderId: string;
  state: ExchangeState;
  version: number;
  reason: string;
  createdAt: string;
  postingDueAt: string | null;
  waitingDueAt: string | null;
  convertedReturnId: string | null;
  items: { id: string; orderItemId: string; editionId: string; active: boolean; inspection: string | null }[];
  substitutes: { id: string; unitId: string; offerId: string; state: string; equivalenceReason: string; expiresAt: string }[];
  shipments: { id: string; kind: string; trackingCode: string; postedAt: string; deliveredAt: string | null }[];
  evidence: { id: string; source: string; mediaType: string }[];
}
