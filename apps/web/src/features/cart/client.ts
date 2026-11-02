import { GuestDataError } from '@garimpo/contracts';
import { request, readableError } from '../account/client';
export function cartRequest<T>(accountId: string, path: string, method = 'GET', body?: unknown, signal?: AbortSignal, key?: string) {
  return request<T>(path, method, body, true, signal, { accountId, ...(key ? { idempotencyKey: key } : {}) });
}
export const cartError = (cause: unknown) => cause instanceof GuestDataError ? cause.message : readableError(cause);
export function cartChanged() { window.dispatchEvent(new Event('garimpo-account-cart')); }
export function quantity(value: string) { const result = Number(value); if (!/^\d+$/.test(value) || !Number.isSafeInteger(result) || result < 1 || result > 1000) throw new GuestDataError('Informe uma quantidade inteira de 1 a 1000.'); return result; }
