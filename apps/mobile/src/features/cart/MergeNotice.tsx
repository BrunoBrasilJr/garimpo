import { useCallback, useEffect, useRef, useState } from 'react';
import { Text, View } from 'react-native';
import type { AccountView, CartView, CartChange, GuestCartState, GuestMergeIntent } from '@garimpo/contracts';
import { MobileAccountClient, MobileError } from '../account/client';
import { Button } from '../catalog/Controls';
import { styles as s } from '../catalog/styles';
import { guestCart, subscribeGuest, accountCartChanged } from './storage';
import { cartRequest, cartError } from './client';
export function MergeNotice({ user, client, open, settled }: { user: AccountView; client: MobileAccountClient; open: () => void; settled?: (accountId: string) => void }) {
  const [data, setData] = useState<GuestCartState>(), [busy, setBusy] = useState(false), [error, setError] = useState(''), [notice, setNotice] = useState('');
  const alive = useRef(true), running = useRef(false), controller = useRef<AbortController | null>(null);
  const merge = useCallback(async () => {
    if (running.current) return; running.current = true; setBusy(true); setError(''); let intent: GuestMergeIntent | undefined;
    const operation = new AbortController(); controller.current = operation;
    try {
      const local = await guestCart.read(); if (alive.current) setData(local); if (!local.items.length && !local.pending.length) return;
      const cart = await cartRequest<CartView>(client, user.id, '/me/cart', 'GET', undefined, operation.signal); intent = await guestCart.beginMerge(cart.id, cart.version);
      const result = await cartRequest<CartChange>(client, user.id, '/me/cart/merge', 'POST', { version: intent.version, items: intent.lines.map(line => ({ offerId: line.offerId, quantity: line.units.length })) }, operation.signal, intent.key);
      if (!alive.current) return;
      const localState = await guestCart.acknowledge(intent.key); if (!alive.current) return;
      setData(localState); setNotice('Carrinho deste aparelho mesclado à sua conta.' + (result.warnings.length ? ' ' + result.warnings.join(' ') : '')); accountCartChanged();
    } catch (cause) {
      let failure = cause;
      if (intent && cause instanceof MobileError && cause.code === 'CART_VERSION_CONFLICT') try { await guestCart.discard(intent.key); } catch (storageFailure) { failure = storageFailure; }
      if (alive.current) setError(cartError(failure));
    } finally { running.current = false; if (alive.current) { setBusy(false); settled?.(user.id); } }
  }, [client, user.id, settled]);
  useEffect(() => {
    alive.current = true; let active = true; queueMicrotask(() => { if (active) void merge(); });
    const stop = subscribeGuest(() => { void guestCart.read().then(value => { if (alive.current) setData(value); }).catch(cause => { if (alive.current) setError(cartError(cause)); }); });
    return () => { active = false; alive.current = false; controller.current?.abort(); stop(); };
  }, [merge]);
  if (!busy && !error && !notice && !data?.items.length && !data?.pending.length) return null;
  return <View style={s.card}><Text allowFontScaling accessibilityRole="header" style={s.heading}>Carrinho deste aparelho</Text>{busy ? <Text allowFontScaling accessibilityLiveRegion="polite" style={s.text}>Conferindo e mesclando os itens com sua conta…</Text> : null}{notice ? <Text allowFontScaling accessibilityLiveRegion="polite" style={s.text}>{notice}</Text> : null}{error ? <Text allowFontScaling accessibilityRole="alert" style={s.alert}>{error} Os dados locais aguardam conferência.</Text> : null}
    {!busy && (error || data?.items.length || data?.pending.length) ? <Button title="Tentar mesclar carrinho" onPress={() => { void merge(); }} /> : null}<Button title="Abrir carrinho" secondary onPress={open} />
  </View>;
}
