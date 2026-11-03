import type { PaymentView, PaymentPage } from '@garimpo/contracts';
import type { Prisma } from '../../persistence/client.ts';
import { Accounts } from '../accounts/service.ts';
import { AccountError } from '../accounts/errors.ts';
import { serializable } from '../../persistence/transaction.ts';
import { payloadHash } from '../../core/idempotency.ts';
import { appendAudit } from '../../core/audit.ts';
import { enqueue } from '../../core/outbox.ts';
import { json } from '../cart/quote.ts';
import { CartError, missing } from '../cart/errors.ts';
import { FreightError } from '../freight/errors.ts';
import { checkoutInclude, closeCheckout, lockCustomer, lockCoupons } from '../checkout/lifecycle.ts';
import { lockOffers } from '../inventory/reservations.ts';
import { consumeOrderStock } from '../inventory/payment.ts';
import { Orders, include, materializeOrder, cents } from '../orders/service.ts';
import { expireOrder } from '../orders/expiry.ts';
import { cardDraft } from './draft.ts';
import { LocalGateway } from './gateway.ts';
import type { PaymentGateway } from './gateway.ts';
import { AutomaticRefunds, refundInclude, refundView } from '../refunds/automatic.ts';
import * as validate from './validation.ts';
import type { CardInput, ChargeInput } from './validation.ts';

