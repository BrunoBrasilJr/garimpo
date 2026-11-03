import type { Database } from '../../persistence/client.ts';
import type { Clock } from '../../core/clock.ts';
import { serializable } from '../../persistence/transaction.ts';
import { payloadHash } from '../../core/idempotency.ts';
/** Replaceable boundary. Implementations use their own durable reference; never receive a business transaction. */
export interface PaymentGateway { capture(attemptId: string): Promise<void>; refund(refundAttemptId: string): Promise<void> }
export class LocalGateway implements PaymentGateway {
  readonly db: Database; readonly clock: Clock;
  constructor(db: Database, clock: Clock) { this.db = db; this.clock = clock; }
  async capture(id: string) {
    const row = await this.db.paymentAttempt.findUniqueOrThrow({ where: { id } });
    if (row.scenario === 'PENDING' || row.result !== 'PENDING') return;
    await this.event(id, row.scenario === 'DECLINED' ? 'DECLINED' : 'APPROVED');
  }
  /** LOCAL technical event, never an anonymous HTTP callback or a caller-supplied amount/time. */
  async event(id: string, result: 'APPROVED' | 'DECLINED', eventId = 'capture:' + id) {
    await serializable(this.db, async tx => {
      const receipt = { actorScope: 'LOCAL_SIMULATOR', operation: 'PAYMENT.EVENT', key: eventId }, hash = payloadHash({ id, result });
      const replay = await tx.idempotencyRecord.findUnique({ where: { actorScope_operation_key: receipt } });
      if (replay) { if (replay.requestHash !== hash) throw new Error('Simulator event identity was reused.'); return; }
      await tx.paymentAttempt.updateMany({ where: { id, result: 'PENDING' }, data: { result, receivedAt: this.clock.now() } });
      const row = await tx.paymentAttempt.findUniqueOrThrow({ where: { id } });
      if (row.result !== result) throw new Error('A terminal simulator receipt cannot change.');
      await tx.idempotencyRecord.create({ data: { ...receipt, requestHash: hash, resultRef: id, createdAt: this.clock.now() } });
    });
  }
  async refund(id: string) {
    const row = await this.db.refundAttempt.findUniqueOrThrow({ where: { id } });
    if (row.result !== 'PENDING') return;
    await this.db.refundAttempt.updateMany({ where: { id, result: 'PENDING' }, data: { result: row.scenario === 'FAILED' ? 'FAILED' : 'SUCCEEDED', receivedAt: this.clock.now() } });
  }
}
