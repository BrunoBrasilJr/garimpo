/** Local visitor data only. These tags are non-secret uniqueness markers, never credentials or stock holds. */
let sequence = 0;
export const guestTag = () => Date.now().toString(36) + '.' + (++sequence).toString(36) + '.' + Math.random().toString(36).slice(2) + '.' + Math.random().toString(36).slice(2);
export interface GuestLine { entryId: string; offerId: string; editionId: string; units: number[]; nextUnit: number }
export interface GuestMergeIntent { key: string; cartId: string; version: number; batchRevision: string; lines: GuestLine[] }
export interface GuestCartState { schema: 1; revision: string; items: GuestLine[]; pending: GuestMergeIntent[] }
export interface GuestStorage { get(): Promise<string | null>; set(value: string): Promise<void> }
export type GuestExclusive = <T>(work: () => Promise<T>) => Promise<T>;
export class GuestDataError extends Error { constructor(message = 'Não foi possível ler ou salvar o carrinho deste aparelho. Confira os dados locais antes de continuar.') { super(message); } }
const uuid = /^[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/i, tag = /^[a-z0-9.:-]{1,128}$/i, maximumBytes = 256 * 1024;
const object = (value: unknown): value is Record<string, unknown> => Boolean(value) && typeof value === 'object' && !Array.isArray(value);
const keys = (value: Record<string, unknown>, allowed: string[]) => Object.keys(value).every(key => allowed.includes(key));
const positive = (value: unknown): value is number => Number.isSafeInteger(value) && Number(value) > 0;
function lines(value: unknown): value is GuestLine[] {
  if (!Array.isArray(value) || value.length > 100) return false;
  let total = 0; const offers = new Set<string>(), entries = new Set<string>();
  for (const line of value) {
    if (!object(line) || !keys(line, ['entryId', 'offerId', 'editionId', 'units', 'nextUnit']) || typeof line.entryId !== 'string' || !tag.test(line.entryId) || typeof line.offerId !== 'string' || !uuid.test(line.offerId) || typeof line.editionId !== 'string' || !uuid.test(line.editionId) || !positive(line.nextUnit) || !Array.isArray(line.units) || !line.units.length || line.units.length > 1000) return false;
    const nextUnit = line.nextUnit;
    if (offers.has(line.offerId.toLowerCase()) || entries.has(line.entryId) || new Set(line.units).size !== line.units.length || line.units.some(unit => !Number.isSafeInteger(unit) || unit < 0 || unit >= nextUnit)) return false;
    offers.add(line.offerId.toLowerCase()); entries.add(line.entryId); total += line.units.length;
  } return total <= 1000;
}
function valid(value: unknown): value is GuestCartState {
  if (!object(value) || !keys(value, ['schema', 'revision', 'items', 'pending']) || value.schema !== 1 || typeof value.revision !== 'string' || !tag.test(value.revision) || !lines(value.items) || !Array.isArray(value.pending) || value.pending.length > 20) return false;
  const carts = new Set<string>(), ids = new Set<string>();
  for (const intent of value.pending) {
    if (!object(intent) || !keys(intent, ['key', 'cartId', 'version', 'batchRevision', 'lines']) || typeof intent.key !== 'string' || !tag.test(intent.key) || typeof intent.cartId !== 'string' || !uuid.test(intent.cartId) || !positive(intent.version) || intent.version > 2147483647 || typeof intent.batchRevision !== 'string' || !tag.test(intent.batchRevision) || !lines(intent.lines) || !intent.lines.length || carts.has(intent.cartId) || ids.has(intent.key)) return false;
    carts.add(intent.cartId); ids.add(intent.key);
  } return true;
}
export function decodeGuest(raw: string | null, id = guestTag): GuestCartState {
  if (raw === null) return { schema: 1, revision: id(), items: [], pending: [] };
  try { if (raw.length > maximumBytes) throw new GuestDataError(); const value: unknown = JSON.parse(raw); if (!valid(value)) throw new GuestDataError(); return value; } catch { throw new GuestDataError(); }
}
const copy = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T;
export class GuestCartStore {
  private readonly storage: GuestStorage;
  private readonly exclusive: GuestExclusive | undefined;
  private readonly id: () => string;
  private queue: Promise<unknown> = Promise.resolve();
  constructor(storage: GuestStorage, exclusive?: GuestExclusive, id = guestTag) { this.storage = storage; this.exclusive = exclusive; this.id = id; }
  async read(): Promise<GuestCartState> { await this.queue; try { return decodeGuest(await this.storage.get(), this.id); } catch { throw new GuestDataError(); } }
  private update<T>(work: (state: GuestCartState) => T): Promise<T> {
    const run = async () => {
      let state: GuestCartState;
      try { state = decodeGuest(await this.storage.get(), this.id); } catch { throw new GuestDataError(); }
      const result = work(state), encoded = JSON.stringify(state);
      if (!valid(state) || encoded.length > maximumBytes) throw new GuestDataError('Use até 100 ofertas e 1000 unidades. Conclua as mesclas pendentes antes de adicionar mais dados locais.');
      try { await this.storage.set(encoded); } catch { throw new GuestDataError(); } return copy(result);
    };
    const task = () => this.exclusive ? this.exclusive(run) : run(), result = this.queue.then(task, task);
    this.queue = result.then(() => undefined, () => undefined); return result;
  }
  add(offerId: string, editionId: string, quantity: number, used = false) {
    return this.update(state => {
      if (!uuid.test(offerId) || !uuid.test(editionId) || !positive(quantity) || quantity > 1000 || used && quantity !== 1) throw new GuestDataError('Confira a oferta e a quantidade. Cada usado tem uma unidade.');
      offerId = offerId.toLowerCase(); editionId = editionId.toLowerCase();
      const previous = state.items.find(line => line.offerId === offerId);
      if (previous && used) return state;
      if (previous) { previous.units.push(...Array.from({ length: quantity }, (_unused, index) => previous.nextUnit + index)); previous.nextUnit += quantity; }
      else state.items.push({ entryId: this.id(), offerId, editionId, units: Array.from({ length: quantity }, (_unused, index) => index), nextUnit: quantity });
      state.revision = this.id(); return state;
    });
  }
  quantity(entryId: string, quantity: number) {
    return this.update(state => {
      if (!positive(quantity) || quantity > 1000) throw new GuestDataError('Informe uma quantidade inteira de 1 a 1000.');
      const line = state.items.find(line => line.entryId === entryId); if (!line) throw new GuestDataError('O carrinho local mudou. Atualize os itens.');
      const extra = quantity - line.units.length;
      if (extra > 0) { line.units.push(...Array.from({ length: extra }, (_unused, index) => line.nextUnit + index)); line.nextUnit += extra; } else line.units = line.units.slice(0, quantity);
      state.revision = this.id(); return state;
    });
  }
  remove(entryId: string) { return this.update(state => { state.items = state.items.filter(line => line.entryId !== entryId); state.revision = this.id(); return state; }); }
  beginMerge(cartId: string, version: number) {
    return this.update(state => {
      const pending = state.pending.find(intent => intent.cartId === cartId); if (pending) return pending;
      if (!uuid.test(cartId) || !positive(version) || !state.items.length) throw new GuestDataError('Atualize o carrinho antes de mesclar.');
      // Units whose earlier account-bound outcome is unknown must not be sent to a different account.
      const held = new Set(state.pending.flatMap(intent => intent.lines.flatMap(line => line.units.map(unit => line.entryId + ':' + unit))));
      const available = state.items.map(line => ({ ...copy(line), units: line.units.filter(unit => !held.has(line.entryId + ':' + unit)) })).filter(line => line.units.length > 0);
      if (!available.length) throw new GuestDataError('Há uma mescla pendente de outro acesso. Confira a conta anterior antes de mesclar esses itens novamente.');
      const intent: GuestMergeIntent = { key: 'guest.' + this.id(), cartId, version, batchRevision: state.revision, lines: available };
      state.pending.push(intent); return intent;
    });
  }
  acknowledge(key: string) {
    return this.update(state => {
      const intent = state.pending.find(intent => intent.key === key); if (!intent) return state;
      for (const delivered of intent.lines) {
        const line = state.items.find(line => line.entryId === delivered.entryId); if (!line) continue;
        const units = new Set(delivered.units); line.units = line.units.filter(unit => !units.has(unit));
      }
      state.items = state.items.filter(line => line.units.length > 0); state.pending = state.pending.filter(intent => intent.key !== key); state.revision = this.id(); return state;
    });
  }
  discard(key: string) { return this.update(state => { state.pending = state.pending.filter(intent => intent.key !== key); return state; }); }
  reset() {
    const run = async () => { const state: GuestCartState = { schema: 1, revision: this.id(), items: [], pending: [] }; try { await this.storage.set(JSON.stringify(state)); } catch { throw new GuestDataError(); } return state; };
    const task = () => this.exclusive ? this.exclusive(run) : run(), result = this.queue.then(task, task); this.queue = result.then(() => undefined, () => undefined); return result;
  }
}
