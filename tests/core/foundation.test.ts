import { expect, test, vi } from 'vitest';
import { publicError, AppError } from '../../apps/api/src/core/errors';
import { payloadHash } from '../../apps/api/src/core/idempotency';
import { redact } from '../../apps/api/src/core/audit';
import { serializable } from '../../apps/api/src/persistence/transaction';
import type { Database } from '../../apps/api/src/persistence/client';

test('payload hash is canonical for nested objects but preserves array order and values', () => {
  expect(payloadHash({ b: { y: 2, x: 1 }, a: [1, 2] })).toBe(payloadHash({ a: [1, 2], b: { x: 1, y: 2 } }));
  expect(payloadHash([1, 2])).not.toBe(payloadHash([2, 1]));
  expect(payloadHash({ x: 1 })).not.toBe(payloadHash({ x: '1' }));
});

test('ambiguous/non-JSON payloads fail before any transaction', () => {
  for (const value of [undefined, NaN, Infinity, new Date(), { a: undefined }, 1n, new Array(1)]) {
    expect(() => payloadHash(value)).toThrow(AppError);
  }
  const cycle: Record<string, unknown> = {};
  cycle.self = cycle;
  expect(() => payloadHash(cycle)).toThrow(AppError);
});

test('public error envelope never includes unknown exception details or stack', () => {
  const result = publicError(new Error('password=secret database-url'), 'correlation');
  expect(result).toEqual({ status: 500, body: {
    code: 'INTERNAL_ERROR', message: 'Não foi possível concluir a operação.', fieldErrors: {}, correlationId: 'correlation'
  } });
  expect(JSON.stringify(result)).not.toMatch(/secret|stack|database-url/);
  expect(publicError(new AppError('IDEMPOTENCY_CONFLICT')).status).toBe(409);
  expect(publicError(new AppError('INVALID_INPUT')).status).toBe(422);
});

test('audit sanitizes nested secret fields and does not mutate input', () => {
  const input = { passwordHash: 'hidden', nested: [{ refreshToken: 'hidden', role: 'USER' }], email: 'hidden' };
  expect(redact(input)).toEqual({ passwordHash: '[REDACTED]', nested: [{ refreshToken: '[REDACTED]', role: 'USER' }], email: '[REDACTED]' });
  expect(input.passwordHash).toBe('hidden');
});

test('serialization/deadlock failures retry the whole transaction, at most three total attempts', async () => {
  const transaction = vi.fn().mockRejectedValueOnce({ code: 'P2034' })
    .mockRejectedValueOnce({ code: 'P2010', meta: { code: '40P01' } }).mockResolvedValue('done');
  const db = { $transaction: transaction } as unknown as Database;
  expect(await serializable(db, async () => 'unused')).toBe('done');
  expect(transaction).toHaveBeenCalledTimes(3);
  expect(transaction.mock.calls[0]?.[1]).toMatchObject({ isolationLevel: 'Serializable' });
  transaction.mockReset().mockRejectedValue({ code: 'P2034' });
  await expect(serializable(db, async () => 'unused')).rejects.toMatchObject({ code: 'TRANSACTION_CONFLICT' });
  expect(transaction).toHaveBeenCalledTimes(3);
});

test('validation/unique/unknown errors do not cause blind transaction retries', async () => {
  for (const error of [new AppError('INVALID_INPUT'), { code: 'P2002' }, new Error('unknown')]) {
    const transaction = vi.fn().mockRejectedValue(error);
    await expect(serializable({ $transaction: transaction } as unknown as Database, async () => 'unused')).rejects.toBe(error);
    expect(transaction).toHaveBeenCalledTimes(1);
  }
});
