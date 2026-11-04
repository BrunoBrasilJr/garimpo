import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import type { CatalogEdition, OrderDetail } from '@garimpo/contracts';
import { readableError, request } from '../../account/client';
import { SupportPanel } from '../../aftersales/Panel';
import type { SupportProps } from '../../aftersales/Panel';
import { isReturn } from '../../aftersales/useSupport';
import type { SupportCase, useSupport } from '../../aftersales/useSupport';

type Flow = ReturnType<typeof useSupport>;
type Kind = 'approve' | 'reject' | 'posting' | 'receipt' | 'refund' | 'extension' | 'exception' | 'rejected-shipment'
  | 'rejected-delivery' | 'offer' | 'accept' | 'decline' | 'shipment' | 'delivery' | 'convert' | 'cancel';
const labels: Record<Kind, string> = {
  approve: 'Aprovar solicitação', reject: 'Recusar solicitação', posting: 'Registrar postagem informada por e-mail',
  receipt: 'Registrar inspeção', refund: 'Autorizar estorno', extension: 'Prorrogar prazo de postagem',
  exception: 'Autorizar exceção de inspeção', 'rejected-shipment': 'Registrar reenvio do original', 'rejected-delivery': 'Confirmar entrega do reenvio',
  offer: 'Ofertar substituto', accept: 'Registrar aceite informado por e-mail', decline: 'Registrar recusa informada por e-mail',
  shipment: 'Registrar envio do substituto', delivery: 'Confirmar entrega do substituto', convert: 'Converter em devolução', cancel: 'Cancelar troca'
};

function actions(row: SupportCase, admin: boolean): Kind[] {
  const result: Kind[] = [];
  if (row.state === 'REQUESTED') result.push('approve', 'reject');
  if (row.state === 'AWAITING_POSTING') result.push('posting');
  if (row.state === 'IN_TRANSIT') result.push('receipt');
  if (admin && row.state === 'AWAITING_REFUND') result.push('refund');
  if (admin && ['AWAITING_POSTING', 'EXPIRED'].includes(row.state)) result.push('extension');
  if (row.items.some(item => item.inspection === 'REJECTED')) {
    const reship = row.shipments.find(item => item.kind.includes('REJECTED'));
    if (!reship) {
      result.push('rejected-shipment');
      if (admin && ['REJECTED_AWAITING_SHIPMENT', 'AWAITING_REFUND', 'WAITING_SUBSTITUTE'].includes(row.state)) result.push('exception');
    } else if (!reship.deliveredAt) result.push('rejected-delivery');
  }
  if (!isReturn(row)) {
    const active = row.substitutes.some(item => item.state === 'OFFERED' || item.state === 'ACCEPTED');
    if (['AWAITING_POSTING', 'IN_TRANSIT', 'WAITING_SUBSTITUTE'].includes(row.state)) result.push('offer');
    if (row.substitutes.some(item => item.state === 'OFFERED')) result.push('accept', 'decline');
    if (row.state === 'WAITING_SUBSTITUTE') result.push('shipment');
    if (row.state === 'SHIPPED') result.push('delivery');
    if (['REQUESTED', 'AWAITING_POSTING'].includes(row.state)) result.push('cancel');
    if (!active && ['REQUESTED', 'AWAITING_POSTING', 'IN_TRANSIT', 'WAITING_SUBSTITUTE'].includes(row.state)) result.push('convert');
  }
  return result;
}

export function AdminSupport(props: SupportProps) {
  if (props.user.context !== 'STAFF') return null;
  const admin = props.user.role === 'ADMIN';
  return <SupportPanel {...props} staffActions={flow => <>
    {props.order.customer?.blocked || props.order.customer?.closed ? <p>Conta indisponível. Registre o contato externo efetivo para informar postagem ou resposta da oferta.</p> : null}
    {flow.row ? <CaseOperations key={flow.row.id + ':' + flow.row.version} flow={flow} row={flow.row} admin={admin} accountId={props.user.id} /> : null}
    <OrderOperations key={props.order.id + ':' + props.order.version} order={props.order} flow={flow} admin={admin} />
  </>} />;
}

