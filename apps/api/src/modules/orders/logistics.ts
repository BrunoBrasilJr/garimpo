import type { Accounts } from '../accounts/service.ts';
import type { OrderDetail } from '@garimpo/contracts';
import { serializable } from '../../persistence/transaction.ts';
import { payloadHash } from '../../core/idempotency.ts';
import { appendAudit } from '../../core/audit.ts';
import { enqueue } from '../../core/outbox.ts';
import { CartError, missing } from '../cart/errors.ts';
import { OrderHistory, historyInclude } from './history.ts';
import { orderEvent } from './events.ts';
import * as validate from './history-validation.ts';
import type { LogisticsInput } from './history-validation.ts';
export const nextLogistics: Record<string, string> = { PAID: 'PREPARING', PREPARING: 'SEPARATED', SEPARATED: 'SHIPPED', SHIPPED: 'DELIVERED' };
export class Logistics {
  readonly accounts: Accounts; readonly history: OrderHistory;
  constructor(accounts: Accounts) { this.accounts = accounts; this.history = new OrderHistory(accounts); }
  async change(access: string, id: string, input: LogisticsInput, key: string): Promise<OrderDetail> {
    id = validate.parse(validate.id, id); input = validate.parse(validate.logistics, input); key = validate.parse(validate.key, key);
    await serializable(this.accounts.db, async tx => {
      const first = await this.history.staff(tx, access), before = await tx.order.findUnique({ where: { id }, select: { userId: true } }); if (!before) throw missing();
      // Coordinate actor deactivation and customer/order transitions using fresh MVCC tuples in stable identity order.
      for (const identity of [first.id, before.userId].sort()) await tx.$queryRaw`UPDATE "User" SET "updatedAt"="updatedAt" WHERE id=${identity}::uuid RETURNING id`;
      const actor = await this.history.staff(tx, access), receipt = { actorScope: actor.id, operation: 'ORDER.LOGISTICS', key }, hash = payloadHash({ id, input });
      const replay = await tx.idempotencyRecord.findUnique({ where: { actorScope_operation_key: receipt } }); if (replay) { if (replay.requestHash !== hash) throw new CartError(409, 'IDEMPOTENCY_CONFLICT', 'Esta atualização já foi usada com outros dados.'); return; }
      const row = await tx.order.findUniqueOrThrow({ where: { id }, include: historyInclude }), now = this.accounts.clock.now();
      if (row.version !== input.version) throw new CartError(409, 'ORDER_VERSION_CONFLICT', 'O pedido mudou. Atualize e confira a etapa atual.');
      if (nextLogistics[row.status] !== input.status) throw new CartError(409, 'ORDER_STAGE_CONFLICT', 'Esta etapa não pode ser registrada a partir do estado atual.');
      const kept = row.items.flatMap(item => item.units).filter(unit => unit.commercialState === 'KEPT'); if (!kept.length) throw new CartError(409, 'NO_REMAINING_ORDER_UNITS', 'Não há unidades remanescentes para essa operação logística.');
      let occurredAt = now, shipment = row.shipments[0];
      if (input.status === 'SHIPPED') {
        const postedAt = new Date(input.postedAt); if (!row.paidAt || postedAt < row.paidAt || postedAt > now) throw new CartError(422, 'INVALID_SHIPMENT_DATE', 'A postagem deve ser efetiva, posterior ao pagamento e não pode estar no futuro.');
        if (shipment) throw new CartError(409, 'ORIGINAL_SHIPMENT_EXISTS', 'Este pedido já possui uma remessa original.');
        shipment = await tx.shipment.create({ data: { orderId: id, kind: 'ORIGINAL', trackingCode: input.trackingCode, postedAt, createdById: actor.id, createdAt: now } }); occurredAt = postedAt;
      }
      if (input.status === 'DELIVERED') {
        const deliveredAt = new Date(input.deliveredAt); if (!shipment || shipment.deliveredAt || deliveredAt < shipment.postedAt || deliveredAt > now) throw new CartError(422, 'INVALID_DELIVERY_DATE', 'Confira a remessa original e a data efetiva da entrega, sem datas futuras ou anteriores à postagem.');
        shipment = await tx.shipment.update({ where: { id: shipment.id }, data: { deliveredAt } });
        const updatedUnits = await tx.orderUnit.updateMany({ where: { orderItem: { orderId: id }, commercialState: 'KEPT', deliveredAt: null }, data: { deliveredAt } }); if (updatedUnits.count !== kept.length) throw new CartError(409, 'DELIVERY_STATE_CONFLICT', 'Não foi possível conciliar a entrega das unidades.'); occurredAt = deliveredAt;
      }
      const updated = await tx.order.update({ where: { id }, data: { status: input.status, version: { increment: 1 } } });
      await orderEvent(tx, this.accounts.clock, { orderId: id, version: updated.version, fromStatus: row.status, toStatus: input.status, reason: input.reason, occurredAt, actor });
      await appendAudit(tx, { actorId: actor.id, action: 'ORDER.STATUS_CHANGED', targetType: 'ORDER', targetId: id, result: 'SUCCESS', reason: 'MANUAL_ORIGINAL_LOGISTICS', changes: { from: row.status, to: input.status, effectiveAt: occurredAt.toISOString(), shipmentId: shipment?.id ?? null } }, this.accounts.clock);
      if (input.status === 'SHIPPED' || input.status === 'DELIVERED') await enqueue(tx, { type: 'ORDER.' + input.status, aggregateId: id, payload: { userId: row.userId, orderId: id, shipmentId: shipment!.id } }, this.accounts.clock);
      await tx.idempotencyRecord.create({ data: { ...receipt, requestHash: hash, resultRef: id, createdAt: now } });
    });
    return this.history.detail(access, id, undefined, true);
  }
}
