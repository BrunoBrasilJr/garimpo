import { createHash, randomUUID } from 'node:crypto';
import type { Clock } from './clock.ts';
import { systemClock } from './clock.ts';
import { AppError } from './errors.ts';
import type { Database, Prisma } from '../persistence/client.ts';
import { serializable } from '../persistence/transaction.ts';

function canonical(value: unknown, depth = 0): string {
  if (depth > 50) throw new AppError('INVALID_INPUT');
  if (value === null || typeof value === 'boolean' || typeof value === 'string') return JSON.stringify(value);
  if (typeof value === 'number' && Number.isFinite(value)) return JSON.stringify(value);
  if (Array.isArray(value)) {
    for (let index = 0; index < value.length; index++) {
      if (!Object.hasOwn(value, index)) throw new AppError('INVALID_INPUT');
    }
    return '[' + value.map(item => canonical(item, depth + 1)).join(',') + ']';
  }
  if (value && typeof value === 'object' && Object.getPrototypeOf(value) === Object.prototype) {
    const object = value as Record<string, unknown>;
    return '{' + Object.keys(object).sort().map(key => JSON.stringify(key) + ':' + canonical(object[key], depth + 1)).join(',') + '}';
  }
  throw new AppError('INVALID_INPUT');
}

export function payloadHash(payload: unknown): string {
  return createHash('sha256').update(canonical(payload)).digest('hex');
}

export interface IdempotentCommand { actorScope: string; operation: string; key: string; payload: unknown }

/** Actor scope must come from the authenticated caller, never from a public payload. */
export async function idempotent(
  db: Database, command: IdempotentCommand,
  effect: (tx: Prisma.TransactionClient, now: Date) => Promise<string>, clock: Clock = systemClock
): Promise<{ resultRef: string; replayed: boolean }> {
  for (const [value, limit] of [[command.actorScope, 200], [command.operation, 100], [command.key, 128]] as const) {
    if (!value || value.length > limit) throw new AppError('INVALID_INPUT');
  }
  const hash = payloadHash(command.payload);
  return serializable(db, async tx => {
    const now = clock.now();
    const inserted = await tx.$executeRaw`
      INSERT INTO "IdempotencyRecord" (id, "actorScope", operation, key, "requestHash", "resultRef", "createdAt")
      VALUES (${randomUUID()}::uuid, ${command.actorScope}, ${command.operation}, ${command.key}, ${hash}, '', ${now})
      ON CONFLICT ("actorScope", operation, key) DO NOTHING`;
    const where = { actorScope_operation_key: { actorScope: command.actorScope, operation: command.operation, key: command.key } };
    const record = await tx.idempotencyRecord.findUniqueOrThrow({ where });
    if (record.requestHash !== hash) throw new AppError('IDEMPOTENCY_CONFLICT');
    if (!inserted) return { resultRef: record.resultRef, replayed: true };
    const resultRef = await effect(tx, now);
    if (!resultRef) throw new Error('Effect must return a persistent result reference.');
    await tx.idempotencyRecord.update({ where, data: { resultRef } });
    return { resultRef, replayed: false };
  });
}
