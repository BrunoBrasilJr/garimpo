import { useEffect, useMemo, useRef, useState } from 'react';
import type { AccountView, LogisticsCommand, OrderDetail, OrderStage } from '@garimpo/contracts';
import { ORIGINAL_LOGISTICS_NEXT, guestTag } from '@garimpo/contracts';
import { request, readableError, ClientError } from '../../account/client';
import type { PurchaseRequest } from '../../checkout/useFlow';
import { useHistory, emptyFilters } from '../../orders/useHistory';
import { OrderDetails } from '../../orders/Details';
import { dateLabel, methodLabel, statusLabel } from '../../orders/labels';
import { price } from '../../catalog/api';
import '../../orders/orders.css';
export default function AdminOrders({ user, query = '' }: { user: AccountView; query?: string }) {
  const id = new URLSearchParams(query).get('id') ?? '', call = useMemo<PurchaseRequest>(() => (path, method, body, signal, key) => request(path, method, body, true, signal, { accountId: user.id, ...(key ? { idempotencyKey: key } : {}) }), [user.id]);
  const flow = useHistory(call, '/admin/orders', id, readableError), [draft, setDraft] = useState(emptyFilters), alert = useRef<HTMLParagraphElement>(null);
  useEffect(() => { if (flow.error) alert.current?.focus(); }, [flow.error]);
  return <section className="account-card order-history"><h2>Pedidos e logística</h2><p>Registre apenas etapas e datas efetivas da remessa original. Separação e envio não movimentam dinheiro nem confirmam uma entrega estimada.</p>{flow.error ? <p role="alert" tabIndex={-1} ref={alert}>{flow.error}</p> : null}{flow.loading ? <p role="status">Conferindo pedidos…</p> : null}<button type="button" className="secondary" disabled={flow.loading} onClick={() => { void flow.reload(); }}>Atualizar pedidos da equipe</button>
    {id ? <><a href="#/orders-admin">Voltar à lista da equipe</a>{flow.detail ? <><OrderDetails data={flow.detail} busy={flow.loading} paymentPage={flow.setPaymentPage} refundPage={flow.setRefundPage} /><LogisticsForm key={flow.detail.id + ':' + flow.detail.version} detail={flow.detail} call={call} busy={flow.loading} refresh={flow.reload} /></> : null}</> : <><form aria-label="Filtrar pedidos da equipe" onSubmit={e => { e.preventDefault(); flow.apply(draft); }}><label>Estado do pedido<select aria-label="Estado do pedido" value={draft.status} onChange={e => setDraft(v => ({ ...v, status: e.target.value }))}><option value="">Todos</option>{(Object.keys(statusLabel) as OrderStage[]).map(s => <option key={s} value={s}>{statusLabel[s]}</option>)}</select></label><label>E-mail do cliente<input type="email" value={draft.customerEmail} onChange={e => setDraft(v => ({ ...v, customerEmail: e.target.value }))} /></label><label>Data inicial (São Paulo)<input type="date" value={draft.fromDate} onChange={e => setDraft(v => ({ ...v, fromDate: e.target.value }))} /></label><label>Data final (São Paulo)<input type="date" value={draft.throughDate} onChange={e => setDraft(v => ({ ...v, throughDate: e.target.value }))} /></label><button disabled={flow.loading}>Aplicar filtros da equipe</button></form>
      {flow.list ? <><p>Página {flow.list.page} de {Math.max(1, flow.list.totalPages)} · {flow.list.total} pedidos.</p>{!flow.list.items.length ? <p>Nenhum pedido para os filtros escolhidos.</p> : flow.list.items.map(row => <article key={row.id}><h3>Pedido {row.id.slice(0, 8)}</h3><p>{statusLabel[row.status]} · {methodLabel[row.method]} · {price(row.totalCents)}</p><p>{row.customer?.name} · {row.customer?.email} · criado em {dateLabel(row.createdAt)}.</p><a href={'#/orders-admin?id=' + row.id}>Administrar pedido {row.id.slice(0, 8)}</a></article>)}<button type="button" className="secondary" disabled={flow.loading || flow.page <= 1} onClick={() => flow.setPage(p => p - 1)}>Página anterior da equipe</button><button type="button" className="secondary" disabled={flow.loading || flow.page >= flow.list!.totalPages} onClick={() => flow.setPage(p => p + 1)}>Próxima página da equipe</button></> : null}</>}
  </section>;
}
function localInput(value: string) { const date = new Date(value); return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 23); }
function LogisticsForm({ detail, call, busy, refresh }: { detail: OrderDetail; call: PurchaseRequest; busy: boolean; refresh: () => Promise<void> }) {
  const next = ORIGINAL_LOGISTICS_NEXT[detail.status], [reason, setReason] = useState('Etapa conferida pela equipe'), [tracking, setTracking] = useState(''), [when, setWhen] = useState(localInput(detail.serverTime)), [error, setError] = useState(''), [notice, setNotice] = useState(''), [saving, setSaving] = useState(false), [pending, setPending] = useState(false);
  const executing = useRef(false), alive = useRef(true), controller = useRef<AbortController | null>(null), intent = useRef<{ body: LogisticsCommand; key: string } | null>(null), alert = useRef<HTMLParagraphElement>(null);
  useEffect(() => { alive.current = true; return () => { alive.current = false; controller.current?.abort(); }; }, []);
  useEffect(() => { if (error) alert.current?.focus(); }, [error]);
  if (!next) return <section><h4>Atualização logística</h4><p>{detail.status === 'PENDING' ? 'Aguarde confirmação do pagamento antes de iniciar a separação.' : 'Não há próxima etapa de envio original para o estado atual.'}</p></section>;
  async function submit() {
    if (executing.current || busy || !next) return; executing.current = true; setSaving(true); setError(''); setNotice(''); const operation = new AbortController(); controller.current = operation;
    try {
      if (!intent.current) {
        const common = { version: detail.version, reason: reason.trim() };
        const body: LogisticsCommand = next === 'SHIPPED' ? { ...common, status: next, trackingCode: tracking.trim(), postedAt: new Date(when).toISOString() } : next === 'DELIVERED' ? { ...common, status: next, deliveredAt: new Date(when).toISOString() } : { ...common, status: next };
        intent.current = { body, key: 'logistics.' + guestTag() }; setPending(true);
      }
      await call<OrderDetail>('/admin/orders/' + detail.id + '/status', 'PATCH', intent.current.body, operation.signal, intent.current.key);
      if (alive.current) { intent.current = null; setPending(false); setNotice('Etapa registrada. Confira o pedido atualizado.'); await refresh(); }
    } catch (cause) {
      if (alive.current && !operation.signal.aborted) { if (cause instanceof ClientError && [409, 422].includes(cause.status)) { intent.current = null; setPending(false); } setError(cause instanceof RangeError ? 'Confira a data e hora efetivas.' : readableError(cause)); }
    } finally { executing.current = false; if (alive.current) setSaving(false); }
  }
  return <form aria-label="Atualizar etapa do pedido" aria-busy={saving} onSubmit={e => { e.preventDefault(); void submit(); }}><h4>Próxima etapa: {statusLabel[next]}</h4><p>A data e hora abaixo usam o horário deste aparelho. O histórico apresenta os horários em São Paulo.</p>{error ? <p role="alert" tabIndex={-1} ref={alert}>{error}</p> : null}{notice ? <p role="status">{notice}</p> : null}
    <fieldset disabled={busy || saving || pending}><label>Observação visível ao cliente<textarea required minLength={3} maxLength={500} value={reason} onChange={e => setReason(e.target.value)} /></label>{next === 'SHIPPED' ? <label>Código de rastreamento original<input required maxLength={120} value={tracking} onChange={e => setTracking(e.target.value)} /></label> : null}{next === 'SHIPPED' || next === 'DELIVERED' ? <label>{next === 'SHIPPED' ? 'Data e hora efetivas da postagem' : 'Data e hora efetivas da entrega'}<input required type="datetime-local" step="0.001" value={when} onChange={e => setWhen(e.target.value)} /></label> : null}</fieldset>
    {pending ? <p>A resposta está aguardando conferência. Repita os mesmos dados ou consulte o pedido atualizado antes de outra ação.</p> : null}<button disabled={busy || saving}>{saving ? 'Registrando etapa…' : pending ? 'Repetir atualização com os mesmos dados' : 'Registrar ' + statusLabel[next].toLocaleLowerCase('pt-BR')}</button><button type="button" className="secondary" disabled={busy || saving} onClick={() => { void refresh(); }}>Conferir pedido atualizado</button>
  </form>;
}
