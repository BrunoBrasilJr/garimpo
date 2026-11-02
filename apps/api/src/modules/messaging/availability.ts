import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import type { DomainEvent } from '../../persistence/generated/client.ts';
import { serializable } from '../../persistence/transaction.ts';
import { appendAudit } from '../../core/audit.ts';
import type { AccessMessages } from './service.ts';

const payload = z.object({ editionId: z.string().uuid(), kind: z.enum(['NEW', 'USED']), title: z.string() }).strict();
/** No network: this consumer prepares protected messages for the durable local test mailbox. */
export async function consumeAvailability(messages: AccessMessages): Promise<'EMPTY' | 'PROCESSED' | 'FAILED'> {
  const { db, clock } = messages.accounts;
  return serializable(db, async tx => {
    const rows = await tx.$queryRaw<DomainEvent[]>`SELECT * FROM "DomainEvent" WHERE type = 'AVAILABILITY.RETURNED' AND "processedAt" IS NULL ORDER BY attempts, "createdAt", id FOR UPDATE SKIP LOCKED LIMIT 1`;
    const event = rows[0]; if (!event) return 'EMPTY';
    await tx.domainEvent.update({ where: { id: event.id }, data: { attempts: { increment: 1 } } });
    await tx.$executeRawUnsafe('SAVEPOINT availability_preparation');
    try {
      const value = payload.parse(event.payload);
      if (value.editionId !== event.aggregateId) throw new Error('Invalid aggregate.');
      const alerts = await tx.$queryRaw<{ id: string }[]>`SELECT id FROM "AvailabilityAlert" WHERE "triggerEventId" = ${event.id}::uuid AND status = 'ACTIVE' ORDER BY id FOR UPDATE`;
      for (const { id } of alerts) {
        if (await tx.demoMessage.findUnique({ where: { availabilityAlertId: id } })) continue;
        const alert = await tx.availabilityAlert.findUniqueOrThrow({ where: { id }, include: { user: true } });
        const messageId = randomUUID(), recipient = alert.user.emailNormalized;
        const body = { recipient, purpose: 'AVAILABILITY', editionId: value.editionId, title: value.title, kind: value.kind,
          link: `${messages.webOrigin}/#/edition?id=${value.editionId}`, notice: 'Disponibilidade sem reserva ou prioridade; o estoque pode se esgotar.' };
        await tx.demoMessage.create({ data: { id: messageId, userId: alert.userId, eventId: event.id, availabilityAlertId: id,
          type: 'AVAILABILITY.RETURNED', restrictedBody: messages.protection.seal(messageId, JSON.stringify(body)), dedupKey: 'availability:' + id, createdAt: clock.now() } });
      }
      await tx.domainEvent.update({ where: { id: event.id }, data: { processedAt: clock.now(), lastErrorCode: null } });
      await tx.$executeRawUnsafe('RELEASE SAVEPOINT availability_preparation'); return 'PROCESSED';
    } catch {
      await tx.$executeRawUnsafe('ROLLBACK TO SAVEPOINT availability_preparation');
      await tx.domainEvent.update({ where: { id: event.id }, data: { lastErrorCode: 'AVAILABILITY_PREPARATION_FAILED' } });
      await appendAudit(tx, { action: 'AVAILABILITY.PREPARE_FAILED', targetType: 'EVENT', targetId: event.id, result: 'FAILURE', reason: 'LOCAL_PREPARATION_FAILED', changes: {} }, clock);
      await tx.$executeRawUnsafe('RELEASE SAVEPOINT availability_preparation'); return 'FAILED';
    }
  });
}

export async function deliverAvailability(messages: AccessMessages, localCheck: (id: string) => void = () => {}): Promise<'EMPTY' | 'DELIVERED' | 'FAILED'> {
  const { db, clock } = messages.accounts;
  return serializable(db, async tx => {
    // All workers acquire the activation before its message, including cancellation.
    const rows = await tx.$queryRaw<{ id: string }[]>`SELECT a.id FROM "AvailabilityAlert" a JOIN "DemoMessage" m ON m."availabilityAlertId" = a.id
      JOIN "User" u ON u.id = a."userId" WHERE a.status = 'ACTIVE' AND m.type = 'AVAILABILITY.RETURNED' AND m.status IN ('PENDING', 'FAILED')
      AND u."blockedAt" IS NULL AND u."closedAt" IS NULL AND u."inactiveAt" IS NULL
      ORDER BY m.attempts, m."createdAt", m.id FOR UPDATE OF a SKIP LOCKED LIMIT 1`;
    const row = rows[0]; if (!row) return 'EMPTY';
    const message = await tx.demoMessage.findUniqueOrThrow({ where: { availabilityAlertId: row.id } });
    const user = await tx.user.findUniqueOrThrow({ where: { id: message.userId! } });
    const body = JSON.parse(messages.protection.open(message.id, message.restrictedBody)) as Record<string, unknown>;
    body.recipient = user.emailNormalized;
    let delivered = true; try { localCheck(message.id); } catch { delivered = false; }
    await tx.demoMessage.update({ where: { id: message.id }, data: { status: delivered ? 'DELIVERED' : 'FAILED', attempts: { increment: 1 },
      restrictedBody: messages.protection.seal(message.id, JSON.stringify(body)), ...(delivered ? { deliveredAt: clock.now() } : {}) } });
    if (delivered) await tx.availabilityAlert.update({ where: { id: row.id }, data: { status: 'DELIVERED', closedAt: clock.now() } });
    await appendAudit(tx, { action: delivered ? 'AVAILABILITY.DELIVERED' : 'AVAILABILITY.DELIVERY_FAILED', targetType: 'MESSAGE', targetId: message.id,
      result: delivered ? 'SUCCESS' : 'FAILURE', reason: 'LOCAL_MAILBOX_DELIVERY', changes: {} }, clock);
    return delivered ? 'DELIVERED' : 'FAILED';
  });
}
