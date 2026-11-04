import { useEffect, useMemo, useRef, useState } from 'react';
import type { AccountView, OrderStage } from '@garimpo/contracts';
import { cartRequest } from '../cart/client';
import { readableError } from '../account/client';
import { price } from '../catalog/api';
import type { PurchaseRequest } from '../checkout/useFlow';
import { useHistory, emptyFilters } from './useHistory';
import { OrderDetails } from './Details';
import { SupportPanel } from '../aftersales/Panel';
import { statusLabel, methodLabel, dateLabel } from './labels';
import './orders.css';
export default function Orders({ user, query = '' }: { user: AccountView; query?: string }) {
  const id = new URLSearchParams(query).get('id') ?? '', request = useMemo<PurchaseRequest>(() => (path, method, body, signal, key) => cartRequest(user.id, path, method, body, signal, key), [user.id]);
  const flow = useHistory(request, '/me/orders', id, readableError), [draft, setDraft] = useState(emptyFilters), alert = useRef<HTMLParagraphElement>(null);
  useEffect(() => { if (flow.error) alert.current?.focus(); }, [flow.error]);
  return <section className="account-card order-history"><h2>Meus pedidos</h2><p>Compras e etapas registradas na sua conta. Valores e endereço da compra permanecem no histórico.</p>{flow.error ? <p role="alert" tabIndex={-1} ref={alert}>{flow.error}</p> : null}{flow.loading ? <p role="status">Conferindo pedidos…</p> : null}<button type="button" className="secondary" disabled={flow.loading} onClick={() => { void flow.reload(); }}>Atualizar pedidos</button>
    {id ? <><a href="#/orders">Voltar à lista de pedidos</a>{flow.detail ? <><OrderDetails data={flow.detail} busy={flow.loading} paymentPage={flow.setPaymentPage} refundPage={flow.setRefundPage} /><SupportPanel key={user.id + ":" + flow.detail.id} user={user} order={flow.detail} refresh={flow.reload} /><a href="#/payments">Consultar e simular pagamentos</a></> : null}</> : <><form aria-label="Filtrar meus pedidos" onSubmit={e => { e.preventDefault(); flow.apply(draft); }}><label>Estado do pedido<select aria-label="Estado do pedido" value={draft.status} onChange={e => setDraft(v => ({ ...v, status: e.target.value }))}><option value="">Todos</option>{(Object.keys(statusLabel) as OrderStage[]).map(s => <option key={s} value={s}>{statusLabel[s]}</option>)}</select></label><label>Data inicial (São Paulo)<input type="date" value={draft.fromDate} onChange={e => setDraft(v => ({ ...v, fromDate: e.target.value }))} /></label><label>Data final (São Paulo)<input type="date" value={draft.throughDate} onChange={e => setDraft(v => ({ ...v, throughDate: e.target.value }))} /></label><button disabled={flow.loading}>Aplicar filtros de pedidos</button></form>
      {flow.list ? <><p>Página {flow.list.page} de {Math.max(1, flow.list.totalPages)} · {flow.list.total} pedidos.</p>{!flow.list.items.length ? <p>Nenhum pedido para os filtros escolhidos.</p> : flow.list.items.map(row => <article key={row.id}><h3>Pedido {row.id.slice(0, 8)}</h3><p>{statusLabel[row.status]} · {methodLabel[row.method]} · {price(row.totalCents)}</p><p>Criado em {dateLabel(row.createdAt)}.</p><a href={'#/orders?id=' + row.id}>Abrir pedido {row.id.slice(0, 8)}</a></article>)}<button type="button" className="secondary" disabled={flow.loading || flow.page <= 1} onClick={() => flow.setPage(p => p - 1)}>Página anterior de pedidos</button><button type="button" className="secondary" disabled={flow.loading || flow.page >= flow.list!.totalPages} onClick={() => flow.setPage(p => p + 1)}>Próxima página de pedidos</button></> : null}</>}
  </section>;
}
