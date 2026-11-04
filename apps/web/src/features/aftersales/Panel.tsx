import { useState } from 'react';
import type { AccountView, OrderDetail } from '@garimpo/contracts';
import type { ReactNode } from 'react';
import { CaseDetails, CustomerCaseActions, Evidence } from './Case';
import { stateLabel } from './labels';
import { useSupport } from './useSupport';
import './support.css';

export interface SupportProps { user: AccountView; order: OrderDetail; refresh: () => Promise<void> }
export function SupportPanel({ user, order, refresh, staffActions }: SupportProps & { staffActions?: (flow: ReturnType<typeof useSupport>) => ReactNode }) {
  const [open, setOpen] = useState(false);
  return <section className="order-support" aria-label="Pós-venda">
    <h3>Pós-venda</h3>
    <button type="button" className="secondary" aria-expanded={open} onClick={() => setOpen(value => !value)}>
      {open ? 'Fechar pós-venda' : 'Abrir pós-venda'}
    </button>
    {open ? <SupportBody user={user} order={order} refresh={refresh} staffActions={staffActions} /> : null}
  </section>;
}

function SupportBody({ user, order, refresh, staffActions }: SupportProps & { staffActions: ((flow: ReturnType<typeof useSupport>) => ReactNode) | undefined }) {
  const internal = user.context === 'STAFF';
  const flow = useSupport(user.id, order.id, internal, refresh);
  const row = flow.row;
  return <>
    {flow.error ? <p role="alert">{flow.error}</p> : null}
    {flow.notice ? <p role="status">{flow.notice}</p> : null}
    <button type="button" className="secondary" disabled={flow.busy} onClick={() => { void flow.reload(); }}>Atualizar atendimentos</button>
    {flow.overview ? <><section aria-label="Atendimentos registrados"><h4>Atendimentos registrados</h4>
      {!flow.overview.returns.length && !flow.overview.exchanges.length ? <p>Nenhum atendimento aberto neste pedido.</p> : null}
      {(['returns', 'exchanges'] as const).flatMap(kind => flow.overview![kind].map(item => <button type="button" className="secondary"
        key={item.id} disabled={flow.busy} aria-pressed={flow.selection?.id === item.id} onClick={() => flow.select({ kind, id: item.id })}>
        {kind === 'returns' ? 'Devolução' : 'Troca'} {item.id.slice(0, 8)} · {stateLabel(item.state)}
      </button>))}
    </section>{!internal ? <OpenRequest order={order} flow={flow} /> : null}</> : <p role="status">Carregando atendimentos…</p>}
    {row ? <div key={row.id}>
      <CaseDetails row={row} />
      {internal ? null : <CustomerCaseActions row={row} flow={flow} />}
      <Evidence accountId={user.id} row={row} flow={flow} internal={internal} />
    </div> : null}
    {staffActions?.(flow)}
  </>;
}

function OpenRequest({ order, flow }: { order: OrderDetail; flow: ReturnType<typeof useSupport> }) {
  const [kind, setKind] = useState<'returns' | 'exchanges' | 'cancel'>('returns');
  const [reason, setReason] = useState('');
  const [counts, setCounts] = useState<Record<string, number>>({});
  const direct = order.status === 'PENDING' || order.status === 'PAID';
  const returns = ['PREPARING', 'SEPARATED', 'DELIVERED'].includes(order.status);
  const exchange = order.status === 'DELIVERED';
  const selected = direct ? 'cancel' : !exchange && kind === 'exchanges' ? 'returns' : kind;
  const groups = flow.overview?.groups ?? [];
  const limits = groups.map(group => ({ group, limit: group.units.filter(unit => unit.available && (order.status !== 'DELIVERED'
    || unit.deliveredAt && Date.parse(order.serverTime) - Date.parse(unit.deliveredAt) < 7 * 86400000)).length }));
  const items = limits.flatMap(({ group, limit }) => (counts[group.orderItemId] ?? 0) > 0 && counts[group.orderItemId]! <= limit
    ? [{ orderItemId: group.orderItemId, quantity: counts[group.orderItemId]! }] : []);
  if (!direct && !returns) return null;
  return <form aria-label="Nova solicitação de pós-venda" onSubmit={event => {
    event.preventDefault();
    if (selected === 'cancel') {
      void flow.update('/orders/' + order.id + '/cancellations', { reason }, true);
    } else {
      void flow.update('/orders/' + order.id + '/' + selected, { reason, items }, true, selected);
    }
  }}>
    <h4>{direct ? 'Cancelar pedido' : 'Solicitar atendimento'}</h4>
    {exchange ? <label>Tipo de solicitação<select value={selected} onChange={event => setKind(event.target.value === 'exchanges' ? 'exchanges' : 'returns')}>
      <option value="returns">Devolução</option><option value="exchanges">Troca</option></select></label> : null}
    {selected !== 'cancel' ? limits.filter(value => value.limit > 0).map(({ group, limit }) => <label key={group.orderItemId}>
      Quantidade de {order.products.find(product => product.offerId === group.offerId)?.title ?? 'unidades'}
      <input type="number" min={0} max={limit} step={1} value={counts[group.orderItemId] ?? 0} onChange={event => setCounts(value => ({
        ...value, [group.orderItemId]: Number(event.target.value)
      }))} />
    </label>) : null}
    <label>Motivo da solicitação<textarea required minLength={3} maxLength={500} value={reason} onChange={event => setReason(event.target.value)} /></label>
    <button disabled={flow.busy || (selected !== 'cancel' && !items.length)}>
      {selected === 'cancel' ? 'Confirmar cancelamento do pedido' : selected === 'returns' ? 'Solicitar devolução' : 'Solicitar troca'}
    </button>
  </form>;
}
