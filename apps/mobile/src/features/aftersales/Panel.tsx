import { useCallback, useEffect, useRef, useState } from 'react';
import { Text, View } from 'react-native';
import { guestTag } from '@garimpo/contracts';
import type { AccountView, AftersalesOverview, ExchangeView, OrderDetail, ReturnView } from '@garimpo/contracts';
import { errorMessage } from '../account/client';
import type { MobileAccountClient } from '../account/client';
import { Button, Choice } from '../catalog/Controls';
import { CartField } from '../cart/Field';
import { money } from '../catalog/client';
import { styles as s } from '../catalog/styles';
import { dateLabel } from '../orders/labels';
import { MobileEvidence } from './Evidence';

type Case = ReturnView | ExchangeView;
type Kind = 'returns' | 'exchanges';
const descriptions: Record<string, string> = {
  REQUESTED: 'Em análise', AWAITING_POSTING: 'Aguardando postagem', IN_TRANSIT: 'Retorno em trânsito',
  AWAITING_REFUND: 'Aguardando autorização do estorno', WAITING_SUBSTITUTE: 'Aguardando substituto',
  REJECTED: 'Recusada', REJECTED_AWAITING_SHIPMENT: 'Aguardando reenvio do original',
  REJECTED_IN_TRANSIT: 'Reenvio em trânsito', REJECTED_DELIVERED: 'Reenvio entregue', COMPLETED: 'Devolução concluída',
  CANCELLED: 'Cancelada', EXPIRED: 'Prazo encerrado', CONVERTED: 'Convertida em devolução',
  SHIPPED: 'Substituto enviado', DELIVERED: 'Substituto entregue', OFFERED: 'Aguardando resposta', ACCEPTED: 'Aceita', RELEASED: 'Reserva liberada'
};
const name = (kind: Kind) => kind === 'returns' ? 'Devolução' : 'Troca';

interface Props { user: AccountView; client: MobileAccountClient; order: OrderDetail; refresh: () => Promise<void> }
export function MobileSupport(props: Props) {
  const [expanded, setExpanded] = useState(false);
  return <View style={s.card}><Text allowFontScaling accessibilityRole="header" style={s.heading}>Pós-venda</Text>
    <Button title={expanded ? 'Fechar pós-venda' : 'Abrir pós-venda'} secondary onPress={() => setExpanded(value => !value)} />
    {expanded ? <SupportBody {...props} /> : null}
  </View>;
}

