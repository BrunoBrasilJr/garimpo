import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import type { DomainEvent } from '../../persistence/generated/client.ts';
import { serializable } from '../../persistence/transaction.ts';
import { appendAudit } from '../../core/audit.ts';
import type { AccessMessages } from './service.ts';
const payload = z.object({ userId: z.string().uuid(), orderId: z.string().uuid().nullable().optional(), paymentAttemptId: z.string().uuid().optional(), refundId: z.string().uuid().optional() }).strict();
export async function consumeCommerce(messages: AccessMessages): Promise<'EMPTY' | 'PROCESSED' | 'FAILED'> {
  const { db, clock } = messages.accounts;
  return serializable(db, async tx => {
    const rows = await tx.$queryRaw<DomainEvent[]>`SELECT * FROM "DomainEvent" WHERE "processedAt" IS NULL AND type IN ('ORDER.CREATED','ORDER.EXPIRED','PAYMENT.PAID','PAYMENT.DECLINED','PAYMENT.REFUND_REQUIRED','REFUND.PENDING','REFUND.FAILED','REFUND.SUCCEEDED') ORDER BY attempts,"createdAt",id FOR UPDATE SKIP LOCKED LIMIT 1`;
    const event = rows[0]; if (!event) return 'EMPTY';
    await tx.domainEvent.update({ where: { id: event.id }, data: { attempts: { increment: 1 } } }); await tx.$executeRawUnsafe('SAVEPOINT commerce_message');
    try {
      const value = payload.parse(event.payload), user = await tx.user.findUniqueOrThrow({ where: { id: value.userId } });
      const order = value.orderId ? await tx.order.findUniqueOrThrow({ where: { id: value.orderId } }) : null;
      const payment = value.paymentAttemptId ? await tx.paymentAttempt.findUniqueOrThrow({ where: { id: value.paymentAttemptId } }) : null;
      const refund = value.refundId ? await tx.refund.findUniqueOrThrow({ where: { id: value.refundId }, include: { paymentAttempt: true } }) : null;
      if ((event.type.startsWith('ORDER.') && event.aggregateId !== order?.id) || (event.type.startsWith('PAYMENT.') && event.aggregateId !== payment?.id) || (event.type.startsWith('REFUND.') && event.aggregateId !== refund?.id) || order && order.userId !== user.id || payment && payment.userId !== user.id || refund && refund.paymentAttempt.userId !== user.id) throw new Error('Commercial message ownership mismatch.');
      const id = randomUUID(), dedupKey = 'commerce:' + event.id;
      if (!await tx.demoMessage.findUnique({ where: { dedupKey } })) await tx.demoMessage.create({ data: { id, userId: user.id, eventId: event.id, type: 'COMMERCE.' + event.type, dedupKey, restrictedBody: messages.protection.seal(id, JSON.stringify({ recipient: user.emailNormalized, purpose: event.type, ...value, notice: 'Simulação acadêmica; nenhuma movimentação financeira real.', link: `${messages.webOrigin}/#/payments` })), createdAt: clock.now() } });
      await tx.domainEvent.update({ where: { id: event.id }, data: { processedAt: clock.now(), lastErrorCode: null } }); await tx.$executeRawUnsafe('RELEASE SAVEPOINT commerce_message'); return 'PROCESSED';
    } catch { await tx.$executeRawUnsafe('ROLLBACK TO SAVEPOINT commerce_message'); await tx.domainEvent.update({ where: { id: event.id }, data: { lastErrorCode: 'COMMERCE_PREPARATION_FAILED' } }); await appendAudit(tx, { action: 'COMMERCE.PREPARE_FAILED', targetType: 'EVENT', targetId: event.id, result: 'FAILURE', reason: 'LOCAL_PREPARATION_FAILED', changes: {} }, clock); await tx.$executeRawUnsafe('RELEASE SAVEPOINT commerce_message'); return 'FAILED'; }
  });
}
export async function deliverCommerce(messages: AccessMessages, localCheck: (id: string) => void = () => {}): Promise<'EMPTY' | 'DELIVERED' | 'FAILED'> {
  const { db, clock } = messages.accounts;
  return serializable(db, async tx => {
    const rows = await tx.$queryRaw<{ id: string }[]>`SELECT id FROM "DemoMessage" WHERE type LIKE 'COMMERCE.%' AND status IN ('PENDING','FAILED') ORDER BY attempts,"createdAt",id FOR UPDATE SKIP LOCKED LIMIT 1`;
    const row = rows[0]; if (!row) return 'EMPTY'; const message = await tx.demoMessage.findUniqueOrThrow({ where: { id: row.id } }), user = await tx.user.findUniqueOrThrow({ where: { id: message.userId! } });
    const body = JSON.parse(messages.protection.open(message.id, message.restrictedBody)) as Record<string, unknown>; body.recipient = user.emailNormalized;
    let status: 'DELIVERED' | 'FAILED' = 'DELIVERED'; try { localCheck(row.id); } catch { status = 'FAILED'; }
    await tx.demoMessage.update({ where: { id: row.id }, data: { status, attempts: { increment: 1 }, restrictedBody: messages.protection.seal(row.id, JSON.stringify(body)), ...(status === 'DELIVERED' ? { deliveredAt: clock.now() } : {}) } });
    await appendAudit(tx, { action: 'COMMERCE.' + status, targetType: 'MESSAGE', targetId: row.id, result: status === 'DELIVERED' ? 'SUCCESS' : 'FAILURE', reason: 'LOCAL_MAILBOX_DELIVERY', changes: {} }, clock); return status;
  });
}
