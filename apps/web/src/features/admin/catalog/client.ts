import { ClientError, request as accountRequest } from '../../account/client';

const csrf = () => {
  const value = document.cookie.split('; ').find(item => item.startsWith('__Host-garimpo-csrf='));
  return value ? decodeURIComponent(value.slice('__Host-garimpo-csrf='.length)) : '';
};
export async function catalogRequest<T = unknown>(path: string, method = 'GET', body?: unknown, key?: string, signal?: AbortSignal): Promise<T> {
  if (location.protocol !== 'https:') throw new ClientError(0, 'HTTPS_REQUIRED', 'Abra a conexão segura para administrar a loja.');
  if (!/^\/admin\/(editions|offers|images|catalog-metadata|stock)(\/|\?|$)/.test(path)) throw new ClientError(422, 'INVALID_PATH', 'Operação indisponível.');
  const binary = body instanceof File;
  const execute = () => fetch('/api/v1' + path, { method, credentials: 'include', cache: 'no-store', ...(signal ? { signal } : {}),
    headers: { ...(body === undefined ? {} : { 'Content-Type': binary ? (body as File).type : 'application/json' }),
      ...(method === 'GET' ? {} : { 'X-CSRF-Token': csrf() }), ...(key ? { 'Idempotency-Key': key } : {}) },
    ...(body === undefined ? {} : { body: binary ? body as File : JSON.stringify(body) }) });
  let response: Response;
  try {
    response = await execute();
    if (response.status === 401 && csrf()) {
      // Reuse existing locked/session-bound renewal; this module never handles access credentials.
      await accountRequest('/me'); response = await execute();
    }
  } catch (error) {
    if (error instanceof ClientError || error instanceof DOMException && error.name === 'AbortError') throw error;
    throw new ClientError(0, 'NETWORK_UNAVAILABLE', 'Não foi possível conectar. Confira a conexão e atualize a lista antes de repetir.');
  }
  const value = response.status === 204 ? undefined : await response.json() as { code?: string; message?: string; fieldErrors?: Record<string, string[]> };
  if (!response.ok) throw new ClientError(response.status, value?.code ?? 'REQUEST_FAILED', value?.message ?? 'Não foi possível concluir.', value?.fieldErrors ?? {});
  return value as T;
}
export function commandKey(ref: { current: { signature: string; key: string } | null }, value: unknown) {
  const signature = JSON.stringify(value);
  if (ref.current?.signature !== signature) ref.current = { signature, key: crypto.randomUUID() };
  return ref.current.key;
}
export function money(value: number) { return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value / 100); }
export function cents(value: string) {
  if (!/^\d+(?:[,.]\d{1,2})?$/.test(value.trim())) throw new ClientError(422, 'INVALID_PRICE', 'Informe um preço como 129,90, sem separador de milhar.');
  const [whole = '', part = ''] = value.trim().replace(',', '.').split('.');
  return Number(whole) * 100 + Number(part.padEnd(2, '0'));
}
