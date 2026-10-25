import type { DomainEvent } from '../../persistence/generated/client.ts';
import { appendAudit } from '../../core/audit.ts';
import { serializable } from '../../persistence/transaction.ts';
import { AccessMessages, available } from './service.ts';

/** Dedicated access-event consumer. Never consumes unknown/future commercial events. */
export async function consumeRegistration(messages: AccessMessages): Promise<'EMPTY' | 'PROCESSED' | 'FAILED'> {
  return serializable(messages.accounts.db, async tx => {
    const rows = await tx.$queryRaw<DomainEvent[]>`SELECT * FROM "DomainEvent"
      WHERE "processedAt" IS NULL AND type = 'ACCOUNT.EMAIL_VERIFICATION_REQUESTED'
      ORDER BY attempts, "createdAt", id FOR UPDATE SKIP LOCKED LIMIT 1`;
    const event = rows[0]; if (!event) return 'EMPTY';
    await tx.domainEvent.update({ where: { id: event.id }, data: { attempts: { increment: 1 } } });
    await tx.$executeRawUnsafe('SAVEPOINT access_message');
    try {
      const user = await tx.user.findUnique({ where: { id: event.aggregateId } });
      if (user && available(user) && !user.emailVerifiedAt) {
        // A resend already queued supersedes this delayed registration event.
        if (!await tx.emailToken.count({ where: { userId: user.id, purpose: 'VERIFY' } })) await messages.issue(tx, user, 'VERIFY', user.emailNormalized, event.id);
      }
      await tx.domainEvent.update({ where: { id: event.id }, data: { processedAt: messages.accounts.clock.now(), lastErrorCode: null } });
      await tx.$executeRawUnsafe('RELEASE SAVEPOINT access_message');
      return 'PROCESSED';
    } catch {
      await tx.$executeRawUnsafe('ROLLBACK TO SAVEPOINT access_message');
      await tx.domainEvent.update({ where: { id: event.id }, data: { lastErrorCode: 'MESSAGE_PREPARATION_FAILED' } });
      await appendAudit(tx, { action: 'MESSAGE.PREPARE_FAILED', targetType: 'EVENT', targetId: event.id, result: 'FAILURE', reason: 'LOCAL_PREPARATION_FAILED', changes: {} }, messages.accounts.clock);
      await tx.$executeRawUnsafe('RELEASE SAVEPOINT access_message');
      return 'FAILED';
    }
  });
}
/** Local delivery is a durable mailbox state transition, never external I/O within a transaction. */
export async function deliverNext(messages: AccessMessages, localCheck: (id: string) => void = () => {}): Promise<'EMPTY' | 'DELIVERED' | 'FAILED'> {
  return messages.accounts.db.$transaction(async tx => {
    const rows = await tx.$queryRaw<{ id: string }[]>`SELECT id FROM "DemoMessage" WHERE status IN ('PENDING', 'FAILED')
      ORDER BY attempts, "createdAt", id FOR UPDATE SKIP LOCKED LIMIT 1`;
    const row = rows[0]; if (!row) return 'EMPTY';
    let status: 'DELIVERED' | 'FAILED' = 'DELIVERED';
    try { localCheck(row.id); } catch { status = 'FAILED'; }
    await tx.demoMessage.update({ where: { id: row.id }, data: { status, attempts: { increment: 1 },
      ...(status === 'DELIVERED' ? { deliveredAt: messages.accounts.clock.now() } : {}) } });
    await appendAudit(tx, { action: status === 'DELIVERED' ? 'MESSAGE.DELIVERED' : 'MESSAGE.DELIVERY_FAILED', targetType: 'MESSAGE', targetId: row.id,
      result: status === 'DELIVERED' ? 'SUCCESS' : 'FAILURE', reason: status === 'DELIVERED' ? 'LOCAL_MAILBOX_DELIVERY' : 'LOCAL_DELIVERY_FAILED', changes: {} }, messages.accounts.clock);
    return status;
  });
}
