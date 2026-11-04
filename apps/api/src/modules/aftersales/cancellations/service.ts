import { randomUUID } from 'node:crypto';
import type { CancellationResult } from '@garimpo/contracts';
import { appendAudit } from '../../../core/audit.ts';
import { payloadHash } from '../../../core/idempotency.ts';
import { enqueue } from '../../../core/outbox.ts';
import { serializable } from '../../../persistence/transaction.ts';
import { lockIdentities, staff } from '../../accounts/blocking-helpers.ts';
import type { Accounts } from '../../accounts/service.ts';
import { CartError, missing } from '../../cart/errors.ts';
import { lockCoupons } from '../../checkout/lifecycle.ts';
import { captureAvailability, publishAvailability } from '../../engagement/availability.ts';
import { adjustCancelledStock } from '../../inventory/cancellation.ts';
import { lockOffers } from '../../inventory/reservations.ts';
import { orderEvent } from '../../orders/events.ts';
import { include } from '../../orders/service.ts';
import { replaceCharge } from '../../payments/charges.ts';
import type { AutomaticRefunds } from '../../refunds/automatic.ts';
import { cancellationRefund } from '../../refunds/cancellation.ts';
import type { CancellationInput } from './validation.ts';

export class Cancellations {
  readonly accounts: Accounts;
  readonly refunds: AutomaticRefunds;

  constructor(accounts: Accounts, refunds: AutomaticRefunds) {
    this.accounts = accounts;
    this.refunds = refunds;
  }