function SupportBody({ user, client, order, refresh }: Props) {
  const [overview, setOverview] = useState<AftersalesOverview>();
  const [selection, setSelection] = useState<{ id: string; kind: Kind }>();
  const [row, setRow] = useState<Case>();
  const [busy, setBusy] = useState(false), [error, setError] = useState(''), [notice, setNotice] = useState('');
  const [kind, setKind] = useState<Kind>('returns'), [reason, setReason] = useState('');
  const [counts, setCounts] = useState<Record<string, string>>({});
  const mutation = useRef<AbortController | null>(null);
  const intent = useRef<{ path: string; body: string; key: string } | null>(null);
  const overviewPath = '/orders/' + order.id + '/aftersales';
  const casePath = selection ? '/me/' + selection.kind + '/' + selection.id : '';
  const load = useCallback(async (signal?: AbortSignal) => {
    const context = { accountId: user.id, ...(signal ? { signal } : {}) };
    const [current, detail] = await Promise.all([
      client.request<AftersalesOverview>(overviewPath, 'GET', undefined, true, context),
      casePath ? client.request<Case>(casePath, 'GET', undefined, true, context) : Promise.resolve(undefined)
    ]);
    if (!signal?.aborted) { setOverview(current); setRow(detail); }
  }, [client, user.id, overviewPath, casePath]);
  useEffect(() => {
    const controller = new AbortController();
    void load(controller.signal).catch(cause => { if (!controller.signal.aborted) setError(errorMessage(cause)); });
    return () => controller.abort();
  }, [load]);
  useEffect(() => () => mutation.current?.abort(), []);

  async function update(path: string, data: unknown, requireKey = false, next?: Kind) {
    if (mutation.current) return;
    const controller = new AbortController(); mutation.current = controller;
    setBusy(true); setError(''); setNotice('');
    if (requireKey) {
      const body = JSON.stringify(data);
      if (intent.current?.path !== path || intent.current.body !== body) intent.current = { path, body, key: 'support.' + guestTag() };
    }
    try {
      const result = await client.request<Case>(path, 'POST', data, true, {
        accountId: user.id, signal: controller.signal, ...(requireKey && intent.current ? { idempotencyKey: intent.current.key } : {})
      });
      if (controller.signal.aborted) return;
      intent.current = null;
      if (next) { setRow(result); setSelection({ kind: next, id: result.id }); }
      await Promise.all([refresh(), next ? Promise.resolve() : load(controller.signal)]);
      if (!controller.signal.aborted) setNotice('Alteração registrada.');
    } catch (cause) { if (!controller.signal.aborted) setError(errorMessage(cause)); }
    finally { mutation.current = null; if (!controller.signal.aborted) setBusy(false); }
  }

  const direct = order.status === 'PENDING' || order.status === 'PAID';
  const delivered = order.status === 'DELIVERED';
  const allowed = direct || delivered || order.status === 'PREPARING' || order.status === 'SEPARATED';
  const selectionKind = delivered ? kind : 'returns';
  const groups = (overview?.groups ?? []).map(group => ({
    ...group, count: group.units.filter(unit => unit.available && (!delivered || unit.deliveredAt && Date.parse(order.serverTime) - Date.parse(unit.deliveredAt) < 7 * 86400000)).length
  })).filter(group => group.count > 0);
  const items = groups.flatMap(group => {
    const quantity = Number(counts[group.orderItemId] ?? 0);
    return Number.isInteger(quantity) && quantity > 0 && quantity <= group.count ? [{ orderItemId: group.orderItemId, quantity }] : [];
  });
  return <View style={s.page}>
    {error ? <Text allowFontScaling accessibilityRole="alert" style={s.alert}>{error}</Text> : null}
    {notice ? <Text allowFontScaling accessibilityLiveRegion="polite" style={s.text}>{notice}</Text> : null}
    <Button title="Atualizar atendimentos" secondary disabled={busy} onPress={() => {
      setError(''); void load().catch(cause => setError(errorMessage(cause)));
    }} />
    {!overview ? <Text allowFontScaling style={s.text}>Carregando atendimentos…</Text> : <>
      <Text allowFontScaling accessibilityRole="header" style={s.heading}>Atendimentos registrados</Text>
      {!overview.returns.length && !overview.exchanges.length ? <Text allowFontScaling style={s.text}>Nenhum atendimento neste pedido.</Text> : null}
      {(['returns', 'exchanges'] as const).flatMap(value => overview[value].map(item => <Button key={item.id}
        title={name(value) + ' ' + item.id.slice(0, 8) + ' · ' + (descriptions[item.state] ?? item.state)} secondary disabled={busy}
        onPress={() => { if (selection?.id !== item.id) { setRow(undefined); setSelection({ id: item.id, kind: value }); setError(''); } }} />))}
      {allowed ? <View style={s.card}>
        <Text allowFontScaling accessibilityRole="header" style={s.heading}>{direct ? 'Cancelar pedido' : 'Solicitar atendimento'}</Text>
        {delivered ? <Choice label="Tipo de solicitação" value={kind} options={[{ value: 'returns', label: 'Devolução' }, { value: 'exchanges', label: 'Troca' }]}
          clearable={false} change={value => setKind(value === 'exchanges' ? 'exchanges' : 'returns')} /> : null}
        {!direct ? groups.map(group => <CartField key={group.orderItemId} label={'Quantidade de ' + (order.products.find(product => product.offerId === group.offerId)?.title ?? 'unidades')}
          value={counts[group.orderItemId] ?? ''} change={value => setCounts(current => ({ ...current, [group.orderItemId]: value }))}
          numeric maxLength={4} disabled={busy} />) : null}
        <CartField label="Motivo da solicitação" value={reason} maxLength={500} change={setReason} disabled={busy} />
        <Button title={direct ? 'Confirmar cancelamento do pedido' : selectionKind === 'returns' ? 'Solicitar devolução' : 'Solicitar troca'}
          disabled={busy || reason.trim().length < 3 || (!direct && !items.length)} onPress={() => {
            if (direct) void update('/orders/' + order.id + '/cancellations', { reason }, true);
            else void update('/orders/' + order.id + '/' + selectionKind, { reason, items }, true, selectionKind);
          }} />
      </View> : null}
    </>}
    {row ? <View key={row.id} style={s.card}>
      <CaseActions row={row} busy={busy} update={update} />
      <MobileEvidence client={client} accountId={user.id} id={row.id} evidence={row.evidence} reload={load} />
    </View> : null}
  </View>;
}

