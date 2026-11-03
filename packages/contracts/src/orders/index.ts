import type { OrderCreationView } from '../checkout/index.js';
import type { RefundView, CommerceMessageContent } from '../payments/index.js';
export type OrderStage = OrderCreationView['status'];
export type LogisticsStage = 'PREPARING' | 'SEPARATED' | 'SHIPPED' | 'DELIVERED';
export interface OriginalShipmentView { id: string; kind: 'ORIGINAL'; trackingCode: string; postedAt: string; deliveredAt: string | null; createdAt: string }
export interface OrderStageEvent { id: string; version: number; fromStatus: OrderStage | null; toStatus: OrderStage; actorRole: 'USER' | 'ADMIN' | 'OPERATOR' | null; reason: string; occurredAt: string; recordedAt: string }
export interface OrderCustomer { id: string; name: string; email: string; blocked: boolean; closed: boolean }
export interface OrderSummary { id: string; status: OrderStage; method: OrderCreationView['method']; version: number; totalCents: number; createdAt: string; expiresAt: string | null; paidAt: string | null; customer?: OrderCustomer }
export interface OrderPage { items: OrderSummary[]; total: number; page: number; pageSize: number; totalPages: number; serverTime: string }
export interface OrderPayment { id: string; orderId: string | null; chargeId: string | null; method: OrderCreationView['method']; result: 'PENDING' | 'APPROVED' | 'DECLINED'; outcome: string | null; amountCents: number; createdAt: string; receivedAt: string | null }
export interface HistoryPage<T> { items: T[]; page: number; pageSize: number; total: number; totalPages: number }
export interface OrderDetail extends OrderCreationView { paidAt: string | null; serverTime: string; events: OrderStageEvent[]; shipment: OriginalShipmentView | null; payments: HistoryPage<OrderPayment>; refunds: HistoryPage<RefundView>; customer?: OrderCustomer }
export type LogisticsCommand = { version: number; status: 'PREPARING' | 'SEPARATED'; reason: string }
  | { version: number; status: 'SHIPPED'; reason: string; trackingCode: string; postedAt: string }
  | { version: number; status: 'DELIVERED'; reason: string; deliveredAt: string };
export interface ShipmentMessageContent extends CommerceMessageContent { shipmentId: string; shipment: OriginalShipmentView }
