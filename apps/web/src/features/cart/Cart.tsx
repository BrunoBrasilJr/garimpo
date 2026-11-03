import { useCallback, useEffect, useRef, useState } from 'react';
import type { AccountView, CartLine, CartView, CartChange, CheckoutView } from '@garimpo/contracts';
import { guestTag } from '@garimpo/contracts';
import { ClientError } from '../account/client';
import { price } from '../catalog/api';
import { cartError, cartRequest, quantity } from './client';
import { VisitorCart } from './Visitor';
import './cart.css';
export default function Cart({ user }: { user: AccountView | null }) {
  return user?.context === 'STAFF' ? <section className="account-card"><h2>Conta de compra necessária</h2><p>Para comprar, use uma conta de cliente.</p></section> : user ? <AccountCart key={user.id} user={user} /> : <VisitorCart />;
}
function AccountCart({ user }: { user: AccountView }) {
  const [data, setData] = useState<CartView>(), [checkout, setCheckout] = useState<CheckoutView | null>(null), [error, setError] = useState(''), [notice, setNotice] = useState(''), [busy, setBusy] = useState(false), [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState(''), [coupon, setCoupon] = useState(''), [confirmed, setConfirmed] = useState('');
  const alive = useRef(true), generation = useRef(0), controller = useRef<AbortController | null>(null), reserveIntent = useRef<{ key: string; body: { version: number; pricingRevision: string; couponCode?: string } } | null>(null);
  const load = useCallback(async (selectedCoupon: string) => {
    const version = ++generation.current; controller.current?.abort(); const operation = new AbortController(); controller.current = operation; setLoading(true);
    try {
      const [cart, active] = await Promise.all([
        cartRequest<CartView>(user.id, '/me/cart' + (selectedCoupon ? '?couponCode=' + encodeURIComponent(selectedCoupon) : ''), 'GET', undefined, operation.signal),
        cartRequest<CheckoutView>(user.id, '/me/checkout', 'GET', undefined, operation.signal).catch(cause => { if (cause instanceof ClientError && cause.status === 404) return null; throw cause; })
      ]);
      if (alive.current && version === generation.current) { setData(cart); setCheckout(active); }
    } catch (cause) { if (alive.current && version === generation.current && !operation.signal.aborted) { setData(undefined); setCheckout(null); setError(cartError(cause)); } }
    finally { if (alive.current && version === generation.current) setLoading(false); }
  }, [user.id]);
  useEffect(() => {
    alive.current = true; void load(coupon); const changed = () => { void load(coupon); };
    window.addEventListener('garimpo-account-cart', changed); const visible = () => { if (document.visibilityState === 'visible') changed(); }; document.addEventListener('visibilitychange', visible);
    return () => { alive.current = false; generation.current++; controller.current?.abort(); window.removeEventListener('garimpo-account-cart', changed); document.removeEventListener('visibilitychange', visible); };
  }, [load, coupon]);
  async function mutation(work: (signal: AbortSignal) => Promise<unknown>, success: string, selectedCoupon = coupon) {
    setBusy(true); setError(''); setNotice(''); generation.current++; controller.current?.abort(); const operation = new AbortController(); controller.current = operation;
    try { await work(operation.signal); if (alive.current) { setNotice(success); reserveIntent.current = null; setConfirmed(''); await load(selectedCoupon); return true; } return false; }
    catch (cause) { if (alive.current && !operation.signal.aborted) { setError(cartError(cause)); if (cause instanceof ClientError && cause.code === 'CART_VERSION_CONFLICT') await load(selectedCoupon); else if (cause instanceof ClientError && (cause.status === 401 || cause.status === 403)) { setData(undefined); setCheckout(null); setConfirmed(''); } } return false; }
    finally { if (alive.current) setBusy(false); }
  }
  async function applyCoupon() {
    const value = draft.trim().toUpperCase();
    const changed = await mutation(async signal => {
      const active = await cartRequest<CheckoutView>(user.id, '/me/checkout', 'GET', undefined, signal).catch(cause => { if (cause instanceof ClientError && cause.status === 404) return null; throw cause; });
      if (active && active.couponCode !== (value || null)) await cartRequest(user.id, '/checkouts/' + active.id, 'DELETE', undefined, signal);
    }, 'Confira abaixo a validade e os valores do cupom informado.', value);
    if (alive.current && changed) { setCoupon(value); setConfirmed(''); }
  }
  async function reserve() {
    if (!data || data.pricing.status !== 'READY' || confirmed !== data.pricing.revision) return;
    setBusy(true); setError(''); setNotice(''); const operation = new AbortController(); controller.current?.abort(); controller.current = operation; generation.current++;
    if (!reserveIntent.current) reserveIntent.current = { key: 'checkout.' + guestTag(), body: { version: data.version, pricingRevision: data.pricing.revision, ...(coupon ? { couponCode: coupon } : {}) } };
    try {
      const value = await cartRequest<CheckoutView>(user.id, '/checkouts', 'POST', reserveIntent.current.body, operation.signal, reserveIntent.current.key);
      if (alive.current) { reserveIntent.current = null; setConfirmed(''); setCheckout(value.status === 'ACTIVE' ? value : null); setNotice(value.status === 'ACTIVE' ? 'Finalização recuperada do servidor. O prazo abaixo é o original.' : 'Esta tentativa já foi encerrada. Confira o carrinho antes de iniciar outra.'); }
    } catch (cause) {
      if (!alive.current || operation.signal.aborted) return;
      setError(cartError(cause));
      if (cause instanceof ClientError && ['CART_VERSION_CONFLICT', 'PRICE_CONFIRMATION_REQUIRED', 'INSUFFICIENT_STOCK', 'COUPON_LIMIT_REACHED', 'PENDING_ORDER_LIMIT'].includes(cause.code)) { reserveIntent.current = null; setConfirmed(''); await load(coupon); }
      else if (cause instanceof ClientError && (cause.status === 401 || cause.status === 403)) { setData(undefined); setCheckout(null); setConfirmed(''); }
    } finally { if (alive.current) setBusy(false); }
  }
  return <section className="account-card cart-view"><h2>Seu carrinho</h2><p>Adicionar não reserva estoque. A finalização só reserva o conjunto após conferir e confirmar os valores no servidor.</p>
    {error ? <p role="alert">{error}</p> : null}{notice ? <p role="status">{notice}</p> : null}{loading ? <p role="status">Conferindo carrinho e finalização…</p> : null}
    <button type="button" className="secondary" disabled={busy} onClick={() => { setError(''); void load(coupon); }}>Atualizar carrinho e finalização</button>
    {checkout ? <section className="cart-checkout" aria-label="Finalização em andamento" data-checkout-id={checkout.id}><h3>Finalização em andamento</h3><CheckoutTimer expiresAt={checkout.expiresAt} serverTime={checkout.serverTime} />
      <p>Validade original: <time dateTime={checkout.expiresAt}>{new Date(checkout.expiresAt).toLocaleString('pt-BR')}</time>. Mudar itens, quantidades ou cupom encerra esta reserva.</p>
      {checkout.products.map(product => <p key={product.offerId}>{product.title} · {product.quantity} {product.quantity === 1 ? 'unidade' : 'unidades'} · {price(checkout.quote.units.filter(unit => product.unitIds.includes(unit.id)).reduce((sum, unit) => sum + unit.netPriceCents, 0))}</p>)}
      <p>Total dos produtos reservado: {price(checkout.quote.totalCents)}. {checkout.freight ? `Frete aceito: ${price(checkout.freight.freight.amountCents)}.` : 'Frete ainda não foi cotado.'}</p><a href="#/checkout">Escolher endereço e pagamento</a><button type="button" disabled={busy} onClick={() => { void mutation(signal => cartRequest(user.id, '/checkouts/' + checkout.id, 'DELETE', undefined, signal), 'Finalização encerrada no servidor.'); }}>Encerrar finalização</button>
    </section> : null}
    {data ? <><h3>Itens e preços atuais</h3>{!data.items.length ? <p>Seu carrinho está vazio.</p> : data.items.map(line => <AccountLine key={line.id + ':' + data.version} line={line} busy={busy || loading} change={async count => { await mutation(signal => cartRequest<CartChange>(user.id, '/me/cart/items/' + line.id, 'PATCH', { version: data.version, quantity: count }, signal), 'Quantidade atualizada. Confira novamente os valores.'); }} remove={async () => { await mutation(signal => cartRequest(user.id, '/me/cart/items/' + line.id + '?version=' + data.version, 'DELETE', undefined, signal), 'Item removido.'); }} />)}
      {data.items.length ? <><button type="button" className="secondary" disabled={busy || loading} onClick={() => { void mutation(signal => cartRequest(user.id, '/me/cart/items', 'DELETE', undefined, signal), 'Carrinho esvaziado no servidor.'); }}>Esvaziar carrinho da conta</button>
        <form onSubmit={event => { event.preventDefault(); void applyCoupon(); }}><label>Código do cupom<input aria-label="Código do cupom" maxLength={40} value={draft} disabled={busy} onChange={event => setDraft(event.target.value)} /></label><button disabled={busy || loading}>Conferir cupom</button></form>
        {data.pricing.status === 'READY' ? <><p>Subtotal após promoções: {price(data.pricing.quote.promotionalSubtotalCents)} · desconto do cupom: {price(data.pricing.quote.couponDiscountCents)} · total dos produtos: {price(data.pricing.quote.totalCents)}. Frete será cotado depois.</p>
          {!checkout ? <><label className="cart-confirm"><input type="checkbox" checked={confirmed === data.pricing.revision} disabled={busy || loading} onChange={event => setConfirmed(event.target.checked && data.pricing.status === 'READY' ? data.pricing.revision : '')} />Conferi os itens e os valores atuais</label><button type="button" disabled={busy || loading || confirmed !== data.pricing.revision} onClick={() => { void reserve(); }}>{busy ? 'Conferindo…' : reserveIntent.current ? 'Confirmar tentativa pendente' : 'Reservar conjunto por 15 minutos'}</button></> : null}
        </> : <p role="status">{data.pricing.message}</p>}
      </> : null}</> : null}<a href="#/catalog">Continuar explorando discos</a>
  </section>;
}
function AccountLine({ line, busy, change, remove }: { line: CartLine; busy: boolean; change: (count: number) => Promise<void>; remove: () => Promise<void> }) {
  const [amount, setAmount] = useState(String(line.quantity)), [error, setError] = useState('');
  return <article aria-label={line.title}><h4>{line.title}</h4><p>{line.kind === 'USED' ? `Usado · disco ${line.discGrade} · capa ${line.sleeveGrade}` : 'Novo'}</p><p>{price(line.currentPriceCents)} por unidade · quantidade no carrinho: {line.quantity} · saldo atual para conferir: {line.availableQuantity}</p>
    {line.lastSeenPriceCents !== line.currentPriceCents ? <p>O preço mudou desde a adição. Confira antes de reservar.</p> : null}{!line.active || line.quantity > line.availableQuantity ? <p>Esta quantidade não está disponível agora. Ajuste ou remova este item.</p> : null}
    {line.kind === 'NEW' ? <form onSubmit={event => { event.preventDefault(); try { const count = quantity(amount); setError(''); void change(count); } catch (cause) { setError(cartError(cause)); } }}><label>Quantidade de {line.title}<input aria-label={'Quantidade de ' + line.title} type="number" min="1" max="1000" step="1" value={amount} disabled={busy} onChange={event => setAmount(event.target.value)} /></label><button disabled={busy}>Atualizar quantidade</button></form> : null}
    {error ? <p role="alert">{error}</p> : null}<button type="button" className="secondary" disabled={busy} onClick={() => { void remove(); }}>Remover {line.title}</button>
  </article>;
}
export function CheckoutTimer({ expiresAt, serverTime }: { expiresAt: string; serverTime: string }) {
  const [reading, setReading] = useState(() => ({ now: Date.now(), offset: Date.parse(serverTime) - Date.now() }));
  useEffect(() => { const offset = Date.parse(serverTime) - Date.now(); setReading({ now: Date.now(), offset }); const interval = setInterval(() => setReading({ now: Date.now(), offset }), 1000); return () => clearInterval(interval); }, [expiresAt, serverTime]);
  const seconds = Math.max(0, Math.ceil((Date.parse(expiresAt) - reading.now - reading.offset) / 1000));
  return <p role="timer" aria-live="off" aria-label="Tempo restante da finalização">{seconds ? `Tempo restante: ${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}` : 'Prazo encerrado. Atualize para conferir o estado no servidor.'}</p>;
}
