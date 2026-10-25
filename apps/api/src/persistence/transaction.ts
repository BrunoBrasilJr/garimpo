import { AppError } from '../core/errors.ts';
import type { Database, Prisma } from './client.ts';

function isRetryable(error: unknown, depth = 0): boolean {
  if (!error || typeof error !== 'object' || depth > 4) return false;
  const value = error as Record<string, unknown>;
  if (['P2034', '40001', '40P01'].includes(String(value.code ?? value.sqlState ?? value.originalCode))) return true;
  return ['cause', 'meta', 'driverAdapterError'].some(key => isRetryable(value[key], depth + 1));
}

/** Callback is retried in full: database operations only, no external I/O. */
export async function serializable<T>(db: Database, work: (tx: Prisma.TransactionClient) => Promise<T>): Promise<T> {
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      return await db.$transaction(work, { isolationLevel: 'Serializable', maxWait: 5000, timeout: 10000 });
    } catch (error) {
      if (!isRetryable(error)) throw error;
      if (attempt === 3) throw new AppError('TRANSACTION_CONFLICT');
    }
  }
  throw new AppError('TRANSACTION_CONFLICT');
}
