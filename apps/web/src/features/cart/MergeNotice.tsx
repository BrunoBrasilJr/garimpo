import { useCallback, useEffect, useRef, useState } from 'react';
import type { AccountView, CartView, CartChange, GuestCartState, GuestMergeIntent } from '@garimpo/contracts';
import { ClientError } from '../account/client';
import { guestCart } from './storage';
import { cartChanged, cartError, cartRequest } from './client';
/** One owner-scoped coordinator at the app root. Navigation never duplicates the merge operation. */
export function MergeNotice({ user }: { user: AccountView }) {
  const [data, setData] = useState<GuestCartState>(), [busy, setBusy] = useState(false), [error, setError] = useState(''), [notice, setNotice] = useState('');
  const alive = useRef(true), running = useRef(false), controller = useRef<AbortController | null>(null);
  const merge = useCallback(async () => {
    if (running.current) return; running.current = true; setBusy(true); setError(''); let intent: GuestMergeIntent | undefined;
    const operation = new AbortController(); controller.current = operation;
    try {
      const local = await guestCart.read(); if (alive.current) setData(local); if (!local.items.length && !local.pending.length) return;
      const cart = await cartRequest<CartView>(user.id, '/me/cart', 'GET', undefined, operation.signal); intent = await guestCart.beginMerge(cart.id, cart.version);
      const result = await cartRequest<CartChange>(user.id, '/me/cart/merge', 'POST', { version: intent.version, items: intent.lines.map(line => ({ offerId: line.offerId, quantity: line.units.length })) }, operation.signal, intent.key);
      if (!alive.current) return;
      setData(await guestCart.acknowledge(intent.key)); setNotice('Carrinho deste aparelho mesclado à sua conta.' + (result.warnings.length ? ' ' + result.warnings.join(' ') : '')); cartChanged();
    } catch (cause) {
      let failure = cause;
      if (intent && cause instanceof ClientError && cause.code === 'CART_VERSION_CONFLICT') try { await guestCart.discard(intent.key); } catch (storageFailure) { failure = storageFailure; }
      if (alive.current) setError(cartError(failure));
    } finally { running.current = false; if (alive.current) setBusy(false); }
  }, [user.id]);
  useEffect(() => {
    alive.current = true; let active = true; queueMicrotask(() => { if (active) void merge(); });
    const changed = () => { void guestCart.read().then(value => { if (alive.current) setData(value); }).catch(cause => { if (alive.current) setError(cartError(cause)); }); };
    window.addEventListener('garimpo-guestcart', changed); window.addEventListener('storage', changed);
    return () => { active = false; alive.current = false; controller.current?.abort(); window.removeEventListener('garimpo-guestcart', changed); window.removeEventListener('storage', changed); };
  }, [merge]);
  if (!busy && !error && !notice && !data?.items.length && !data?.pending.length) return null;
  return <section className="account-notice" aria-label="Mescla do carrinho"><h2>Carrinho deste aparelho</h2>{busy ? <p role="status">Conferindo e mesclando os itens com sua conta…</p> : null}{notice ? <p role="status">{notice}</p> : null}{error ? <p role="alert">{error} Os dados locais aguardam conferência.</p> : null}
    {!busy && (error || data?.items.length || data?.pending.length) ? <button type="button" onClick={() => { void merge(); }}>Tentar mesclar carrinho</button> : null}<a href="#/cart">Abrir carrinho</a>
  </section>;
}