function CaseActions({ row, busy, update }: { row: Case; busy: boolean; update: (path: string, body: unknown) => Promise<void> }) {
  const [tracking, setTracking] = useState(''), [when, setWhen] = useState(''), [reason, setReason] = useState('');
  const returns = 'refund' in row;
  const prefix = '/' + (returns ? 'returns' : 'exchanges') + '/' + row.id;
  const posted = new Date(when);
  const convertible = !returns && ['REQUESTED', 'AWAITING_POSTING', 'IN_TRANSIT', 'WAITING_SUBSTITUTE'].includes(row.state)
    && !row.substitutes.some(value => value.state === 'OFFERED' || value.state === 'ACCEPTED');
  return <>
    <Text allowFontScaling accessibilityRole="header" style={s.heading}>{returns ? 'Devolução' : 'Troca'} {row.id.slice(0, 8)}</Text>
    <Text allowFontScaling accessibilityLiveRegion="polite" style={s.text}>{descriptions[row.state] ?? row.state}</Text>
    <Text allowFontScaling style={s.text}>{row.reason} · {row.items.length} unidade(s)</Text>
    {row.postingDueAt ? <Text allowFontScaling style={s.text}>Prazo de postagem {dateLabel(row.postingDueAt)}</Text> : null}
    {!returns && row.waitingDueAt ? <Text allowFontScaling style={s.text}>Prazo da espera {dateLabel(row.waitingDueAt)}</Text> : null}
    {row.shipments.map(shipment => <Text key={shipment.id} allowFontScaling style={s.text}>{shipment.kind.includes('REJECTED') ? 'Reenvio do original' : shipment.kind.includes('REPLACEMENT') ? 'Envio do substituto' : 'Retorno'} · {shipment.trackingCode} · postagem {dateLabel(shipment.postedAt)}
      {shipment.deliveredAt ? ' · entrega ' + dateLabel(shipment.deliveredAt) : ''}</Text>)}
    {returns && row.refund ? <Text allowFontScaling style={s.text}>Estorno {row.refund.status === 'FAILED' ? 'com falha, aguardando nova tentativa' : row.refund.status === 'PENDING' ? 'pendente' : 'concluído'} · produtos {money(row.refund.productCents)} · frete {money(row.refund.shippingCents)}</Text> : null}
    {row.state === 'AWAITING_POSTING' ? <>
      <CartField label="Código de rastreamento do retorno" value={tracking} change={setTracking} maxLength={120} disabled={busy} />
      <CartField label="Postagem efetiva (AAAA-MM-DD HH:mm)" value={when} change={setWhen} maxLength={19} disabled={busy} />
      <Button title="Informar postagem" disabled={busy || !tracking.trim() || !Number.isFinite(posted.getTime())}
        onPress={() => { void update(prefix + '/posting', { version: row.version, trackingCode: tracking, postedAt: posted.toISOString() }); }} />
    </> : null}
    {!returns ? row.substitutes.map(offer => <View key={offer.id} style={s.card}>
      <Text allowFontScaling style={s.text}>{offer.equivalenceReason} · {descriptions[offer.state] ?? offer.state} · prazo {dateLabel(offer.expiresAt)}</Text>
      {offer.state === 'OFFERED' ? (['ACCEPT', 'REJECT'] as const).map(decision => <Button key={decision}
        title={decision === 'ACCEPT' ? 'Aceitar substituto' : 'Recusar substituto'} disabled={busy}
        onPress={() => { void update(prefix + '/substitute-offers/' + offer.id + '/response', { version: row.version, decision }); }} />) : null}
    </View>) : null}
    {convertible ? <>
      <CartField label="Motivo da conversão" value={reason} change={setReason} maxLength={500} disabled={busy} />
      <Button title="Converter em devolução" disabled={busy || reason.trim().length < 3}
        onPress={() => { void update(prefix + '/convert-to-return', { version: row.version, reason }); }} />
    </> : null}
  </>;
}