function OrderOperations({ order, flow, admin }: { order: OrderDetail; flow: Flow; admin: boolean }) {
  const [units, setUnits] = useState<string[]>([]);
  const [reason, setReason] = useState('');
  const [reasons, setReasons] = useState<Record<string, string>>({});
  const available = order.unitStates.filter(item => item.commercialState === 'KEPT');
  return <>
    {['PENDING', 'PAID', 'PREPARING', 'SEPARATED'].includes(order.status) && available.length ? <form aria-label="Registrar unidades indisponíveis" onSubmit={event => {
      event.preventDefault(); void flow.update('/admin/orders/' + order.id + '/unavailable-units', { version: order.version, unitIds: units, reason }, true);
    }}>
      <h4>Registrar unidades indisponíveis</h4>
      {available.map(item => <label key={item.id}>
        <input type="checkbox" checked={units.includes(item.id)} onChange={event => setUnits(current => event.target.checked ? [...current, item.id] : current.filter(id => id !== item.id))} />
        {order.products.find(product => product.offerId === item.offerId)?.title ?? 'Unidade'} · {item.id.slice(0, 8)}
      </label>)}
      <label>Motivo da indisponibilidade<input required minLength={3} maxLength={500} value={reason} onChange={event => setReason(event.target.value)} /></label>
      <button disabled={flow.busy || !units.length}>Confirmar indisponibilidade</button>
    </form> : null}
    {admin ? order.refunds.items.filter(item => item.status === 'FAILED' || item.status === 'PENDING').map(item => <form key={item.id} aria-label={'Repetir estorno ' + item.id.slice(0, 8)}
      onSubmit={event => { event.preventDefault(); void flow.update('/admin/refunds/' + item.id + '/retry', { reason: reasons[item.id] ?? '' }, true); }}>
      <label>Motivo da nova tentativa de estorno {item.id.slice(0, 8)}<input required minLength={3} maxLength={500} value={reasons[item.id] ?? ''}
        onChange={event => setReasons(previous => ({ ...previous, [item.id]: event.target.value }))} /></label>
      <button disabled={flow.busy}>Repetir estorno {item.id.slice(0, 8)}</button>
    </form>) : null}
  </>;
}

function CaseOperations({ row, flow, admin, accountId }: { row: SupportCase; flow: Flow; admin: boolean; accountId: string }) {
  const [selection, setSelection] = useState<Kind | ''>('');
  const allowed = actions(row, admin);
  if (!allowed.length) return null;
  const active = selection && allowed.includes(selection) ? selection : '';
  return <section aria-label="Operações da equipe"><h4>Operações da equipe</h4>
    <label>Operação do atendimento<select value={active} onChange={event => setSelection(event.target.value as Kind | '')}>
      <option value="">Escolha uma operação</option>
      {allowed.map(kind => <option key={kind} value={kind}>{labels[kind]}</option>)}
    </select></label>
    {active ? <CommandForm key={active} row={row} flow={flow} kind={active} accountId={accountId} /> : null}
  </section>;
}

