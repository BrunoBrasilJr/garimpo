import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import type { AlertView, AvailabilityKind, EngagementPage, WishView } from '@garimpo/contracts';
import type { MobileAccountClient } from '../account/client';
import { errorMessage } from '../account/client';
import { Button, Choice } from '../catalog/Controls';
import { styles as s } from '../catalog/styles';

const conditions = [{ value: 'NEW', label: 'Novo' }, { value: 'USED', label: 'Usado' }, { value: 'ANY', label: 'Novo ou usado' }];
const states = { ACTIVE: 'Ativo', DELIVERED: 'Enviado', CANCELLED: 'Cancelado' };
export function EngagementActions({ editionId, client }: { editionId: string; client: MobileAccountClient }) {
  const [kind, setKind] = useState<AvailabilityKind>('ANY'), [notice, setNotice] = useState(''), [busy, setBusy] = useState(false);
  async function act(alert: boolean) {
    setBusy(true); setNotice('');
    try { await client.request(alert ? '/me/availability-alerts' : '/me/wishlist/' + editionId, alert ? 'POST' : 'PUT', alert ? { editionId, kind } : {});
      setNotice(alert ? 'Alerta ativado para quando esta condição voltar a ficar disponível.' : 'Edição salva nos seus desejos.'); }
    catch (cause) { setNotice(errorMessage(cause)); } finally { setBusy(false); }
  }
  return <View style={s.card}><Text allowFontScaling accessibilityRole="header" style={s.heading}>Para a sua coleção</Text><Text allowFontScaling style={s.text}>Desejos e alertas são independentes. Nenhum deles reserva estoque ou dá prioridade.</Text>
    <Button title="Salvar nos desejos" disabled={busy} onPress={() => { void act(false); }} /><Choice label="Condição do alerta" value={kind} options={conditions} change={value => setKind((value || 'ANY') as AvailabilityKind)} />
    <Button title="Avisar quando voltar" disabled={busy} secondary onPress={() => { void act(true); }} />{notice ? <Text allowFontScaling accessibilityRole="alert" accessibilityLiveRegion="polite" style={s.text}>{notice}</Text> : null}</View>;
}
export function Saved({ client, open }: { client: MobileAccountClient; open: (editionId: string) => void }) {
  const [page, setPage] = useState(1), [revision, setRevision] = useState(0), [wishes, setWishes] = useState<EngagementPage<WishView>>(), [alerts, setAlerts] = useState<EngagementPage<AlertView>>(), [busy, setBusy] = useState(true), [error, setError] = useState('');
  useEffect(() => {
    let active = true; setBusy(true); setError('');
    Promise.all([client.request<EngagementPage<WishView>>('/me/wishlist?page=' + page), client.request<EngagementPage<AlertView>>('/me/availability-alerts?page=' + page)])
      .then(([saved, subscriptions]) => { if (active) { setWishes(saved); setAlerts(subscriptions); } }).catch(cause => { if (active) setError(errorMessage(cause)); }).finally(() => { if (active) setBusy(false); });
    return () => { active = false; };
  }, [client, page, revision]);
  async function remove(path: string) { setBusy(true); try { await client.request(path, 'DELETE'); setRevision(value => value + 1); } catch (cause) { setError(errorMessage(cause)); setBusy(false); } }
  return <View style={s.page}><Text allowFontScaling accessibilityRole="header" style={s.title}>Meus desejos e alertas</Text><Text allowFontScaling style={s.text}>Salvar não ativa alerta nem reserva estoque. O envio bem-sucedido encerra a inscrição.</Text>
    {busy ? <Text allowFontScaling accessibilityLiveRegion="polite" style={s.text}>Atualizando sua lista…</Text> : null}
    {error ? <><Text allowFontScaling accessibilityRole="alert" style={s.alert}>{error}</Text><Button title="Tentar novamente" onPress={() => setRevision(value => value + 1)} /></> : null}
    <Text allowFontScaling accessibilityRole="header" style={s.heading}>Desejos</Text>{wishes?.items.length === 0 ? <Text allowFontScaling style={s.text}>Nenhuma edição salva nesta página.</Text> : wishes?.items.map(item => <View key={item.id} style={s.card}><Text allowFontScaling accessibilityRole="header" style={s.subheading}>{item.edition.title}</Text><Button title={'Ver edição ' + item.edition.title} disabled={!item.edition.active} onPress={() => open(item.edition.id)} /><Button title={'Remover desejo de ' + item.edition.title} disabled={busy} secondary onPress={() => { void remove('/me/wishlist/' + item.edition.id); }} /></View>)}
    <Text allowFontScaling accessibilityRole="header" style={s.heading}>Alertas</Text>{alerts?.items.length === 0 ? <Text allowFontScaling style={s.text}>Nenhum alerta nesta página.</Text> : alerts?.items.map(item => <View key={item.id} style={s.card}><Text allowFontScaling accessibilityRole="header" style={s.subheading}>{item.edition.title}</Text><Text allowFontScaling style={s.text}>{conditions.find(option => option.value === item.kind)?.label} · {states[item.status]}</Text>
      {item.delivery?.status === 'FAILED' ? <Text allowFontScaling style={s.text}>O envio falhou. Sua inscrição continua ativa para nova tentativa.</Text> : null}
      {item.status === 'DELIVERED' ? <Text allowFontScaling style={s.text}>Este alerta foi encerrado. Inscreva-se novamente para um novo aviso.</Text> : null}
      {item.status === 'ACTIVE' ? <Button title={'Cancelar alerta de ' + item.edition.title} secondary disabled={busy} onPress={() => { void remove('/me/availability-alerts/' + item.id); }} /> : null}</View>)}
    <View style={s.actions}><Button title="Página anterior" disabled={busy || page === 1} onPress={() => setPage(value => value - 1)} /><Text allowFontScaling style={s.text}>Página {page}</Text><Button title="Próxima página" disabled={busy || page * 20 >= Math.max(wishes?.total ?? 0, alerts?.total ?? 0)} onPress={() => setPage(value => value + 1)} /></View>
  </View>;
}
