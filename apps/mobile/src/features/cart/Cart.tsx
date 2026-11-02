import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, Pressable, Text, View } from 'react-native';
import type { AccountView, CartLine, CartView, CheckoutView } from '@garimpo/contracts';
import { guestTag } from '@garimpo/contracts';
import { MobileAccountClient, MobileError } from '../account/client';
import { Button } from '../catalog/Controls';
import { money } from '../catalog/client';
import { styles as s } from '../catalog/styles';
import { CartField } from './Field';
import { cartRequest, cartError, quantity } from './client';
import { subscribeAccountCart } from './storage';
import { VisitorCart } from './Visitor';
export function Cart({ user, client, origin, login, browse }: { user: AccountView | null; client: MobileAccountClient | null; origin: string; login: () => void; browse: () => void }) {
  if (user?.context === 'STAFF') return <Text allowFontScaling accessibilityRole="alert" style={s.alert}>Para comprar, use uma conta de cliente.</Text>;
  if (!user) return <VisitorCart origin={origin} login={login} browse={browse} />;
  return client ? <AccountCart key={user.id} user={user} client={client} browse={browse} /> : <Text allowFontScaling accessibilityRole="alert" style={s.alert}>A conexão segura está indisponível. Tente novamente.</Text>;
}
function AccountCart({ user, client, browse }: { user: AccountView; client: MobileAccountClient; browse: () => void }) {
  const [data, setData] = useState<CartView>(), [checkout, setCheckout] = useState<CheckoutView | null>(null), [error, setError] = useState(''), [notice, setNotice] = useState(''), [busy, setBusy] = useState(false), [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState(''), [coupon, setCoupon] = useState(''), [confirmed, setConfirmed] = useState('');
  const alive = useRef(true), generation = useRef(0), controller = useRef<AbortController | null>(null), intent = useRef<{ key: string; body: { version: number; pricingRevision: string; couponCode?: string } } | null>(null);
  const load = useCallback(async (selectedCoupon: string) => {
    const version = ++generation.current; controller.current?.abort(); const operation = new AbortController(); controller.current = operation; setLoading(true);
    try {
      const [cart, active] = await Promise.all([
        cartRequest<CartView>(client, user.id, '/me/cart' + (selectedCoupon ? '?couponCode=' + encodeURIComponent(selectedCoupon) : ''), 'GET', undefined, operation.signal),
        cartRequest<CheckoutView>(client, user.id, '/me/checkout', 'GET', undefined, operation.signal).catch(cause => { if (cause instanceof MobileError && cause.status === 404) return null; throw cause; })
      ]);
      if (alive.current && version === generation.current) { setData(cart); setCheckout(active); }
    } catch (cause) { if (alive.current && version === generation.current && !operation.signal.aborted) { setData(undefined); setCheckout(null); setError(cartError(cause)); } }
    finally { if (alive.current && version === generation.current) setLoading(false); }
  }, [client, user.id]);
  useEffect(() => {
    alive.current = true; void load(coupon); const stop = subscribeAccountCart(() => { void load(coupon); }), listener = AppState.addEventListener('change', status => { if (status === 'active') void load(coupon); });
    return () => { alive.current = false; generation.current++; controller.current?.abort(); stop(); listener.remove(); };
  }, [load, coupon]);
  async function mutation(work: (signal: AbortSignal) => Promise<unknown>, success: string, selectedCoupon = coupon) {
    setBusy(true); setError(''); setNotice(''); generation.current++; controller.current?.abort(); const operation = new AbortController(); controller.current = operation;
    try { await work(operation.signal); if (alive.current) { setNotice(success); intent.current = null; setConfirmed(''); await load(selectedCoupon); return true; } return false; }
    catch (cause) {
      if (alive.current && !operation.signal.aborted) {
        setError(cartError(cause)); if (cause instanceof MobileError && cause.code === 'CART_VERSION_CONFLICT') await load(selectedCoupon);
        else if (cause instanceof MobileError && (cause.status === 401 || cause.status === 403)) { setData(undefined); setCheckout(null); setConfirmed(''); }
      } return false;
    } finally { if (alive.current) setBusy(false); }
  }
  async function applyCoupon() {
    const value = draft.trim().toUpperCase(), changed = await mutation(async signal => {
      const active = await cartRequest<CheckoutView>(client, user.id, '/me/checkout', 'GET', undefined, signal).catch(cause => { if (cause instanceof MobileError && cause.status === 404) return null; throw cause; });
      if (active && active.couponCode !== (value || null)) await cartRequest(client, user.id, '/checkouts/' + active.id, 'DELETE', undefined, signal);
    }, 'Confira abaixo a validade e os valores do cupom informado.', value);
    if (alive.current && changed) { setCoupon(value); setConfirmed(''); }
  }
  async function reserve() {
    if (!data || data.pricing.status !== 'READY' || confirmed !== data.pricing.revision) return;
    setBusy(true); setError(''); setNotice(''); const operation = new AbortController(); controller.current?.abort(); controller.current = operation; generation.current++;
    if (!intent.current) intent.current = { key: 'checkout.' + guestTag(), body: { version: data.version, pricingRevision: data.pricing.revision, ...(coupon ? { couponCode: coupon } : {}) } };
    try {
      const value = await cartRequest<CheckoutView>(client, user.id, '/checkouts', 'POST', intent.current.body, operation.signal, intent.current.key);
      if (alive.current) { intent.current = null; setConfirmed(''); setCheckout(value.status === 'ACTIVE' ? value : null); setNotice(value.status === 'ACTIVE' ? 'Finalização recuperada do servidor. O prazo abaixo é o original.' : 'Esta tentativa já foi encerrada. Confira antes de iniciar outra.'); }
    } catch (cause) {
      if (!alive.current || operation.signal.aborted) return; setError(cartError(cause));
      if (cause instanceof MobileError && ['CART_VERSION_CONFLICT', 'PRICE_CONFIRMATION_REQUIRED', 'INSUFFICIENT_STOCK', 'COUPON_LIMIT_REACHED', 'PENDING_ORDER_LIMIT'].includes(cause.code)) { intent.current = null; setConfirmed(''); await load(coupon); }
      else if (cause instanceof MobileError && (cause.status === 401 || cause.status === 403)) { setData(undefined); setCheckout(null); setConfirmed(''); }
    } finally { if (alive.current) setBusy(false); }
  }
  return <View style={s.page}><Text allowFontScaling accessibilityRole="header" style={s.title}>Seu carrinho</Text><Text allowFontScaling style={s.text}>Adicionar não reserva estoque. A finalização só reserva o conjunto após conferir e confirmar os valores no servidor.</Text>
    {error ? <Text allowFontScaling accessibilityRole="alert" style={s.alert}>{error}</Text> : null}{notice ? <Text allowFontScaling accessibilityLiveRegion="polite" style={s.text}>{notice}</Text> : null}{loading ? <Text allowFontScaling accessibilityLiveRegion="polite" style={s.text}>Conferindo carrinho e finalização…</Text> : null}<Button title="Atualizar carrinho e finalização" secondary disabled={busy} onPress={() => { setError(''); void load(coupon); }} />
    {checkout ? <View style={s.card} accessibilityLabel="Finalização em andamento" testID="active-checkout"><Text allowFontScaling accessibilityRole="header" style={s.heading}>Finalização em andamento</Text><CheckoutTimer expiresAt={checkout.expiresAt} serverTime={checkout.serverTime} /><Text allowFontScaling style={s.text}>Validade original: {new Date(checkout.expiresAt).toLocaleString('pt-BR')}. Mudar itens, quantidades ou cupom encerra esta reserva.</Text>
      {checkout.products.map(product => <Text allowFontScaling style={s.text} key={product.offerId}>{product.title} · {product.quantity} {product.quantity === 1 ? 'unidade' : 'unidades'} · {money(checkout.quote.units.filter(unit => product.unitIds.includes(unit.id)).reduce((sum, unit) => sum + unit.netPriceCents, 0))}</Text>)}<Text allowFontScaling style={s.text}>Total dos produtos reservado: {money(checkout.quote.totalCents)}. Frete ainda não foi cotado.</Text><Button title="Encerrar finalização" disabled={busy} onPress={() => { void mutation(signal => cartRequest(client, user.id, '/checkouts/' + checkout.id, 'DELETE', undefined, signal), 'Finalização encerrada no servidor.'); }} />
    </View> : null}
    {data ? <><Text allowFontScaling accessibilityRole="header" style={s.heading}>Itens e preços atuais</Text>{!data.items.length ? <Text allowFontScaling style={s.text}>Seu carrinho está vazio.</Text> : data.items.map(line => <AccountLine key={line.id + ':' + data.version} line={line} busy={busy || loading} change={async count => { await mutation(signal => cartRequest(client, user.id, '/me/cart/items/' + line.id, 'PATCH', { version: data.version, quantity: count }, signal), 'Quantidade atualizada. Confira novamente os valores.'); }} remove={async () => { await mutation(signal => cartRequest(client, user.id, '/me/cart/items/' + line.id + '?version=' + data.version, 'DELETE', undefined, signal), 'Item removido.'); }} />)}
      {data.items.length ? <><Button title="Esvaziar carrinho da conta" secondary disabled={busy || loading} onPress={() => { void mutation(signal => cartRequest(client, user.id, '/me/cart/items', 'DELETE', undefined, signal), 'Carrinho esvaziado no servidor.'); }} /><CartField label="Código do cupom" value={draft} change={setDraft} maxLength={40} disabled={busy} /><Button title="Conferir cupom" disabled={busy || loading} onPress={() => { void applyCoupon(); }} />
        {data.pricing.status === 'READY' ? <><Text allowFontScaling style={s.text}>Subtotal após promoções: {money(data.pricing.quote.promotionalSubtotalCents)} · desconto do cupom: {money(data.pricing.quote.couponDiscountCents)} · total dos produtos: {money(data.pricing.quote.totalCents)}. Frete será cotado depois.</Text>
          {!checkout ? <><Pressable accessibilityRole="checkbox" accessibilityLabel="Conferi os itens e os valores atuais" accessibilityState={{ checked: confirmed === data.pricing.revision, disabled: busy || loading }} disabled={busy || loading} style={[s.button, s.secondary]} onPress={() => setConfirmed(confirmed === (data.pricing.status === 'READY' ? data.pricing.revision : '') ? '' : data.pricing.status === 'READY' ? data.pricing.revision : '')}><Text allowFontScaling style={[s.buttonText, s.secondaryText]}>{confirmed === data.pricing.revision ? '☑' : '☐'} Conferi os itens e os valores atuais</Text></Pressable><Button title={busy ? 'Conferindo…' : intent.current ? 'Confirmar tentativa pendente' : 'Reservar conjunto por 15 minutos'} disabled={busy || loading || confirmed !== data.pricing.revision} onPress={() => { void reserve(); }} /></> : null}
        </> : <Text allowFontScaling accessibilityLiveRegion="polite" style={s.text}>{data.pricing.message}</Text>}
      </> : null}</> : null}<Button title="Continuar explorando discos" secondary onPress={browse} />
  </View>;
}
function AccountLine({ line, busy, change, remove }: { line: CartLine; busy: boolean; change: (count: number) => Promise<void>; remove: () => Promise<void> }) {
  const [amount, setAmount] = useState(String(line.quantity)), [error, setError] = useState('');
  return <View style={s.card}><Text allowFontScaling accessibilityRole="header" style={s.heading}>{line.title}</Text><Text allowFontScaling style={s.text}>{line.kind === 'USED' ? `Usado · disco ${line.discGrade} · capa ${line.sleeveGrade}` : 'Novo'}</Text><Text allowFontScaling style={s.text}>{money(line.currentPriceCents)} por unidade · quantidade no carrinho: {line.quantity} · saldo atual para conferir: {line.availableQuantity}</Text>
    {line.lastSeenPriceCents !== line.currentPriceCents ? <Text allowFontScaling style={s.text}>O preço mudou desde a adição. Confira antes de reservar.</Text> : null}{!line.active || line.quantity > line.availableQuantity ? <Text allowFontScaling style={s.text}>Esta quantidade não está disponível agora. Ajuste ou remova este item.</Text> : null}
    {line.kind === 'NEW' ? <><CartField label={'Quantidade de ' + line.title} value={amount} change={setAmount} numeric disabled={busy} /><Button title={'Atualizar quantidade de ' + line.title} disabled={busy} onPress={() => { try { const count = quantity(amount); setError(''); void change(count); } catch (cause) { setError(cartError(cause)); } }} /></> : null}
    {error ? <Text allowFontScaling accessibilityRole="alert" style={s.alert}>{error}</Text> : null}<Button title={'Remover ' + line.title} secondary disabled={busy} onPress={() => { void remove(); }} />
  </View>;
}
export function CheckoutTimer({ expiresAt, serverTime }: { expiresAt: string; serverTime: string }) {
  const [reading, setReading] = useState(() => ({ now: Date.now(), offset: Date.parse(serverTime) - Date.now() }));
  useEffect(() => { const offset = Date.parse(serverTime) - Date.now(); setReading({ now: Date.now(), offset }); const interval = setInterval(() => setReading({ now: Date.now(), offset }), 1000); return () => clearInterval(interval); }, [expiresAt, serverTime]);
  const seconds = Math.max(0, Math.ceil((Date.parse(expiresAt) - reading.now - reading.offset) / 1000));
  return <Text allowFontScaling accessibilityLabel="Tempo restante da finalização" accessibilityLiveRegion="none" style={s.text}>{seconds ? `Tempo restante: ${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}` : 'Prazo encerrado. Atualize para conferir o estado no servidor.'}</Text>;
}
