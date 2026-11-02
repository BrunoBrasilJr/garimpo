export class CatalogReadError extends Error { constructor(readonly status: number, message: string) { super(message); } }
export async function readCatalog<T>(path: string, signal: AbortSignal): Promise<T> {
  if (location.protocol !== 'https:') throw new CatalogReadError(403, 'Abra a conexão segura para consultar os discos.');
  let response: Response;
  try { response = await fetch('/api/v1' + path, { signal, credentials: 'omit', cache: 'no-store', headers: { Accept: 'application/json' } }); }
  catch (cause) { if (signal.aborted) throw cause; throw new CatalogReadError(0, 'Não foi possível conectar. Confira sua conexão e tente novamente.'); }
  if (!response.ok) throw new CatalogReadError(response.status, response.status === 404 ? 'Esta edição não está disponível.' : response.status === 422 ? 'Confira os filtros informados e tente novamente.' : 'Não foi possível consultar o catálogo agora. Tente novamente.');
  return response.json() as Promise<T>;
}
export const price = (cents: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100);
export const filterKeys = ['q', 'artist', 'genre', 'decade', 'minPrice', 'maxPrice', 'discCondition', 'sleeveCondition', 'available', 'page', 'pageSize'] as const;
export function catalogParams(query: string) {
  const incoming = new URLSearchParams(query), result = new URLSearchParams();
  for (const name of filterKeys) { const value = incoming.get(name); if (value) result.set(name, value); }
  return result;
}
export function filterPrice(value: string) {
  if (!/^\d+(?:[,.]\d{1,2})?$/.test(value)) throw new CatalogReadError(422, 'Use um preço como 129,90, sem separador de milhar.');
  const [whole = '', decimal = ''] = value.replace(',', '.').split('.'), amount = Number(whole) * 100 + Number(decimal.padEnd(2, '0'));
  if (!Number.isSafeInteger(amount) || amount > 2147483647) throw new CatalogReadError(422, 'Informe um preço válido.');
  return String(amount);
}
