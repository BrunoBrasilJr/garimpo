import type { OrderDetail, OrderPage, OrderSummary, OriginalShipmentView } from '@garimpo/contracts';
import type { Prisma } from '../../persistence/client.ts';
import type { Accounts } from '../accounts/service.ts';
import { AccountError } from '../accounts/errors.ts';
import { serializable } from '../../persistence/transaction.ts';
import { CartError, missing } from '../cart/errors.ts';
import { Orders, include, cents } from './service.ts';
import { refundInclude, refundView } from '../refunds/automatic.ts';
import { dayStart, afterDay } from './calendar.ts';
import * as validate from './history-validation.ts';
import type { CustomerList, StaffList, DetailQuery } from './history-validation.ts';
export const customerSelect = { id: true, name: true, emailNormalized: true, blockedAt: true, closedAt: true } satisfies Prisma.UserSelect;
const customerView = (row: Prisma.UserGetPayload<{ select: typeof customerSelect }>) => ({ id: row.id, name: row.name, email: row.emailNormalized, blocked: row.blockedAt !== null, closed: row.closedAt !== null });
export const historyInclude = { ...include, user: { select: customerSelect }, statusEvents: { orderBy: { version: 'asc' } }, shipments: { where: { kind: 'ORIGINAL' }, orderBy: [{ createdAt: 'asc' }, { id: 'asc' }] } } satisfies Prisma.OrderInclude;
const summarySelect = { id: true, status: true, method: true, version: true, totalCents: true, createdAt: true, expiresAt: true, paidAt: true, user: { select: customerSelect } } satisfies Prisma.OrderSelect;
export function shipmentView(row: { id: string; kind: string; trackingCode: string; postedAt: Date; deliveredAt: Date | null; createdAt: Date }): OriginalShipmentView {
  if (row.kind !== 'ORIGINAL') throw new Error('Only original shipments belong to this increment.');
  return { id: row.id, kind: 'ORIGINAL', trackingCode: row.trackingCode, postedAt: row.postedAt.toISOString(), deliveredAt: row.deliveredAt?.toISOString() ?? null, createdAt: row.createdAt.toISOString() };
}
const knownReasons: Record<string, string> = { CREATED_FROM_CHECKOUT: 'Pedido criado a partir da finalização confirmada.', SIMULATED_PAYMENT: 'Pagamento confirmado pelo simulador.', PAYMENT_DEADLINE: 'Prazo de pagamento encerrado.', ACCOUNT_BLOCKED: 'Pedido pendente cancelado por bloqueio da conta.', ACCOUNT_CLOSED: 'Pedido pendente cancelado por encerramento da conta.', MIGRATED_STORED_CREATION: 'Criação preservada dos dados históricos.', MIGRATED_STORED_PAYMENT: 'Pagamento preservado dos dados históricos.', MIGRATED_STORED_EXPIRY: 'Vencimento preservado dos dados históricos.' };
export class OrderHistory {
  readonly accounts: Accounts;
  constructor(accounts: Accounts) { this.accounts = accounts; }
  async staff(tx: Prisma.TransactionClient | Accounts['db'], access: string) { const { user } = await this.accounts.authorize(tx, access); if (user.context !== 'STAFF' || !['ADMIN', 'OPERATOR'].includes(user.role)) throw new AccountError(403, 'STAFF_REQUIRED'); return user; }
  async list(access: string, query: CustomerList | StaffList, staff = false): Promise<OrderPage> {
    query = staff ? validate.parse(validate.staffList, query) : validate.parse(validate.customerList, query);
    return serializable(this.accounts.db, async tx => {
      const actor = staff ? await this.staff(tx, access) : (await this.accounts.authorize(tx, access, true)).user;
      const where: Prisma.OrderWhereInput = { ...(!staff ? { userId: actor.id } : {}), ...(query.status ? { status: query.status } : {}), ...(query.payableOnly ? { status: 'PENDING', expiresAt: { gt: this.accounts.clock.now() } } : {}), ...('customerEmail' in query && query.customerEmail ? { user: { emailNormalized: query.customerEmail } } : {}), ...(query.fromDate || query.throughDate ? { createdAt: { ...(query.fromDate ? { gte: dayStart(query.fromDate) } : {}), ...(query.throughDate ? { lt: afterDay(query.throughDate) } : {}) } } : {}) };
      const total = await tx.order.count({ where }), rows = await tx.order.findMany({ where, orderBy: [{ createdAt: 'desc' }, { id: 'desc' }], skip: (query.page - 1) * query.pageSize, take: query.pageSize, select: summarySelect });
      const items: OrderSummary[] = rows.map(row => ({ id: row.id, status: row.status, method: row.method, version: row.version, totalCents: cents(row.totalCents), createdAt: row.createdAt.toISOString(), expiresAt: row.expiresAt?.toISOString() ?? null, paidAt: row.paidAt?.toISOString() ?? null, ...(staff ? { customer: customerView(row.user) } : {}) }));
      return { items, total, page: query.page, pageSize: query.pageSize, totalPages: Math.ceil(total / query.pageSize), serverTime: this.accounts.clock.now().toISOString() };
    });
  }
  async detail(access: string, id: string, query: DetailQuery = { paymentPage: 1, refundPage: 1 }, staff = false): Promise<OrderDetail> {
    id = validate.parse(validate.id, id); query = validate.parse(validate.detail, query);
    return serializable(this.accounts.db, async tx => {
      const actor = staff ? await this.staff(tx, access) : (await this.accounts.authorize(tx, access, true)).user;
      const row = await tx.order.findFirst({ where: { id, ...(!staff ? { userId: actor.id } : {}) }, include: historyInclude }); if (!row) throw missing();
      if (row.shipments.length > 1) throw new CartError(503, 'ORDER_SHIPMENT_INCONSISTENT', 'Não foi possível conciliar a remessa original.');
      const paymentWhere = { checkoutId: row.checkoutId, userId: row.userId }, refundWhere = { paymentAttempt: paymentWhere }, pageSize = 20;
      const paymentTotal = await tx.paymentAttempt.count({ where: paymentWhere }), refundTotal = await tx.refund.count({ where: refundWhere });
      const payments = await tx.paymentAttempt.findMany({ where: paymentWhere, orderBy: [{ createdAt: 'desc' }, { id: 'desc' }], skip: (query.paymentPage - 1) * pageSize, take: pageSize, select: { id: true, orderId: true, chargeId: true, method: true, result: true, outcome: true, amountCents: true, createdAt: true, receivedAt: true } });
      const refunds = await tx.refund.findMany({ where: refundWhere, include: refundInclude, orderBy: [{ createdAt: 'desc' }, { id: 'desc' }], skip: (query.refundPage - 1) * pageSize, take: pageSize });
      return { ...new Orders(this.accounts).view(row), paidAt: row.paidAt?.toISOString() ?? null, serverTime: this.accounts.clock.now().toISOString(), ...(staff ? { customer: customerView(row.user) } : {}),
        unitStates: row.items.flatMap(item => item.units.map(unit => ({ id: unit.id, offerId: item.offerId, commercialState: unit.commercialState, currentOfferId: unit.currentOfferId, deliveredAt: unit.deliveredAt?.toISOString() ?? null, netPaidCents: unit.netPaidCents }))),
        shipment: row.shipments[0] ? shipmentView(row.shipments[0]) : null, events: row.statusEvents.map(event => ({ id: event.id, version: event.version, fromStatus: event.fromStatus, toStatus: event.toStatus, actorRole: event.actorRole, reason: knownReasons[event.reason] ?? event.reason, occurredAt: event.occurredAt.toISOString(), recordedAt: event.createdAt.toISOString() })),
        payments: { items: payments.map(p => ({ ...p, amountCents: cents(p.amountCents), createdAt: p.createdAt.toISOString(), receivedAt: p.receivedAt?.toISOString() ?? null })), page: query.paymentPage, pageSize, total: paymentTotal, totalPages: Math.ceil(paymentTotal / pageSize) },
        refunds: { items: refunds.map(refundView), page: query.refundPage, pageSize, total: refundTotal, totalPages: Math.ceil(refundTotal / pageSize) } };
    });
  }
}
