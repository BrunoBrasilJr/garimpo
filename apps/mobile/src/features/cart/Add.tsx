import { useEffect, useRef, useState } from 'react';
import { Text, View } from 'react-native';
import type { AccountView, CatalogOffer, CartView, CartChange } from '@garimpo/contracts';
import { guestTag } from '@garimpo/contracts';
import { MobileAccountClient, MobileError } from '../account/client';
import { Button } from '../catalog/Controls';
import { styles as s } from '../catalog/styles';
import { guestCart, accountCartChanged } from './storage';
import { cartRequest, cartError, quantity } from './client';
import { CartField } from './Field';
export function AddToCart({ editionId, offer, user, client, ready = true, open }: { editionId: string; offer: CatalogOffer | undefined; user: AccountView | null; client: MobileAccountClient | null; ready?: boolean; open: () => void }) {
  const [amount, setAmount] = useState('1'), [busy, setBusy] = useState(false), [uncertain, setUncertain] = useState(false), [error, setError] = useState(''), [notice, setNotice] = useState('');
  const alive = useRef(true), controller = useRef<AbortController | null>(null), pending = useRef<{ key: string; body: { version: number; offerId: string; quantity: number } } | null>(null);
  useEffect(() => { alive.current = true; return () => { alive.current = false; controller.current?.abort(); }; }, []);
  if (user && user.context !== 'CUSTOMER') return <Text allowFontScaling style={s.text}>Para comprar, entre com uma conta de cliente.</Text>;
  if (!offer) return <Text allowFontScaling style={s.text}>Selecione uma oferta para adicionar ao carrinho.</Text>;
  const selected = offer;
  async function add() {
    setBusy(true); setError(''); setNotice(''); const operation = new AbortController(); controller.current = operation;
    try {
      const count = selected.kind === 'USED' ? 1 : quantity(amount);
      if (!user) await guestCart.add(selected.id, editionId, count, selected.kind === 'USED');
      else {
        if (!client) throw new MobileError(0, {}, 'A conexão segura está indisponível.');
        if (!pending.current) { const cart = await cartRequest<CartView>(client, user.id, '/me/cart', 'GET', undefined, operation.signal); pending.current = { key: 'add.' + guestTag(), body: { version: cart.version, offerId: selected.id, quantity: count } }; }
        await cartRequest<CartChange>(client, user.id, '/me/cart/items', 'POST', pending.current.body, operation.signal, pending.current.key);
      }
      if (alive.current) { pending.current = null; setUncertain(false); setNotice('Adicionado ao carrinho. Adicionar não reserva estoque.'); accountCartChanged(); }
    } catch (cause) {
      if (!alive.current) return;
      if (cause instanceof MobileError && (cause.code === 'CART_VERSION_CONFLICT' || cause.status === 422)) pending.current = null;
      setUncertain(Boolean(pending.current)); setError(cartError(cause));
    } finally { if (alive.current) setBusy(false); }
  }
  return <View style={s.card}><Text allowFontScaling accessibilityRole="header" style={s.heading}>Adicionar ao carrinho</Text><Text allowFontScaling style={s.text}>O carrinho não reserva estoque nem garante o preço. A reserva começa após conferir os valores.</Text>
    {selected.kind === 'NEW' ? <CartField label="Quantidade para adicionar" value={amount} change={setAmount} numeric disabled={busy || uncertain} /> : <Text allowFontScaling style={s.text}>Este exemplar usado tem uma unidade.</Text>}
    <Button title={busy ? 'Adicionando…' : uncertain ? 'Confirmar adição pendente' : 'Adicionar ao carrinho'} disabled={!ready || busy || !selected.available} onPress={() => { void add(); }} />
    {error ? <Text allowFontScaling accessibilityRole="alert" style={s.alert}>{error}{uncertain ? ' Repetir esta confirmação não duplica a adição.' : ''}</Text> : null}{notice ? <Text allowFontScaling accessibilityLiveRegion="polite" style={s.text}>{notice}</Text> : null}<Button title="Ver carrinho" secondary onPress={open} />
  </View>;
}