function CommandForm({ row, flow, kind, accountId }: { row: SupportCase; flow: Flow; kind: Kind; accountId: string }) {
  const [reason, setReason] = useState(''), [tracking, setTracking] = useState(''), [when, setWhen] = useState('');
  const [reference, setReference] = useState(''), [interactionTime, setInteractionTime] = useState('');
  const [inspections, setInspections] = useState<Record<string, string>>({});
  const [substitute, setSubstitute] = useState(''), [scenario, setScenario] = useState('SUCCEEDED');
  const [unitId, setUnitId] = useState(''), [offerId, setOfferId] = useState('');
  const [offers, setOffers] = useState<CatalogEdition['offers']>([]);
  const [error, setError] = useState('');
  const returns = isReturn(row);
  const exchange = returns ? null : row;
  const candidate = exchange?.items.find(item => item.id === unitId);
  const edition = kind === 'offer' ? candidate?.editionId : undefined;
  useEffect(() => {
    if (!edition) return;
    const controller = new AbortController();
    void request<CatalogEdition>('/admin/editions/' + edition, 'GET', undefined, true, controller.signal, { accountId })
      .then(value => { if (!controller.signal.aborted) setOffers(value.offers.filter(offer => offer.active && offer.stockOnHand > 0)); })
      .catch(cause => { if (!controller.signal.aborted) setError(readableError(cause)); });
    return () => controller.abort();
  }, [accountId, edition]);
  const hasDate = ['posting', 'receipt', 'extension', 'rejected-shipment', 'rejected-delivery', 'shipment', 'delivery'].includes(kind);
  const hasTracking = ['posting', 'rejected-shipment', 'shipment'].includes(kind);
  const hasReason = ['approve', 'reject', 'receipt', 'refund', 'extension', 'exception', 'offer', 'convert', 'cancel'].includes(kind);
  const hasInteraction = ['posting', 'accept', 'decline'].includes(kind);
  const prefix = '/admin/' + (returns ? 'returns/' : 'exchanges/') + row.id;
  const shared = '/admin/aftersales/' + row.id;
  const buyerPath = '/' + (returns ? 'returns/' : 'exchanges/') + row.id;
  const version = row.version;
  const eligible = row.items.filter(unit => !('active' in unit) || unit.active);
  const inspectionUnits = eligible.map(unit => ({ id: unit.id, result: inspections[unit.id] ?? '' }));
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const at = when ? new Date(when).toISOString() : '';
    const interaction = hasInteraction ? { channel: 'EMAIL', reference, occurredAt: new Date(interactionTime).toISOString() } : undefined;
    switch (kind) {
      case 'approve': case 'reject': void flow.update(prefix + '/decision', { version, reason, decision: kind === 'approve' ? 'APPROVE' : 'REJECT' }); break;
      case 'posting': void flow.update(buyerPath + '/posting', { version, trackingCode: tracking, postedAt: at, interaction }); break;
      case 'receipt': void flow.update(prefix + '/receipt', { version, reason, receivedAt: at, units: inspectionUnits }); break;
      case 'refund': void flow.update(prefix + '/refund-authorization', {
        version, reason, scenario, unitIds: row.items.filter(unit => unit.inspection !== 'REJECTED').map(unit => unit.id)
      }, true); break;
      case 'extension': void flow.update(shared + '/posting-extension', { version, reason, dueAt: at }); break;
      case 'exception': void flow.update(shared + '/inspection-exception', { version, reason, decision: 'APPROVE_UNFIT' }); break;
      case 'rejected-shipment': void flow.update(shared + '/rejected-shipment', { version, trackingCode: tracking, postedAt: at }); break;
      case 'rejected-delivery': void flow.update(shared + '/rejected-delivery', { version, deliveredAt: at }); break;
      case 'offer': void flow.update(prefix + '/substitute-offers', { version, unitId, offerId, equivalenceReason: reason }); break;
      case 'accept': case 'decline': void flow.update(buyerPath + '/substitute-offers/' + substitute + '/response',
        { version, decision: kind === 'accept' ? 'ACCEPT' : 'REJECT', interaction }); break;
      case 'shipment': void flow.update(prefix + '/shipment', { version, trackingCode: tracking, postedAt: at }); break;
      case 'delivery': void flow.update(prefix + '/delivery', { version, deliveredAt: at }); break;
      case 'convert': void flow.update(buyerPath + '/convert-to-return', { version, reason }); break;
      case 'cancel': void flow.update(prefix + '/cancel', { version, reason }, true); break;
    }
  }
  return <form aria-label={labels[kind]} onSubmit={submit}>
    {error ? <p role="alert">{error}</p> : null}
    {hasReason ? <label>{kind === 'offer' ? 'Justificativa de equivalência' : 'Justificativa da operação'}<textarea value={reason} required minLength={3} maxLength={500} onChange={event => setReason(event.target.value)} /></label> : null}
    {hasTracking ? <label>Código de rastreamento<input required value={tracking} maxLength={120} onChange={event => setTracking(event.target.value)} /></label> : null}
    {hasDate ? <label>{kind === 'extension' ? 'Novo prazo de postagem' : 'Data e hora efetivas'}<input required type="datetime-local" step="0.001" value={when} onChange={event => setWhen(event.target.value)} /></label> : null}
    {hasInteraction ? <>
      <label>Referência do contato por e-mail<input required minLength={3} maxLength={500} value={reference} onChange={event => setReference(event.target.value)} /></label>
      <label>Data e hora do contato por e-mail<input required type="datetime-local" step="0.001" value={interactionTime} onChange={event => setInteractionTime(event.target.value)} /></label>
    </> : null}
    {kind === 'receipt' ? eligible.map(unit => <label key={unit.id}>Inspeção da unidade {unit.id.slice(0, 8)}
      <select required value={inspections[unit.id] ?? ''} onChange={event => setInspections(previous => ({ ...previous, [unit.id]: event.target.value }))}>
        <option value="">Escolher resultado</option><option value="FIT">Apta para estoque</option><option value="UNFIT">Aceita sem reposição</option><option value="REJECTED">Rejeitada</option>
      </select>
    </label>) : null}
    {kind === 'refund' ? <label>Resultado no simulador<select value={scenario} onChange={event => setScenario(event.target.value)}>
      <option value="SUCCEEDED">Sucesso</option><option value="FAILED">Falha</option></select></label> : null}
    {kind === 'offer' ? <>
      <label>Unidade a substituir<select required value={unitId} onChange={event => { setUnitId(event.target.value); setOfferId(''); setOffers([]); }}>
        <option value="">Selecione uma unidade</option>{eligible.map(unit => <option key={unit.id} value={unit.id}>{unit.id.slice(0, 8)}</option>)}</select></label>
      <label>Oferta da mesma edição<select required value={offerId} onChange={event => setOfferId(event.target.value)}>
        <option value="">Selecione uma oferta</option>{offers.map(offer => <option key={offer.id} value={offer.id}>{offer.kind === 'NEW' ? 'Nova' : 'Usada · ' + offer.discGrade} · {offer.id.slice(0, 8)}</option>)}</select></label>
    </> : null}
    {kind === 'accept' || kind === 'decline' ? <label>Oferta do contato<select required value={substitute} onChange={event => setSubstitute(event.target.value)}>
      <option value="">Selecione a oferta</option>{exchange?.substitutes.filter(item => item.state === 'OFFERED').map(item => <option key={item.id} value={item.id}>{item.id.slice(0, 8)} · {item.equivalenceReason}</option>)}</select></label> : null}
    <button disabled={flow.busy}>{labels[kind]}</button>
  </form>;
}