export class Payments {
  readonly accounts: Accounts; readonly gateway: PaymentGateway;
  constructor(accounts: Accounts, gateway: PaymentGateway = new LocalGateway(accounts.db, accounts.clock)) { this.accounts = accounts; this.gateway = gateway; }
  async view(id: string): Promise<PaymentView> {
    const row = await this.accounts.db.paymentAttempt.findUniqueOrThrow({ where: { id }, include: { order: { include }, refunds: { include: refundInclude, orderBy: [{ createdAt: 'asc' }, { id: 'asc' }] } } });
    return { id, checkoutId: row.checkoutId, orderId: row.orderId, chargeId: row.chargeId, method: row.method, result: row.result, outcome: row.outcome, amountCents: cents(row.amountCents), createdAt: row.createdAt.toISOString(), receivedAt: row.receivedAt?.toISOString() ?? null, serverTime: this.accounts.clock.now().toISOString(), order: row.order ? new Orders(this.accounts).view(row.order) : null, refunds: row.refunds.map(refundView) };
  }
  async own(access: string, id: string) { const { user } = await this.accounts.authorize(this.accounts.db, access, true); if (!await this.accounts.db.paymentAttempt.count({ where: { id, userId: user.id } })) throw missing(); return this.view(id); }
  async list(access: string, query: { page: number; pageSize: number }): Promise<PaymentPage> {
    const { user } = await this.accounts.authorize(this.accounts.db, access, true), where = { userId: user.id };
    const [total, rows] = await this.accounts.db.$transaction([this.accounts.db.paymentAttempt.count({ where }), this.accounts.db.paymentAttempt.findMany({ where, orderBy: [{ createdAt: 'desc' }, { id: 'desc' }], skip: (query.page - 1) * query.pageSize, take: query.pageSize, select: { id: true } })]);
    return { ...query, total, totalPages: Math.ceil(total / query.pageSize), items: await Promise.all(rows.map(row => this.view(row.id))) };
  }
  async card(access: string, checkoutId: string, input: CardInput, key: string) { return this.submit(access, 'CARD', validate.parse(validate.id, checkoutId), validate.parse(validate.card, input), validate.parse(validate.key, key)); }
  async charge(access: string, orderId: string, input: ChargeInput, key: string) { return this.submit(access, 'CHARGE', validate.parse(validate.id, orderId), validate.parse(validate.charge, input), validate.parse(validate.key, key)); }
  private async submit(access: string, kind: 'CARD' | 'CHARGE', targetId: string, input: CardInput | ChargeInput, key: string): Promise<PaymentView> {
    const hash = payloadHash({ targetId, input }), operation = 'PAYMENT.' + kind;
    const result = await serializable(this.accounts.db, async tx => {
      const user = await lockCustomer(this.accounts, tx, access), receipt = { actorScope: user.id, operation, key }, old = await tx.idempotencyRecord.findUnique({ where: { actorScope_operation_key: receipt } });
      if (old) { if (old.requestHash !== hash) throw new CartError(409, 'IDEMPOTENCY_CONFLICT', 'Esta tentativa já foi usada com outros dados.'); return { id: old.resultRef }; }
      let data: Prisma.PaymentAttemptUncheckedCreateInput;
      if (kind === 'CARD') {
        const card = input as CardInput;
        let draft: Awaited<ReturnType<typeof cardDraft>>;
        try { draft = await cardDraft(this.accounts, tx, user.id, targetId, card); }
        catch (error) { if (error instanceof CartError && error.code === 'CHECKOUT_EXPIRED') { const row = await tx.checkout.findFirst({ where: { id: targetId, userId: user.id }, include: checkoutInclude }); if (row) await closeCheckout(tx, row, 'EXPIRED', this.accounts.clock, 'CARD_PREPARATION_EXPIRED'); return { error }; } throw error; }
        if (await tx.paymentAttempt.count({ where: { checkoutId: targetId, method: 'CARD', appliedAt: null } })) throw new CartError(409, 'PAYMENT_PENDING', 'Há uma tentativa em andamento. Consulte seu resultado antes de tentar outra.');
        data = { userId: user.id, checkoutId: targetId, method: 'CARD', scenario: input.scenario, context: json({ version: card.version, addressId: card.addressId, freightRevision: card.freightRevision }), amountCents: BigInt(draft.snapshot.quote.totalCents + draft.freight.amountCents), productCents: BigInt(draft.snapshot.quote.totalCents), shippingCents: draft.freight.amountCents, eventKey: 'PAYMENT:' + payloadHash(receipt), createdAt: draft.now };
      } else {
        const value = input as ChargeInput, order = await tx.order.findFirst({ where: { id: targetId, userId: user.id }, include }); if (!order) throw missing();
        const usage = await tx.couponUsage.findUnique({ where: { orderId: order.id } }); await lockOffers(tx, order.items.map(item => item.offerId)); await lockCoupons(tx, [usage?.couponId]);
        if (await expireOrder(tx, order.id, this.accounts.clock)) return { error: new CartError(409, 'ORDER_EXPIRED', 'O prazo de pagamento terminou.') };
        const charge = await tx.paymentCharge.findFirst({ where: { id: value.chargeId, orderId: targetId, status: 'ACTIVE' } });
        if (order.status !== 'PENDING' || !charge) throw new CartError(409, 'CHARGE_UNAVAILABLE', 'Esta cobrança não está ativa.');
        if (await tx.paymentAttempt.count({ where: { chargeId: charge.id, appliedAt: null } })) throw new CartError(409, 'PAYMENT_PENDING', 'Há uma tentativa em andamento. Consulte seu resultado.');
        data = { userId: user.id, checkoutId: order.checkoutId, orderId: order.id, chargeId: charge.id, method: charge.method, scenario: input.scenario, context: json({ chargeId: charge.id }), amountCents: charge.amountCents, productCents: charge.productCents, shippingCents: charge.shippingCents, eventKey: 'PAYMENT:' + payloadHash(receipt), createdAt: this.accounts.clock.now() };
      }
      const attempt = await tx.paymentAttempt.create({ data });
      await tx.idempotencyRecord.create({ data: { ...receipt, requestHash: hash, resultRef: attempt.id, createdAt: this.accounts.clock.now() } });
      await appendAudit(tx, { actorId: user.id, action: 'PAYMENT.PREPARED', targetType: 'PAYMENT', targetId: attempt.id, result: 'SUCCESS', reason: 'LOCAL_SIMULATOR_INTENT', changes: { method: attempt.method } }, this.accounts.clock); return { id: attempt.id };
    });
    if (result.error) throw result.error;
    // Intention is committed. A provider exception leaves the original reference resumable.
    await this.gateway.capture(result.id!); await this.apply(result.id!); return this.own(access, result.id!);
  }
  /** Technical application also runs for blocked accounts; it must return captured money instead of dropping the receipt. */
  async apply(id: string) {
    const first = await this.accounts.db.paymentAttempt.findUniqueOrThrow({ where: { id } });
    await serializable(this.accounts.db, async tx => {
      await tx.$queryRaw`UPDATE "User" SET "updatedAt"="updatedAt" WHERE id=${first.userId}::uuid RETURNING id`;
      const attempt = await tx.paymentAttempt.findUniqueOrThrow({ where: { id } }); if (attempt.result === 'PENDING' || attempt.appliedAt) return;
      let orderId = attempt.orderId, outcome = 'DECLINED';
      if (attempt.result === 'APPROVED') {
        let paid = false;
        await tx.$executeRawUnsafe('SAVEPOINT apply_payment');
        try {
          if (attempt.method === 'CARD') {
            const input = validate.parse(validate.card, { ...(attempt.context as object), scenario: attempt.scenario }), draft = await cardDraft(this.accounts, tx, attempt.userId, attempt.checkoutId, input);
            if (!attempt.receivedAt || attempt.receivedAt >= draft.checkout.expiresAt || attempt.amountCents !== BigInt(draft.snapshot.quote.totalCents + draft.freight.amountCents)) throw new CartError(409, 'PAYMENT_CONTEXT_CHANGED', 'A finalização original mudou ou venceu.');
            const order = await materializeOrder(this.accounts, tx, draft.checkout, draft.snapshot, draft.address, draft.freight, 'CARD', draft.now);
            await consumeOrderStock(tx, order, this.accounts.clock); orderId = order.id; paid = true;
          } else {
            const order = await tx.order.findUniqueOrThrow({ where: { id: attempt.orderId! }, include }), usage = await tx.couponUsage.findUnique({ where: { orderId: order.id } });
            await lockOffers(tx, order.items.map(item => item.offerId)); await lockCoupons(tx, [usage?.couponId]);
            const charge = await tx.paymentCharge.findUniqueOrThrow({ where: { id: attempt.chargeId! } }), user = await tx.user.findUniqueOrThrow({ where: { id: attempt.userId } });
            await expireOrder(tx, order.id, this.accounts.clock);
            const now = this.accounts.clock.now();
            if (order.status === 'PENDING' && order.expiresAt && order.expiresAt > now && attempt.receivedAt && attempt.receivedAt < order.expiresAt && charge.status === 'ACTIVE' && charge.expiresAt > now && charge.amountCents === attempt.amountCents && !user.blockedAt && !user.closedAt && !user.inactiveAt) {
              await consumeOrderStock(tx, order, this.accounts.clock);
              await tx.order.update({ where: { id: order.id }, data: { status: 'PAID', paidAt: attempt.receivedAt, version: { increment: 1 } } });
              await tx.paymentCharge.update({ where: { id: charge.id }, data: { status: 'PAID' } }); paid = true;
            }
          }
          await tx.$executeRawUnsafe('RELEASE SAVEPOINT apply_payment');
        } catch (error) {
          if (!(error instanceof CartError || error instanceof FreightError || error instanceof AccountError)) throw error;
          await tx.$executeRawUnsafe('ROLLBACK TO SAVEPOINT apply_payment'); await tx.$executeRawUnsafe('RELEASE SAVEPOINT apply_payment');
          orderId = attempt.orderId;
          const checkout = await tx.checkout.findUniqueOrThrow({ where: { id: attempt.checkoutId }, include: checkoutInclude });
          if (checkout.status === 'ACTIVE' && checkout.expiresAt <= this.accounts.clock.now()) { await lockOffers(tx, checkout.items.map(item => item.offerId)); await lockCoupons(tx, [checkout.couponUsage?.couponId]); await closeCheckout(tx, checkout, 'EXPIRED', this.accounts.clock, 'CARD_RECEIVED_AFTER_DEADLINE', null); }
        }
        if (paid) {
          outcome = 'PAID';
          await tx.financialEvent.create({ data: { orderId, paymentAttemptId: id, type: 'SALE', productCents: attempt.productCents, shippingCents: attempt.shippingCents, occurredAt: attempt.receivedAt!, eventKey: 'SALE:' + orderId } });
        } else {
          outcome = 'REFUND_REQUIRED';
          await AutomaticRefunds.obligation(tx, attempt, this.accounts.clock);
        }
      }
      await tx.paymentAttempt.update({ where: { id }, data: { orderId, outcome, appliedAt: this.accounts.clock.now() } });
      await appendAudit(tx, { action: 'PAYMENT.' + outcome, targetType: 'PAYMENT', targetId: id, result: 'SUCCESS', reason: 'DURABLE_LOCAL_RECEIPT', changes: { orderId } }, this.accounts.clock);
      await enqueue(tx, { type: 'PAYMENT.' + outcome, aggregateId: id, payload: { paymentAttemptId: id, orderId, userId: attempt.userId } }, this.accounts.clock);
    });
    const refunds = await this.accounts.db.refund.findMany({ where: { paymentAttemptId: id, status: 'PENDING' }, select: { id: true } });
    for (const refund of refunds) await new AutomaticRefunds(this.accounts, this.gateway).run(refund.id, 'automatic:' + refund.id);
  }
}
