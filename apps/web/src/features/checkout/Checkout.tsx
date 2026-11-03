import { useEffect, useMemo, useRef, useState } from 'react';
import type { AccountView, OrderCreationView, PaymentView } from '@garimpo/contracts';
import { PurchaseJournal } from '@garimpo/contracts';
import { readableError } from '../account/client';
import { cartRequest } from '../cart/client';
import { price } from '../catalog/api';
import { useFlow } from './useFlow';
import type { PurchaseRequest } from './useFlow';
import { Deadline, useServerNow } from './Deadline';
import './checkout.css';
const methods = { CARD: 'Cartão simulado', PIX: 'Pix', BOLETO: 'Boleto' };
const statuses = { PENDING: 'Aguardando pagamento', PAID: 'Pago', CANCELLED: 'Cancelado', PREPARING: 'Em separação', SEPARATED: 'Separado', SHIPPED: 'Enviado', DELIVERED: 'Entregue' };
const scenarios = [{ value: 'APPROVED', label: 'Aprovar' }, { value: 'DECLINED', label: 'Recusar' }, { value: 'PENDING', label: 'Deixar pendente' }] as const;
type Scenario = typeof scenarios[number]['value'];
export default function Checkout({ user, mode = 'checkout' }: { user: AccountView | null; mode?: 'checkout' | 'payments' }) {
  if (!user) return <section className="account-card"><h2>Entre para continuar a compra</h2><a href="#/login">Entrar na conta de compra</a></section>;
  if (user.context !== 'CUSTOMER') return <section className="account-card"><h2>Conta de compra necessária</h2><p>Use uma conta de cliente para finalizar compras.</p></section>;
  return <Flow key={user.id} user={user} mode={mode} />;
}
function Flow({ user, mode }: { user: AccountView; mode: 'checkout' | 'payments' }) {
  const request = useMemo<PurchaseRequest>(() => (path, method, body, signal, key) => cartRequest(user.id, path, method, body, signal, key), [user.id]);
  const journal = useMemo(() => new PurchaseJournal({ get: async key => sessionStorage.getItem(key), set: async (key, value) => sessionStorage.setItem(key, value) }, user.id), [user.id]);
  const flow = useFlow(request, journal, readableError), { data, quote } = flow, now = useServerNow(data?.serverTime), alert = useRef<HTMLParagraphElement>(null);
  const [addressId, setAddressId] = useState(''), [method, setMethod] = useState<'CARD' | 'PIX' | 'BOLETO'>('CARD'), [scenario, setScenario] = useState<Scenario>('APPROVED'), [confirmed, setConfirmed] = useState('');
  const checkout = data?.checkout, accepted = checkout?.freight, disabled = flow.busy || flow.loading || Boolean(flow.saved?.pending), revision = checkout ? checkout.id + ':' + checkout.version : '';
  useEffect(() => { setConfirmed(''); setAddressId(checkout?.addressId ?? ''); }, [checkout?.id, checkout?.version, checkout?.addressId]);
  useEffect(() => { if (flow.error) alert.current?.focus(); }, [flow.error]);
  useEffect(() => { const visible = () => { if (document.visibilityState === 'visible') flow.refresh(); }; document.addEventListener('visibilitychange', visible); return () => document.removeEventListener('visibilitychange', visible); }, [flow.refresh]);
  const orders = new Map<string, OrderCreationView>(); for (const row of data?.orders ?? []) orders.set(row.id, row); for (const p of data?.payments.items ?? []) if (p.order) orders.set(p.order.id, p.order);
  const pendingCard = data?.payments.items.some(p => p.checkoutId === checkout?.id && p.method === 'CARD' && p.result === 'PENDING');
  return <section className="account-card purchase-view"><h2>{mode === 'checkout' ? 'Finalizar compra' : 'Seus pagamentos'}</h2><p>Ambiente de simulação. Nenhuma cobrança real; não informe dados de cartão.</p>
    {flow.error ? <p role="alert" tabIndex={-1} ref={alert}>{flow.error}</p> : null}{flow.notice ? <p role="status">{flow.notice}</p> : null}{flow.loading ? <p role="status">Conferindo finalização e pagamentos…</p> : null}
    <button type="button" className="secondary" disabled={flow.busy || flow.loading} onClick={flow.refresh}>Atualizar finalização e pagamentos</button>
    {flow.saved?.pending ? <section aria-label="Tentativa salva"><h3>Tentativa aguardando conferência</h3><p>A resposta pode ter se perdido. Retome a mesma tentativa antes de iniciar outra. Os dados e a chave originais serão preservados.</p><button type="button" disabled={flow.busy || flow.loading} onClick={flow.resume}>Retomar tentativa com os mesmos dados</button></section> : null}
    {data ? <>{checkout ? <section aria-label="Finalização reservada" data-checkout-id={checkout.id}><h3>Conjunto reservado</h3><Deadline now={now} expiresAt={checkout.expiresAt} label="Prazo original da finalização" />
      {checkout.products.map(p => <p key={p.offerId}>{p.title} · {p.quantity} {p.quantity === 1 ? 'unidade' : 'unidades'}</p>)}
      <p>Produtos após promoções: {price(checkout.quote.promotionalSubtotalCents)} · desconto do cupom: {price(checkout.quote.couponDiscountCents)} · produtos reservados: {price(checkout.quote.totalCents)}.</p><p>Cupom: {checkout.couponCode ?? 'nenhum'}.</p><a href="#/cart">Alterar itens ou cupom no carrinho</a><p>Alterar itens, quantidades ou cupom encerra a reserva atual. Uma recusa de pagamento conserva o prazo original.</p>
      <fieldset disabled={disabled}><legend>Endereço de entrega</legend>{data.addresses.length ? data.addresses.map(address => <label className="purchase-choice" key={address.id}><input type="radio" name="delivery" value={address.id} checked={addressId === address.id} onChange={() => { setAddressId(address.id); setConfirmed(''); flow.invalidateQuote(); }} /><span>{address.recipient} · {address.street}, {address.number} · {address.neighborhood} · {address.city}/{address.region} · CEP {address.zip}</span></label>) : <p>Nenhum endereço cadastrado.</p>}
        <a href="#/profile">Cadastrar ou editar endereço na minha conta</a><button type="button" disabled={!addressId} onClick={() => { setConfirmed(''); flow.inspect(addressId); }}>Cotar frete deste endereço</button>
      </fieldset>
      {quote ? <section aria-label="Cotação de frete">{quote.freight.served ? <><h3>Confira o frete</h3><p>CEP {quote.freight.zip} · {quote.freight.region} · frete {price(quote.freight.amountCents)} · prazo informado: {quote.freight.deliveryDays} dias.</p><p>Total com frete: {price(quote.totalCents!)}.</p><button type="button" disabled={disabled} onClick={flow.accept}>Aceitar endereço e frete cotados</button></> : <p role="status">Este CEP não é atendido. Escolha ou corrija o endereço. A reserva continua somente até seu prazo original.</p>}</section> : null}
      {accepted ? <section aria-label="Entrega aceita"><h3>Endereço e frete aceitos</h3><p>{accepted.address.recipient} · {accepted.address.street}, {accepted.address.number}{accepted.address.complement ? ' · ' + accepted.address.complement : ''} · {accepted.address.neighborhood} · {accepted.address.city}/{accepted.address.region} · CEP {accepted.address.zip}</p><p>Frete: {price(accepted.freight.amountCents)} · prazo informado: {accepted.freight.deliveryDays} dias · total da compra: {price(checkout.quote.totalCents + accepted.freight.amountCents)}.</p></section> : <p>Escolha o endereço, confira a cotação e aceite o frete antes de pagar.</p>}
      {!user.emailVerifiedAt ? <p>A primeira compra exige e-mail confirmado. <a href="#/profile">Conferir confirmação na minha conta</a>.</p> : null}
      <fieldset disabled={disabled}><legend>Método de pagamento</legend>{(['CARD', 'PIX', 'BOLETO'] as const).map(value => <label className="purchase-choice" key={value}><input type="radio" name="method" checked={method === value} onChange={() => { setMethod(value); setConfirmed(''); }} />{methods[value]}</label>)}<p>{method === 'PIX' ? 'Pix: 30 minutos completos a partir da criação do pedido.' : method === 'BOLETO' ? 'Boleto: 2 dias completos a partir da criação do pedido.' : 'Cartão: aprovação precisa respeitar o prazo original de 15 minutos da finalização. Recusa não cria pedido.'}</p>
        {method === 'CARD' ? <label>Resultado do cartão no simulador<select aria-label="Resultado do cartão no simulador" value={scenario} onChange={e => { setScenario(e.target.value as Scenario); setConfirmed(''); }}>{scenarios.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}</select></label> : null}
        {pendingCard ? <p role="status">Há um cartão pendente nesta finalização. Aguarde o evento do simulador ou escolha Pix/boleto; uma aprovação do cartão antigo será estornada se a finalização já tiver sido convertida.</p> : null}
        <label className="purchase-choice"><input type="checkbox" checked={confirmed === revision && Boolean(revision)} onChange={e => setConfirmed(e.target.checked ? revision : '')} />Conferi o endereço aceito, frete, produtos e método de pagamento</label>
        <button type="button" disabled={!accepted || addressId !== accepted.address.id || confirmed !== revision || Date.parse(checkout.expiresAt) <= now || method === 'CARD' && pendingCard} onClick={() => flow.pay(method, scenario)}>{method === 'CARD' ? 'Simular cartão' : method === 'PIX' ? 'Criar pedido Pix' : 'Criar pedido com boleto'}</button>
      </fieldset>
    </section> : <p>Não há finalização ativa. <a href="#/cart">Confira o carrinho para reservar um conjunto</a>.</p>}
    <section aria-label="Pedidos deste pagamento"><h3>Pedidos e cobranças</h3>{!orders.size ? <p>Nenhum pedido vinculado aos pagamentos desta página.</p> : [...orders.values()].map(order => <Order key={order.id} order={order} now={now} blocked={disabled || Boolean(data.payments.items.find(p => p.chargeId === order.charges.find(c => c.status === 'ACTIVE')?.id && p.result === 'PENDING'))} simulate={flow.simulate} />)}</section>
    <section aria-label="Resultados dos pagamentos"><h3>Tentativas e estornos</h3><p>Uma pendência aguarda evento técnico do simulador. Confirmação tardia não reativa pedido. Falha de estorno permanece visível; sistema/administrador podem repetir o automático.</p>
      {!data.payments.items.length ? <p>Nenhuma tentativa nesta página.</p> : data.payments.items.map(p => <Payment key={p.id} payment={p} />)}<p>Página {data.payments.page} de {Math.max(1, data.payments.totalPages)} · {data.payments.total} tentativas.</p>
      <button type="button" className="secondary" disabled={disabled || flow.page <= 1} onClick={() => flow.setPage(p => p - 1)}>Pagamentos anteriores nesta lista</button><button type="button" className="secondary" disabled={disabled || flow.page >= data.payments.totalPages} onClick={() => flow.setPage(p => p + 1)}>Próxima página de pagamentos</button>
    </section></> : null}<a href="#/cart">Voltar ao carrinho</a><a href="#/profile">Minha conta e endereços</a>
  </section>;
}
function Order({ order, now, blocked, simulate }: { order: OrderCreationView; now: number; blocked: boolean; simulate: (order: OrderCreationView, scenario: Scenario) => void }) {
  const [scenario, setScenario] = useState<Scenario>('APPROVED'), charge = order.charges.find(c => c.status === 'ACTIVE'), expired = Boolean(order.expiresAt && Date.parse(order.expiresAt) <= now);
  return <article data-order-id={order.id}><h4>Pedido {order.id.slice(0, 8)} · {methods[order.method]}</h4><p>{statuses[order.status]}{order.status === 'PENDING' && expired ? ' · prazo de pagamento encerrado; aguardando atualização do estado no servidor.' : ''}</p>
    {order.products.map(p => <p key={p.offerId}>{p.title} · {p.quantity} unidades</p>)}<p>Produtos: {price(order.quote.totalCents)} · frete original: {price(order.freight.amountCents)} · total original: {price(order.totalCents)}.</p>{order.expiresAt ? <Deadline now={now} expiresAt={order.expiresAt} label="Prazo original do pagamento" /> : <p>Cartão aprovado sem prazo de cobrança pendente.</p>}
    {order.charges.map(c => <p key={c.id}>{c.status === 'ACTIVE' ? 'Cobrança ativa' : c.status === 'SUPERSEDED' ? 'Cobrança substituída: não pode quitar o pedido' : c.status === 'PAID' ? 'Cobrança paga' : 'Cobrança encerrada'} · {price(c.amountCents)}</p>)}
    {order.status === 'PENDING' && charge ? <fieldset disabled={blocked || expired}><legend>Simular pagamento do pedido {order.id.slice(0, 8)}</legend><label>Resultado do pagamento<select value={scenario} onChange={e => setScenario(e.target.value as Scenario)}>{scenarios.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}</select></label><button type="button" onClick={() => simulate(order, scenario)}>Executar simulação deste pagamento</button></fieldset> : null}
  </article>;
}
function Payment({ payment }: { payment: PaymentView }) {
  return <article data-payment-id={payment.id}><h4>{methods[payment.method]} · {new Date(payment.createdAt).toLocaleString('pt-BR')}</h4><p>{payment.result === 'PENDING' ? 'Resultado pendente' : payment.result === 'DECLINED' ? 'Pagamento recusado' : payment.outcome === 'REFUND_REQUIRED' ? 'Pagamento recebido e encaminhado para estorno' : payment.outcome === 'PAID' ? 'Pagamento confirmado' : 'Resposta recebida, aguardando aplicação'} · {price(payment.amountCents)}</p>
    {payment.refunds.map(r => <section key={r.id} aria-label="Estorno do pagamento"><h5>{r.status === 'FAILED' ? 'Estorno com falha' : r.status === 'SUCCEEDED' ? 'Estorno concluído' : 'Estorno pendente'}</h5><p>Produtos: {price(r.productCents)} · frete: {price(r.shippingCents)} · tentativas: {r.attempts.length}.</p>{r.completedAt ? <p>Concluído em {new Date(r.completedAt).toLocaleString('pt-BR')}.</p> : <p>A restituição ainda não foi concluída. A pendência continua registrada.</p>}</section>)}
  </article>;
}
