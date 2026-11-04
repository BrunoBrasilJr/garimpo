import type { ExchangeState } from './exchanges.js';
import type { ReturnState } from './returns.js';

export interface AftersalesOverview {
  orderId: string;
  groups: {
    orderItemId: string;
    offerId: string;
    editionId: string;
    units: { id: string; available: boolean; deliveredAt: string | null }[];
  }[];
  returns: { id: string; state: ReturnState; createdAt: string }[];
  exchanges: { id: string; state: ExchangeState; createdAt: string }[];
}
