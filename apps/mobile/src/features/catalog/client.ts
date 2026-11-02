import type { CatalogEdition, CatalogFilters, CatalogPage } from '@garimpo/contracts';

export class CatalogError extends Error { constructor(readonly status: number, message: string) { super(message); } }
export class MobileCatalogClient {
  readonly origin: string;
  constructor(origin: string, private readonly transport: typeof fetch = fetch) {
    const url = new URL(origin), match = /^https:\/\/(?:[a-z0-9.-]+|\[[a-f0-9:]+\])(?::([1-9]\d{0,4}))?$/i.exec(origin);
    if (!match || Number(match[1] ?? 443) > 65535 || url.origin !== origin) throw new Error('An exact HTTPS API origin is required.');
    this.origin = origin;
  }
  private async read<T>(path: string, signal: AbortSignal): Promise<T> {
    let response: Response;
    try { response = await this.transport(this.origin + '/api/v1' + path, { signal, credentials: 'omit', cache: 'no-store', headers: { Accept: 'application/json', 'X-Garimpo-Client': 'mobile' } }); }
    catch (cause) { if (signal.aborted) throw cause; throw new CatalogError(0, 'Não foi possível conectar. Confira sua conexão e tente novamente.'); }
    if (!response.ok) throw new CatalogError(response.status, response.status === 404 ? 'Esta edição não está disponível.' : response.status === 422 ? 'Confira os filtros informados.' : 'Não foi possível consultar os discos agora. Tente novamente.');
    try { return await response.json() as T; } catch { throw new CatalogError(502, 'Não foi possível ler os dados do catálogo. Tente novamente.'); }
  }
  filters(signal: AbortSignal) { return this.read<CatalogFilters>('/catalog/filters', signal); }
  list(params: URLSearchParams, signal: AbortSignal) {
    const query = new URLSearchParams();
    for (const name of ['q', 'artist', 'genre', 'decade', 'minPrice', 'maxPrice', 'discCondition', 'sleeveCondition', 'available', 'page', 'pageSize']) {
      const value = params.get(name); if (value) query.set(name, value);
    }
    return this.read<CatalogPage>('/editions?' + query, signal);
  }
  detail(id: string, signal: AbortSignal) {
    if (!id) return Promise.reject(new CatalogError(404, 'Esta edição não está disponível.'));
    return this.read<CatalogEdition>('/editions/' + encodeURIComponent(id), signal);
  }
  image(path: string): string | undefined {
    if (!/^\/api\/v1\/media\/products\/[a-f0-9-]{36}\.(jpg|png|webp)$/.test(path)) return undefined;
    return this.origin + path;
  }
}
export const message = (cause: unknown) => cause instanceof CatalogError ? cause.message : 'Não foi possível consultar os discos. Tente novamente.';
export const money = (cents: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100);
export function cents(value: string) {
  if (!/^\d+(?:[,.]\d{1,2})?$/.test(value.trim())) throw new CatalogError(422, 'Use um preço como 129,90, sem separador de milhar.');
  const [whole = '', part = ''] = value.trim().replace(',', '.').split('.'), result = Number(whole) * 100 + Number(part.padEnd(2, '0'));
  if (!Number.isSafeInteger(result) || result > 2147483647) throw new CatalogError(422, 'Informe um preço válido.');
  return String(result);
}
