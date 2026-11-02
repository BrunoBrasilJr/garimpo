import { useEffect, useRef, useState } from 'react';
import type { AccountView, CatalogOffer, CartView, CartChange } from '@garimpo/contracts';
import { guestTag } from '@garimpo/contracts';
import { ClientError } from '../account/client';
import { guestCart } from './storage';
import { cartChanged, cartError, cartRequest, quantity } from './client';
export function AddToCart({ editionId, offer, user, ready = true }: { editionId: string; offer: CatalogOffer | undefined; user: AccountView | null; ready?: boolean }) {
  const [amount, setAmount] = useState('1'), [busy, setBusy] = useState(false), [error, setError] = useState(''), [notice, setNotice] = useState(''), [uncertain, setUncertain] = useState(false);
  const alive = useRef(true), controller = useRef<AbortController | null>(null), pending = useRef<{ key: string; body: { version: number; offerId: string; quantity: number } } | null>(null);
  useEffect(() => { alive.current = true; return () => { alive.current = false; controller.current?.abort(); }; }, []);
  if (user && user.context !== 'CUSTOMER') return <p>Para comprar, entre com uma conta de cliente.</p>;
  if (!offer) return <p>Selecione uma oferta para adicionar ao carrinho.</p>;
  const selected = offer;
  async function add() {
    setBusy(true); setError(''); setNotice(''); const signal = new AbortController(); controller.current = signal;
    try {
      const count = selected.kind === 'USED' ? 1 : quantity(amount);
      if (!user) await guestCart.add(selected.id, editionId, count, selected.kind === 'USED');
      else {
        if (!pending.current) { const cart = await cartRequest<CartView>(user.id, '/me/cart', 'GET', undefined, signal.signal); pending.current = { key: 'add.' + guestTag(), body: { version: cart.version, offerId: selected.id, quantity: count } }; }
        await cartRequest<CartChange>(user.id, '/me/cart/items', 'POST', pending.current.body, signal.signal, pending.current.key);
      }
      if (alive.current) { pending.current = null; setUncertain(false); setNotice('Adicionado ao carrinho. Adicionar não reserva estoque.'); cartChanged(); }
    } catch (cause) {
      if (!alive.current) return;
      if (cause instanceof ClientError && (cause.code === 'CART_VERSION_CONFLICT' || cause.status === 422)) pending.current = null;
      setUncertain(Boolean(pending.current)); setError(cartError(cause));
    } finally { if (alive.current) setBusy(false); }
  }
  return <section aria-label="Adicionar oferta ao carrinho"><p>O carrinho não reserva estoque nem garante o preço. A reserva só começa após a confirmação dos valores.</p>
    {selected.kind === 'NEW' ? <label>Quantidade para adicionar<input aria-label="Quantidade para adicionar" type="number" min="1" max="1000" step="1" value={amount} disabled={busy || uncertain} onChange={event => setAmount(event.target.value)} /></label> : <p>Este exemplar usado tem uma unidade.</p>}
    <button type="button" disabled={!ready || busy || !selected.available} onClick={() => { void add(); }}>{busy ? 'Adicionando…' : uncertain ? 'Confirmar adição pendente' : 'Adicionar ao carrinho'}</button>
    {error ? <p role="alert">{error}{uncertain ? ' A resposta anterior pode ter sido perdida; repetir esta confirmação não duplica a adição.' : ''}</p> : null}{notice ? <p role="status">{notice}</p> : null}<a href="#/cart">Ver carrinho</a>
  </section>;
}
