export class ClientError extends Error {
  constructor(readonly status: number, readonly code: string, message: string, readonly fields: Record<string, string[]> = {}) { super(message); }
}
const messages: Record<string, string> = {
  LAST_ADMIN_REQUIRED: 'É necessário manter pelo menos um administrador ativo.',
  INVALID_ACCESS_LINK: 'Este código é inválido, expirou ou já foi usado. Solicite outro link.',
  ACCOUNT_CONFLICT: 'Este endereço de e-mail já está em uso.',
  AUTH_RATE_LIMIT: 'Muitas tentativas. Aguarde alguns minutos e tente novamente.',
  ACCESS_RATE_LIMIT: 'Muitas tentativas. Aguarde alguns minutos e tente novamente.'
};
export function readableError(error: unknown) { return error instanceof ClientError ? error.message : 'Não foi possível concluir. Confira a conexão e tente novamente.'; }
function csrf() {
  const pair = document.cookie.split('; ').find(value => value.startsWith('__Host-garimpo-csrf='));
  return pair ? decodeURIComponent(pair.slice('__Host-garimpo-csrf='.length)) : '';
}
let renewing: Promise<void> | undefined;
async function renew(previous: string) {
  if (!renewing) {
    const work = async () => {
      if (!csrf()) throw new ClientError(401, 'INVALID_SESSION', 'Entre para continuar.');
      if (previous && csrf() !== previous) return;
      await request('/auth/refresh', 'POST', {}, false);
    };
    renewing = (navigator.locks ? navigator.locks.request('garimpo-session-renewal', work).then(() => undefined) : work()).finally(() => { renewing = undefined; });
  }
  return renewing;
}
export interface CommandContext { idempotencyKey?: string; accountId?: string; responseBlob?: boolean }
export async function request<T = Record<string, unknown>>(path: string, method = 'GET', body?: unknown, authenticated = true, signal?: AbortSignal, context?: CommandContext): Promise<T> {
  if ((path === '/auth/login' || path === '/auth/logout') && navigator.locks) {
    return navigator.locks.request('garimpo-session-renewal', () => perform<T>(path, method, body, authenticated, signal, context));
  }
  return perform<T>(path, method, body, authenticated, signal, context);
}
async function perform<T>(path: string, method: string, body: unknown, authenticated: boolean, signal?: AbortSignal, context?: CommandContext): Promise<T> {
  if (location.protocol !== 'https:') throw new ClientError(0, 'HTTPS_REQUIRED', 'Abra a conexão segura do Garimpo para acessar sua conta.');
  const proof = csrf();
  const file = body instanceof Blob ? body : null;
  const execute = () => fetch('/api/v1' + path, { method, credentials: 'include', cache: 'no-store',
    ...(signal ? { signal } : {}), headers: { ...(body === undefined ? {} : { 'Content-Type': file?.type || 'application/json' }),
      ...(method !== 'GET' && csrf() ? { 'X-CSRF-Token': csrf() } : {}),
      ...(context?.idempotencyKey ? { 'Idempotency-Key': context.idempotencyKey } : {}), ...(context?.accountId ? { 'X-Garimpo-Account': context.accountId } : {}) },
    ...(body === undefined ? {} : { body: file ?? JSON.stringify(body) }) });
  let response: Response;
  try {
    response = await execute();
    if (response.status === 401 && authenticated && proof) { await renew(proof); response = await execute(); }
  } catch (error) {
    if (error instanceof ClientError || (error instanceof DOMException && error.name === 'AbortError')) throw error;
    throw new ClientError(0, 'NETWORK_UNAVAILABLE', 'Não foi possível conectar. Confira a conexão e tente novamente.');
  }
  if (response.ok && context?.responseBlob) return await response.blob() as T;
  const value = response.status === 204 ? undefined : await response.json() as { code?: string; message?: string; fieldErrors?: Record<string, string[]> };
  if (!response.ok) throw new ClientError(response.status, value?.code ?? 'REQUEST_FAILED', messages[value?.code ?? ''] ?? value?.message ?? 'Não foi possível concluir.', value?.fieldErrors ?? {});
  return value as T;
}
