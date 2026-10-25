import { randomUUID } from 'node:crypto';
import type { Prisma } from '../persistence/client.ts';
import type { Clock } from './clock.ts';
import { systemClock } from './clock.ts';

const sensitive = /password|passwd|senha|token|credential|secret|authorization|cookie|restrictedbody|email|address|payload/i;

export function redact(value: Prisma.InputJsonValue, depth = 0): Prisma.InputJsonValue {
  if (depth > 20) return '[REDACTED]';
  if (Array.isArray(value)) return value.map(item => item === null ? null : redact(item, depth + 1));
  if (value !== null && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [
      key, sensitive.test(key) ? '[REDACTED]' : item === null ? null : item === undefined ? '[REDACTED]' : redact(item, depth + 1)
    ]));
  }
  return value;
}

interface AuditEntry {
  actorId?: string;
  action: string;
  targetType: string;
  targetId: string;
  result: 'SUCCESS' | 'FAILURE';
  /** Stable reason code, never raw exception/user text. */
  reason: string;
  changes: Prisma.InputJsonValue;
  correlationId?: string;
}

export async function appendAudit(tx: Prisma.TransactionClient, entry: AuditEntry, clock: Clock = systemClock) {
  for (const code of [entry.action, entry.targetType, entry.reason]) {
    if (!/^[A-Z][A-Z0-9_.-]{0,99}$/.test(code)) throw new Error('Audit metadata must use stable codes.');
  }
  return tx.auditLog.create({ data: {
    ...(entry.actorId ? { actorId: entry.actorId } : {}),
    action: entry.action, targetType: entry.targetType, targetId: entry.targetId,
    result: entry.result, reason: entry.reason, redactedChanges: redact(entry.changes),
    correlationId: entry.correlationId ?? randomUUID(), createdAt: clock.now()
  } });
}
