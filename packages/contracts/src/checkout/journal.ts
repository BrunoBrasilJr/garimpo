import type { PaymentScenario } from '../payments/index.js';
export type OrderIntent = { kind: 'ORDER'; key: string; targetId: string; body: { checkoutId: string; version: number; addressId: string; freightRevision: string; method: 'PIX' | 'BOLETO' } };
export type PurchaseIntent = OrderIntent
  | { kind: 'CARD'; key: string; targetId: string; body: { version: number; addressId: string; freightRevision: string; scenario: PaymentScenario } }
  | { kind: 'CHARGE'; key: string; targetId: string; body: { chargeId: string; scenario: PaymentScenario } };
export interface PurchaseJournalState { version: 1; owner: string; pending: PurchaseIntent | null; orders: OrderIntent[] }
export interface PurchaseStorage { get(key: string): Promise<string | null>; set(key: string, value: string): Promise<void> }
export class PurchaseJournalError extends Error {}
const writes = new Map<string, Promise<void>>();
const uuid = (v: unknown): v is string => typeof v === 'string' && /^[a-f0-9]{8}-(?:[a-f0-9]{4}-){3}[a-f0-9]{12}$/i.test(v);
const record = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);
function exact(v: Record<string, unknown>, keys: string[]) { return Object.keys(v).length === keys.length && keys.every(k => Object.hasOwn(v, k)); }
function intent(v: unknown): v is PurchaseIntent {
  if (!record(v) || !exact(v, ['kind', 'key', 'targetId', 'body']) || typeof v.key !== 'string' || !/^[A-Za-z0-9._:-]{1,128}$/.test(v.key) || !uuid(v.targetId) || !record(v.body)) return false;
  const b = v.body, scenario = ['APPROVED', 'DECLINED', 'PENDING', 'APPROVED_REFUND_FAIL'].includes(String(b.scenario));
  if (v.kind === 'CHARGE') return exact(b, ['chargeId', 'scenario']) && uuid(b.chargeId) && scenario;
  const common = Number.isSafeInteger(b.version) && Number(b.version) >= 1 && Number(b.version) <= 2147483647 && uuid(b.addressId) && typeof b.freightRevision === 'string' && /^[a-f0-9]{64}$/.test(b.freightRevision);
  return common && (v.kind === 'ORDER' ? exact(b, ['checkoutId', 'version', 'addressId', 'freightRevision', 'method']) && b.checkoutId === v.targetId && ['PIX', 'BOLETO'].includes(String(b.method)) : v.kind === 'CARD' && exact(b, ['version', 'addressId', 'freightRevision', 'scenario']) && scenario);
}
export function decodePurchaseJournal(raw: string | null, owner: string): PurchaseJournalState {
  if (!uuid(owner)) throw new PurchaseJournalError('A conta desta tentativa não pôde ser identificada. Entre novamente.');
  if (raw === null) return { version: 1, owner, pending: null, orders: [] };
  let v: unknown; try { if (raw.length > 20000) throw new Error(); v = JSON.parse(raw); } catch { throw new PurchaseJournalError('Não foi possível recuperar as referências de pagamento deste aparelho. Atualize seu acesso antes de tentar novamente.'); }
  if (!record(v) || !exact(v, ['version', 'owner', 'pending', 'orders']) || v.version !== 1 || v.owner !== owner || v.pending !== null && !intent(v.pending) || !Array.isArray(v.orders) || v.orders.length > 12 || !v.orders.every(x => intent(x) && x.kind === 'ORDER') || new Set(v.orders.map(x => x.key)).size !== v.orders.length) throw new PurchaseJournalError('As referências de pagamento deste aparelho não correspondem à conta ou ao formato esperado. Entre novamente e confira seus pagamentos.');
  return v as unknown as PurchaseJournalState;
}
/** References only, keyed by owner. No session credential, address text, real card or authoritative price is stored. */
export class PurchaseJournal {
  readonly storage: PurchaseStorage; readonly owner: string; readonly key: string;
  constructor(storage: PurchaseStorage, owner: string) { this.storage = storage; this.owner = owner; this.key = 'garimpo.purchase.v1.' + owner; }
  async read() { try { return decodePurchaseJournal(await this.storage.get(this.key), this.owner); } catch (e) { if (e instanceof PurchaseJournalError) throw e; throw new PurchaseJournalError('Não foi possível ler a tentativa salva. Confira o armazenamento deste aparelho antes de continuar.'); } }
  async save(value: PurchaseJournalState) { const raw = JSON.stringify(value); decodePurchaseJournal(raw, this.owner); try { await this.storage.set(this.key, raw); } catch { throw new PurchaseJournalError('Não foi possível atualizar a tentativa salva. Atualize os pagamentos e retome a mesma tentativa antes de iniciar outra.'); } }
  async update(work: (current: PurchaseJournalState) => PurchaseJournalState) {
    const previous = writes.get(this.key) ?? Promise.resolve(); let release!: () => void;
    const finished = new Promise<void>(resolve => { release = resolve; }), tail = previous.then(() => finished); writes.set(this.key, tail);
    await previous;
    try { const next = work(await this.read()); await this.save(next); return next; }
    finally { release(); if (writes.get(this.key) === tail) writes.delete(this.key); }
  }
}
