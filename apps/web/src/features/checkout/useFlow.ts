import { useCallback, useEffect, useRef, useState } from 'react';
import type { AcceptedFreight, CartView, CheckoutView, CheckoutQuote, DeliveryAddressSnapshot, OrderCreationView, PaymentPage, PaymentView, PurchaseIntent, PurchaseJournalState } from '@garimpo/contracts';
import { PurchaseJournal, PurchaseJournalError, guestTag } from '@garimpo/contracts';
export type PurchaseRequest = <T>(path: string, method?: string, body?: unknown, signal?: AbortSignal, key?: string) => Promise<T>;
interface FlowData { checkout: CheckoutView | null; addresses: DeliveryAddressSnapshot[]; orders: OrderCreationView[]; payments: PaymentPage; serverTime: string }
type Quoted = CheckoutQuote & { addressId: string };
function code(error: unknown) { return error && typeof error === 'object' && 'code' in error ? String(error.code) : ''; }
function denied(error: unknown) { return error && typeof error === 'object' && 'status' in error && (error.status === 401 || error.status === 403 && code(error) !== 'EMAIL_CONFIRMATION_REQUIRED'); }
export function useFlow(request: PurchaseRequest, journal: PurchaseJournal, message: (cause: unknown) => string) {
  const [data, setData] = useState<FlowData>(), [quote, setQuote] = useState<Quoted | null>(null), [saved, setSaved] = useState<PurchaseJournalState>(), [error, setError] = useState(''), [notice, setNotice] = useState(''), [busy, setBusy] = useState(false), [loading, setLoading] = useState(true), [page, setPage] = useState(1);
  const alive = useRef(true), generation = useRef(0), controller = useRef<AbortController | null>(null), executing = useRef(false);
  const readable = useCallback((cause: unknown) => code(cause) === 'ACCOUNT_CONTEXT_CHANGED' ? 'Sua conta mudou. Atualize seu acesso antes de continuar a compra.' : cause instanceof PurchaseJournalError ? cause.message : message(cause), [message]);
  const load = useCallback(async () => {
    const version = ++generation.current; controller.current?.abort(); const operation = new AbortController(); controller.current = operation; setLoading(true);
    try {
      const stored = await journal.read();
      const [checkout, addresses, payments, cart] = await Promise.all([
        request<CheckoutView>('/me/checkout', 'GET', undefined, operation.signal).catch(cause => { if (cause && typeof cause === 'object' && 'status' in cause && cause.status === 404) return null; throw cause; }),
        request<DeliveryAddressSnapshot[]>('/me/addresses', 'GET', undefined, operation.signal), request<PaymentPage>('/me/payment-attempts?page=' + page + '&pageSize=10', 'GET', undefined, operation.signal), request<CartView>('/me/cart', 'GET', undefined, operation.signal)
      ]);
      const orders: OrderCreationView[] = [], removable = new Set<string>();
      // Only replay references to already acknowledged orders; pending intent always requires an explicit resume.
      for (const ref of stored.orders) { const order = await request<OrderCreationView>('/orders', 'POST', ref.body, operation.signal, ref.key); orders.push(order); if (order.status !== 'PENDING' || !order.expiresAt || Date.parse(order.expiresAt) <= Date.parse(cart.serverTime)) removable.add(ref.key); }
      if (!alive.current || version !== generation.current) return;
      const current = removable.size ? await journal.update(value => ({ ...value, orders: value.orders.filter(ref => !removable.has(ref.key)) })) : await journal.read();
      if (alive.current && version === generation.current) { setSaved(current); setData({ checkout, addresses, payments, orders, serverTime: cart.serverTime }); setQuote(null); }
    } catch (cause) { if (alive.current && version === generation.current && !operation.signal.aborted) { setError(readable(cause)); setData(undefined); setQuote(null); } }
    finally { if (alive.current && version === generation.current) setLoading(false); }
  }, [request, journal, readable, page]);
  useEffect(() => { alive.current = true; void load(); return () => { alive.current = false; generation.current++; controller.current?.abort(); }; }, [load]);
  const refresh = useCallback(() => { if (!executing.current) { setError(''); void load(); } }, [load]);
  async function work(task: (signal: AbortSignal) => Promise<void>) {
    if (executing.current || loading) return; executing.current = true; setBusy(true); setError(''); setNotice('');
    controller.current?.abort(); generation.current++; const operation = new AbortController(); controller.current = operation;
    try { await task(operation.signal); }
    catch (cause) { if (alive.current && !operation.signal.aborted) { setError(readable(cause)); if (denied(cause)) { setData(undefined); setQuote(null); } } }
    finally { executing.current = false; if (alive.current) setBusy(false); }
  }
  function inspect(addressId: string) { void work(async signal => { if (!data?.checkout) return; const value = await request<CheckoutQuote>('/checkout/quote', 'POST', { checkoutId: data.checkout.id, addressId }, signal); if (alive.current) setQuote({ ...value, addressId }); }); }
  function accept() { void work(async signal => {
    if (!data?.checkout || !quote?.freight.served) return;
    await request<CheckoutView>('/checkouts/' + data.checkout.id + '/address', 'PATCH', { version: data.checkout.version, addressId: quote.addressId, freightRevision: quote.freightRevision }, signal);
    if (alive.current) { setNotice('Endereço e frete aceitos. Confira o método de pagamento.'); await load(); }
  }); }
  function invalidateQuote() { setQuote(null); }
  function submit(intent: PurchaseIntent) { void work(async signal => {
    const stored = await journal.update(current => { if (current.pending && current.pending.key !== intent.key) throw new PurchaseJournalError('Há uma tentativa salva. Retome essa tentativa antes de iniciar outra.'); return { ...current, pending: intent }; });
    if (!alive.current || signal.aborted) return; setSaved(stored); await send(intent, signal);
  }); }
  async function send(intent: PurchaseIntent, signal: AbortSignal) {
    const path = intent.kind === 'ORDER' ? '/orders' : intent.kind === 'CARD' ? '/checkouts/' + intent.targetId + '/simulated-card-payments' : '/orders/' + intent.targetId + '/simulated-payments';
    try {
      const result = await request<OrderCreationView | PaymentView>(path, 'POST', intent.body, signal, intent.key);
      if (!alive.current || signal.aborted) return;
      const current = await journal.update(value => ({ ...value, pending: value.pending?.key === intent.key ? null : value.pending, orders: intent.kind === 'ORDER' ? [...value.orders.filter(ref => ref.key !== intent.key), intent] : value.orders }));
      if (!alive.current) return; setSaved(current); setNotice(intent.kind === 'ORDER' ? 'Pedido criado. O prazo de pagamento é o original exibido abaixo.' : 'result' in result && result.result === 'DECLINED' ? 'Pagamento recusado. Tente novamente ou escolha outro método dentro do prazo original.' : 'Resultado do simulador atualizado. Confira abaixo.'); await load();
    } catch (cause) {
      // Only a definitive pre-effect rejection discards an intent. Network/5xx/401/403 retain its original key/body.
      if (['CHECKOUT_VERSION_CONFLICT', 'FREIGHT_CONFIRMATION_REQUIRED', 'CART_VERSION_CONFLICT', 'CHECKOUT_EXPIRED', 'CHECKOUT_UNAVAILABLE', 'ORDER_EXPIRED', 'CHARGE_UNAVAILABLE', 'EMAIL_CONFIRMATION_REQUIRED', 'PENDING_ORDER_LIMIT', 'PAYMENT_PENDING', 'ZIP_NOT_SERVED', 'CART_RESOURCE_NOT_FOUND', 'INSUFFICIENT_STOCK', 'COUPON_RESERVATION_UNAVAILABLE'].includes(code(cause)) && alive.current && !signal.aborted) {
        const current = await journal.update(value => ({ ...value, pending: value.pending?.key === intent.key ? null : value.pending })); setSaved(current); await load();
      }
      throw cause;
    }
  }
  function resume() { if (saved?.pending) void work(signal => send(saved.pending!, signal)); }
  function pay(method: 'CARD' | 'PIX' | 'BOLETO', scenario: 'APPROVED' | 'DECLINED' | 'PENDING' | 'APPROVED_REFUND_FAIL') {
    const checkout = data?.checkout, accepted: AcceptedFreight | null | undefined = checkout?.freight; if (!checkout || !accepted) return;
    const common = { version: checkout.version, addressId: accepted.address.id, freightRevision: accepted.revision }, key = 'purchase.' + guestTag();
    submit(method === 'CARD' ? { kind: 'CARD', key, targetId: checkout.id, body: { ...common, scenario } } : { kind: 'ORDER', key, targetId: checkout.id, body: { ...common, checkoutId: checkout.id, method } });
  }
  function simulate(order: OrderCreationView, scenario: 'APPROVED' | 'DECLINED' | 'PENDING' | 'APPROVED_REFUND_FAIL') { const charge = order.charges.find(row => row.status === 'ACTIVE'); if (charge) submit({ kind: 'CHARGE', key: 'payment.' + guestTag(), targetId: order.id, body: { chargeId: charge.id, scenario } }); }
  return { data, quote, saved, error, notice, busy, loading, page, setPage, refresh, inspect, accept, invalidateQuote, pay, simulate, resume };
}
