import type { OrderCreationView } from '../checkout/index.js';
export type PaymentScenario = 'APPROVED' | 'DECLINED' | 'PENDING' | 'APPROVED_REFUND_FAIL';
export interface RefundView {
  id: string; status: 'PENDING' | 'FAILED' | 'SUCCEEDED'; origin: string;
  productCents: number; shippingCents: number; createdAt: string; completedAt: string | null;
  attempts: { id: string; result: 'PENDING' | 'FAILED' | 'SUCCEEDED'; createdAt: string; receivedAt: string | null }[];
}
export interface PaymentView {
  id: string; checkoutId: string; orderId: string | null; chargeId: string | null; method: 'CARD' | 'PIX' | 'BOLETO';
  result: 'PENDING' | 'APPROVED' | 'DECLINED'; outcome: string | null; amountCents: number;
  createdAt: string; receivedAt: string | null; serverTime: string; order: OrderCreationView | null; refunds: RefundView[];
}
export interface PaymentPage { items: PaymentView[]; page: number; pageSize: number; total: number; totalPages: number }
