import { randomUUID } from 'node:crypto';
import type { ErrorEnvelope } from '@garimpo/contracts';

export type ErrorCode = 'INVALID_INPUT' | 'IDEMPOTENCY_CONFLICT' | 'TRANSACTION_CONFLICT';
const messages: Record<ErrorCode, string> = {
  INVALID_INPUT: 'Dados inválidos.',
  IDEMPOTENCY_CONFLICT: 'Esta chave já foi utilizada com outros dados.',
  TRANSACTION_CONFLICT: 'Conflito temporário. Tente novamente.'
};

export class AppError extends Error {
  readonly code: ErrorCode;
  readonly status: number;
  constructor(code: ErrorCode) {
    super(messages[code]);
    this.code = code;
    this.status = code === 'INVALID_INPUT' ? 422 : 409;
  }
}

export function publicError(error: unknown, correlationId: string = randomUUID()): { status: number; body: ErrorEnvelope } {
  const known = error instanceof AppError;
  return {
    status: known ? error.status : 500,
    body: {
      code: known ? error.code : 'INTERNAL_ERROR',
      message: known ? error.message : 'Não foi possível concluir a operação.',
      fieldErrors: {},
      correlationId
    }
  };
}
