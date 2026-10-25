import type { AccountView } from '@garimpo/contracts';
export interface TokenStore { get(): Promise<string | null>; set(value: string): Promise<void>; clear(): Promise<void> }
export class MobileError extends Error { constructor(readonly status: number, readonly fields: Record<string, string[]>, message: string) { super(message); } }
export const errorMessage = (cause: unknown) => cause instanceof MobileError ? cause.message : 'Não foi possível concluir. Confira sua conexão e tente novamente.';
interface Session { accessToken: string; refreshToken: string; user: AccountView }
export class MobileAccountClient {
  private access = '';
  private renewing: Promise<AccountView> | undefined;
  private ending = false;
  private readonly base: string;
  constructor(origin: string, private readonly store: TokenStore, private readonly transport: typeof fetch = fetch) {
    const url = new URL(origin);
    if (url.protocol !== 'https:' || url.origin !== origin) throw new Error('An exact HTTPS API origin is required.');
    this.base = origin + '/api/v1';
  }
  private async send<T>(path: string, method: string, body: unknown, access = ''): Promise<T> {
    let response: Response;
    try {
      response = await this.transport(this.base + path, { method, credentials: 'omit', headers: { 'X-Garimpo-Client': 'mobile',
        ...(access ? { Authorization: `Bearer ${access}` } : {}), ...(body === undefined ? {} : { 'Content-Type': 'application/json' }) },
        ...(body === undefined ? {} : { body: JSON.stringify(body) }) });
    } catch { throw new MobileError(0, {}, 'Não foi possível conectar. Confira sua conexão e tente novamente.'); }
    const value = response.status === 204 ? undefined : await response.json() as { message?: string; fieldErrors?: Record<string, string[]>; code?: string };
    if (!response.ok) throw new MobileError(response.status, value?.fieldErrors ?? {}, value?.code === 'INVALID_ACCESS_LINK' ? 'Este código é inválido, expirou ou já foi usado. Solicite outro link.' : value?.message ?? 'Não foi possível concluir.');
    return value as T;
  }
  private async keep(session: Session) {
    if (session.user.context !== 'CUSTOMER' || session.user.role !== 'USER') { this.access = ''; await this.store.clear(); throw new MobileError(403, {}, 'Contas internas são acessadas somente pela web.'); }
    try { await this.store.set(session.refreshToken); } catch {
      this.access = ''; await this.store.clear().catch(() => {}); throw new MobileError(0, {}, 'Não foi possível guardar o acesso com segurança. Entre novamente.');
    }
    this.access = session.accessToken; return session.user;
  }
  async login(email: string, password: string) {
    if (this.ending) throw new MobileError(401, {}, 'Aguarde a saída da conta para entrar novamente.');
    return this.keep(await this.send<Session>('/auth/login', 'POST', { email, password }));
  }
  async restore(): Promise<AccountView | null> {
    if (!await this.store.get()) return null;
    return this.renew();
  }
  private async renew(): Promise<AccountView> {
    if (this.ending) throw new MobileError(401, {}, 'Entre para continuar.');
    if (!this.renewing) this.renewing = (async () => {
      const refreshToken = await this.store.get();
      if (!refreshToken) throw new MobileError(401, {}, 'Entre para continuar.');
      try { return await this.keep(await this.send<Session>('/auth/refresh', 'POST', { refreshToken })); }
      catch (cause) {
        this.access = '';
        if (cause instanceof MobileError && (cause.status === 401 || cause.status === 403)) await this.store.clear();
        throw cause;
      }
    })().finally(() => { this.renewing = undefined; });
    return this.renewing;
  }
  async request<T = Record<string, unknown>>(path: string, method = 'GET', body?: unknown, authenticated = true): Promise<T> {
    if (authenticated && this.ending) throw new MobileError(401, {}, 'Entre para continuar.');
    const sentAccess = this.access;
    try { return await this.send<T>(path, method, body, authenticated ? sentAccess : ''); }
    catch (cause) {
      if (!(cause instanceof MobileError) || cause.status !== 401 || !authenticated) throw cause;
      if (!this.access || this.access === sentAccess) await this.renew();
      return this.send<T>(path, method, body, this.access);
    }
  }
  async logout() {
    this.ending = true;
    try {
      await this.renewing?.catch(() => {});
      const refreshToken = await this.store.get(); this.access = '';
      if (refreshToken) await this.send('/auth/logout', 'POST', { refreshToken });
    } finally { this.access = ''; try { await this.store.clear(); } finally { this.ending = false; } }
  }
}
