import type { RefundView } from '@garimpo/contracts';
import type { Prisma } from '../../persistence/client.ts';
import type { Clock } from '../../core/clock.ts';
import type { PaymentAttempt } from '../../persistence/generated/client.ts';
import type { Accounts } from '../accounts/service.ts';
import type { PaymentGateway } from '../payments/gateway.ts';
import { serializable } from '../../persistence/transaction.ts';
import { appendAudit } from '../../core/audit.ts';
import { enqueue } from '../../core/outbox.ts';
import { AccountError } from '../accounts/errors.ts';
import { CartError, missing } from '../cart/errors.ts';
import { cents } from '../orders/service.ts';
import { payloadHash } from '../../core/idempotency.ts';
import { lockIdentities } from '../accounts/blocking-helpers.ts';
export const refundInclude = { attempts: { orderBy: [{ createdAt: 'asc' }, { id: 'asc' }] } } satisfies Prisma.RefundInclude;
export function refundView(row: Prisma.RefundGetPayload<{ include: typeof refundInclude }>): RefundView {
  return { id: row.id, status: row.status, origin: row.origin, productCents: cents(row.productCents), shippingCents: row.shippingCents, createdAt: row.createdAt.toISOString(), completedAt: row.completedAt?.toISOString() ?? null, attempts: row.attempts.map(a => ({ id: a.id, result: a.result, createdAt: a.createdAt.toISOString(), receivedAt: a.receivedAt?.toISOString() ?? null })) };
}
/** Executes automatic payment and cancellation obligations. Post-sale approval is separate. */
export class AutomaticRefunds {
  readonly accounts: Accounts; readonly gateway: PaymentGateway;
  constructor(accounts: Accounts, gateway: PaymentGateway) { this.accounts = accounts; this.gateway = gateway; }
  static async obligation(tx: Prisma.TransactionClient, attempt: PaymentAttempt, clock: Clock) {
    const originKey = 'UNAPPLIED_PAYMENT:' + attempt.id, old = await tx.refund.findUnique({ where: { originKey } }); if (old) return old;
    const allocated = await tx.refund.aggregate({ where: { paymentAttemptId: attempt.id }, _sum: { productCents: true, shippingCents: true } });
    if (attempt.result !== 'APPROVED' || (allocated._sum.productCents ?? 0n) + BigInt(allocated._sum.shippingCents ?? 0) + attempt.amountCents > attempt.amountCents) throw new Error('Refund obligation exceeds the original captured amount.');
    const row = await tx.refund.create({ data: { paymentAttemptId: attempt.id, orderId: attempt.orderId, origin: 'AUTOMATIC_PAYMENT', originKey, productCents: attempt.productCents, shippingCents: attempt.shippingCents, createdAt: clock.now() } });
    await enqueue(tx, { type: 'REFUND.PENDING', aggregateId: row.id, payload: { refundId: row.id, userId: attempt.userId, orderId: attempt.orderId } }, clock); return row;
  }
  async admin(tx: Prisma.TransactionClient | Accounts['db'], access: string) { const { user } = await this.accounts.authorize(tx, access); if (user.context !== 'STAFF' || user.role !== 'ADMIN') throw new AccountError(403, 'ADMIN_REQUIRED'); return user; }
  async run(id: string, key: string, scenario?: 'SUCCEEDED' | 'FAILED', access?: string, reason?: string): Promise<RefundView> {
    if (access !== undefined) await this.admin(this.accounts.db, access);
    const first = await this.accounts.db.refund.findUnique({ where: { id }, include: { paymentAttempt: true } }); if (!first) throw missing();
    const prepared = await serializable(this.accounts.db, async tx => {
      const actor = access === undefined ? null : await this.admin(tx, access);
      await lockIdentities(tx, actor ? [first.paymentAttempt.userId, actor.id] : [first.paymentAttempt.userId]);
      if (access !== undefined) await this.admin(tx, access);
      const row = await tx.refund.findUniqueOrThrow({ where: { id }, include: { paymentAttempt: true } });
      if (!['AUTOMATIC_PAYMENT', 'AUTOMATIC_CANCELLATION'].includes(row.origin)) throw new AccountError(403, 'POST_SALE_AUTHORIZATION_REQUIRED');
      const command = actor && reason ? { actorScope: actor.id, operation: 'REFUND.RETRY', key } : null;
      const requestHash = payloadHash({ id, scenario: scenario ?? null, reason: reason ?? null });
      if (command) {
        const prior = await tx.idempotencyRecord.findUnique({ where: { actorScope_operation_key: command } });
        if (prior) {
          if (prior.requestHash !== requestHash) throw new CartError(409, 'IDEMPOTENCY_CONFLICT', 'Esta repetição já foi usada com outros dados.');
          return prior.resultRef === 'COMPLETE' ? null : tx.refundAttempt.findUniqueOrThrow({ where: { id: prior.resultRef } });
        }
      }
      const attemptKey = (command ? 'REFUND_RETRY:' : 'REFUND:') + payloadHash({ id, key, actor: actor?.id ?? 'SYSTEM' });
      const replay = await tx.refundAttempt.findUnique({ where: { attemptKey } });
      if (replay) { if ((scenario && replay.scenario !== scenario) || replay.reason !== (reason ?? null)) throw new CartError(409, 'IDEMPOTENCY_CONFLICT', 'Esta repetição já foi usada com outros dados.'); return replay; }
      // Reuse a durable unfinished provider request, including a successful receipt not applied after a crash.
      const attempt = row.status === 'SUCCEEDED' ? null
        : await tx.refundAttempt.findFirst({ where: { refundId: id, appliedAt: null } })
          ?? await tx.refundAttempt.create({ data: {
            refundId: id, attemptKey, actorId: actor?.id ?? null, reason: reason ?? null,
            scenario: scenario ?? (command || row.paymentAttempt.scenario !== 'APPROVED_REFUND_FAIL' ? 'SUCCEEDED' : 'FAILED'),
            createdAt: this.accounts.clock.now()
          } });
      if (command && reason) {
        await tx.idempotencyRecord.create({ data: { ...command, requestHash, resultRef: attempt?.id ?? 'COMPLETE', createdAt: this.accounts.clock.now() } });
        await appendAudit(tx, { actorId: command.actorScope, action: 'REFUND.RETRY_REQUESTED', targetType: 'REFUND', targetId: id,
          result: 'SUCCESS', reason, changes: { attemptId: attempt?.id ?? null } }, this.accounts.clock);
      }
      return attempt;
    });
    if (prepared) {
      await this.gateway.refund(prepared.id);
      await serializable(this.accounts.db, async tx => {
        await tx.$queryRaw`UPDATE "User" SET "updatedAt"="updatedAt" WHERE id=${first.paymentAttempt.userId}::uuid RETURNING id`;
        const attempt = await tx.refundAttempt.findUniqueOrThrow({ where: { id: prepared.id } }); if (attempt.result === 'PENDING' || attempt.appliedAt) return;
        const row = await tx.refund.findUniqueOrThrow({ where: { id } }); if (row.status === 'SUCCEEDED') throw new Error('Unexpected second refund application.');
        await tx.refund.update({ where: { id }, data: { status: attempt.result, completedAt: attempt.result === 'SUCCEEDED' ? attempt.receivedAt : null } });
        await tx.refundAttempt.update({ where: { id: attempt.id }, data: { appliedAt: this.accounts.clock.now() } });
        if (attempt.result === 'SUCCEEDED') {
          const sold = await tx.financialEvent.count({ where: { paymentAttemptId: first.paymentAttemptId, type: 'SALE' } });
          await tx.financialEvent.create({ data: { orderId: row.orderId, paymentAttemptId: row.paymentAttemptId, refundId: id, type: sold ? 'REFUND' : 'LATE_REFUND', productCents: row.productCents, shippingCents: row.shippingCents, occurredAt: attempt.receivedAt!, eventKey: 'REFUND:' + id } });
        }
        await appendAudit(tx, { ...(attempt.actorId ? { actorId: attempt.actorId } : {}), action: 'REFUND.' + attempt.result, targetType: 'REFUND', targetId: id, result: attempt.result === 'SUCCEEDED' ? 'SUCCESS' : 'FAILURE', reason: attempt.reason ?? 'LOCAL_SIMULATOR_AUTOMATIC_REFUND', changes: { attemptId: attempt.id } }, this.accounts.clock);
        await enqueue(tx, { type: 'REFUND.' + attempt.result, aggregateId: id, payload: { refundId: id, userId: first.paymentAttempt.userId, orderId: row.orderId } }, this.accounts.clock);
      });
    }
    return refundView(await this.accounts.db.refund.findUniqueOrThrow({ where: { id }, include: refundInclude }));
  }
}