  async apply(access: string, id: string, input: CancellationInput, key: string): Promise<CancellationResult> {
    const { db, clock } = this.accounts;
    const loss = 'unitIds' in input ? input : null;
    const unavailable = new Set(loss?.unitIds);
    const kind = loss ? 'UNAVAILABLE' : 'DIRECT';
    const row = await serializable(db, async tx => {
      const authorize = async () => loss ? staff(this.accounts, tx, access) : (await this.accounts.authorize(tx, access, true)).user;
      const first = await authorize();
      const target = await tx.order.findFirst({ where: { id, ...(!loss ? { userId: first.id } : {}) }, select: { userId: true } });
      if (!target) throw missing();
      await lockIdentities(tx, [first.id, target.userId]);
      const actor = await authorize();
      const identity = { actorScope: actor.id, operation: 'ORDER.CANCELLATION.' + kind, key };
      const requestHash = payloadHash({ id, reason: input.reason, version: loss?.version ?? null, units: [...unavailable].sort() });
      const replay = await tx.idempotencyRecord.findUnique({ where: { actorScope_operation_key: identity } });
      if (replay) {
        if (replay.requestHash !== requestHash) throw new CartError(409, 'IDEMPOTENCY_CONFLICT', 'Esta tentativa já foi usada com outros dados.');
        return tx.cancellationRequest.findUniqueOrThrow({ where: { id: replay.resultRef } });
      }

      const order = await tx.order.findUniqueOrThrow({ where: { id }, include });
      if (loss && order.version !== loss.version) throw new CartError(409, 'ORDER_VERSION_CONFLICT', 'O pedido mudou. Atualize antes de registrar a indisponibilidade.');
      const validStages = loss ? ['PENDING', 'PAID', 'PREPARING', 'SEPARATED'] : ['PENDING', 'PAID'];
      if (!validStages.includes(order.status)) {
        const afterSale = ['PREPARING', 'SEPARATED', 'SHIPPED', 'DELIVERED'].includes(order.status);
        throw new CartError(409, afterSale && !loss ? 'RETURN_REQUIRED' : 'CANCELLATION_NOT_ALLOWED', afterSale && !loss
          ? 'O cancelamento direto encerrou. Consulte o atendimento de devolução.'
          : 'A etapa do pedido não permite este cancelamento.');
      }
      const kept = order.items.flatMap(item => item.units).filter(unit => unit.commercialState === 'KEPT');
      const selected = loss ? kept.filter(unit => unavailable.has(unit.id)) : kept;
      if (!selected.length || loss && selected.length !== unavailable.size) throw new CartError(422, 'INVALID_CANCELLATION_UNITS', 'Selecione unidades remanescentes deste pedido.');
      const offers = order.items.map(item => item.offerId);
      const usage = await tx.couponUsage.findUnique({ where: { orderId: id } });
      await lockOffers(tx, offers);
      await lockCoupons(tx, [usage?.couponId]);
      const now = clock.now();
      const pending = order.status === 'PENDING';
      const expired = pending && order.expiresAt !== null && order.expiresAt <= now;
      const affected = expired ? kept : selected;
      const affectedIds = new Set(affected.map(unit => unit.id));
      const full = affected.length === kept.length;
      const availability = await captureAvailability(tx, offers, expired ? null : now);

      await tx.orderUnit.updateMany({ where: { id: { in: [...affectedIds] } }, data: { commercialState: 'CANCELLED' } });
      let replacementChargeId: string | null = null;
      if (pending) {
        for (const item of order.items) {
          const remaining = item.units.filter(unit => unit.commercialState === 'KEPT' && !affectedIds.has(unit.id)).length;
          if (!item.units.some(unit => affectedIds.has(unit.id))) continue;
          const holds = await tx.reservation.updateMany({
            where: { orderItemId: item.id, status: 'ACTIVE' },
            data: remaining ? { quantity: remaining } : { status: 'RELEASED', releasedAt: now }
          });
          if (holds.count !== 1) throw new CartError(409, 'RESERVATION_STATE_CONFLICT', 'A reserva do pedido mudou.');
        }
        const charge = order.charges.find(value => value.status === 'ACTIVE');
        if (!charge) throw new CartError(409, 'CHARGE_UNAVAILABLE', 'A cobrança ativa do pedido mudou.');
        if (full) {
          await tx.paymentCharge.update({ where: { id: charge.id }, data: { status: 'CANCELLED' } });
        } else {
          const productCents = kept.reduce((total, unit) => total + (affectedIds.has(unit.id) ? 0n : BigInt(unit.netPaidCents)), 0n);
          const replacement = await replaceCharge(tx, id, charge.id, productCents, charge.shippingCents, { now: () => now });
          if (!replacement) throw new Error('A partial pending order requires a replacement charge.');
          replacementChargeId = replacement.id;
        }
      }
      if (full && usage?.status === 'CONSUMED') await tx.couponUsage.update({ where: { orderId: id }, data: { status: 'RELEASED', releasedAt: now } });

      const cancellationId = randomUUID();
      await adjustCancelledStock(tx, clock, cancellationId, order, affectedIds, unavailable, actor.id);
      const refund = pending ? null : await cancellationRefund(tx, clock, id, cancellationId,
        affected.reduce((sum, unit) => sum + BigInt(unit.netPaidCents), 0n), full ? order.shippingCents : 0);
      const updated = await tx.order.update({ where: { id }, data: { status: full ? 'CANCELLED' : order.status, version: { increment: 1 } } });
      if (full) await orderEvent(tx, clock, { orderId: id, version: updated.version, fromStatus: order.status, toStatus: 'CANCELLED', reason: input.reason, occurredAt: now, actor });
      const record = await tx.cancellationRequest.create({ data: {
        id: cancellationId, orderId: id, actorId: actor.id, kind, reason: input.reason, unitIds: [...affectedIds],
        unavailableUnitIds: [...unavailable], orderStatus: updated.status, orderVersion: updated.version,
        refundId: refund?.id ?? null, replacementChargeId, createdAt: now
      } });
      await appendAudit(tx, { actorId: actor.id, action: 'ORDER.CANCELLATION.' + kind, targetType: 'ORDER', targetId: id,
        result: 'SUCCESS', reason: input.reason, changes: { cancellationId, unitIds: record.unitIds, unavailableUnitIds: record.unavailableUnitIds, replacementChargeId, refundId: record.refundId } }, clock);
      await enqueue(tx, { type: full ? 'ORDER.CANCELLED_DIRECT' : 'ORDER.PARTIAL_CANCELLATION', aggregateId: id, payload: { orderId: id, userId: order.userId } }, clock);
      await publishAvailability(tx, availability, clock);
      await tx.idempotencyRecord.create({ data: { ...identity, requestHash, resultRef: cancellationId, createdAt: now } });
      return record;
    });

    if (row.refundId) await this.refunds.run(row.refundId, 'automatic:' + row.refundId);
    return { id: row.id, orderId: row.orderId, orderStatus: row.orderStatus, orderVersion: row.orderVersion,
      unitIds: row.unitIds, unavailableUnitIds: row.unavailableUnitIds, refundId: row.refundId,
      replacementChargeId: row.replacementChargeId, createdAt: row.createdAt.toISOString() };
  }
}
