import type { DomainEvent } from '../persistence/generated/client.ts';
import type { Database, Prisma } from '../persistence/client.ts';
import type { Clock } from './clock.ts';
import { systemClock } from './clock.ts';

export function enqueue(tx: Prisma.TransactionClient, event: { type: string; aggregateId: string; payload: Prisma.InputJsonValue }, clock: Clock = systemClock) {
  return tx.domainEvent.create({ data: { ...event, createdAt: clock.now() } });
}

/** Transactional database consumer only. External delivery needs a dedicated adapter/protocol. */
export async function processNext(
  db: Database, handle: (tx: Prisma.TransactionClient, event: DomainEvent) => Promise<void>, clock: Clock = systemClock
): Promise<'EMPTY' | 'PROCESSED' | 'FAILED'> {
  return db.$transaction(async tx => {
    const rows = await tx.$queryRaw<DomainEvent[]>`
      SELECT * FROM "DomainEvent" WHERE "processedAt" IS NULL
      ORDER BY attempts, "createdAt", id FOR UPDATE SKIP LOCKED LIMIT 1`;
    const event = rows[0];
    if (!event) return 'EMPTY';
    await tx.domainEvent.update({ where: { id: event.id }, data: { attempts: { increment: 1 } } });
    await tx.$executeRawUnsafe('SAVEPOINT outbox_effect');
    try {
      await handle(tx, event);
      await tx.domainEvent.update({ where: { id: event.id }, data: { processedAt: clock.now(), lastErrorCode: null } });
      await tx.$executeRawUnsafe('RELEASE SAVEPOINT outbox_effect');
      return 'PROCESSED';
    } catch {
      await tx.$executeRawUnsafe('ROLLBACK TO SAVEPOINT outbox_effect');
      await tx.domainEvent.update({ where: { id: event.id }, data: { lastErrorCode: 'PROCESSING_FAILED' } });
      await tx.$executeRawUnsafe('RELEASE SAVEPOINT outbox_effect');
      return 'FAILED';
    }
  }, { timeout: 10000 });
}
