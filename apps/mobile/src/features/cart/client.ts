import { GuestDataError } from '@garimpo/contracts';
import { errorMessage, MobileAccountClient } from '../account/client';
export function cartRequest<T>(client: MobileAccountClient, accountId: string, path: string, method = 'GET', body?: unknown, signal?: AbortSignal, key?: string) {
  return client.request<T>(path, method, body, true, { accountId, ...(signal ? { signal } : {}), ...(key ? { idempotencyKey: key } : {}) });
}
export const cartError = (cause: unknown) => cause instanceof GuestDataError ? cause.message : errorMessage(cause);
export function quantity(value: string) { const result = Number(value); if (!/^\d+$/.test(value) || !Number.isSafeInteger(result) || result < 1 || result > 1000) throw new GuestDataError('Informe uma quantidade inteira de 1 a 1000.'); return result; }
