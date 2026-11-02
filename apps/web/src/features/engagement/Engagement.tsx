import { useEffect, useState } from 'react';
import type { AccountView, AlertView, AvailabilityKind, EngagementPage, WishView } from '@garimpo/contracts';
import { ClientError, request, readableError } from '../account/client';
import './engagement.css';

export const conditions: { value: AvailabilityKind; label: string }[] = [{ value: 'NEW', label: 'Novo' }, { value: 'USED', label: 'Usado' }, { value: 'ANY', label: 'Novo ou usado' }];
const states = { ACTIVE: 'Ativo', DELIVERED: 'Enviado', CANCELLED: 'Cancelado' };
export function EngagementActions({ editionId }: { editionId: string }) {
  const [customer, setCustomer] = useState(false), [kind, setKind] = useState<AvailabilityKind>('ANY'), [busy, setBusy] = useState(false), [notice, setNotice] = useState('');
  useEffect(() => { let active = true; request<AccountView>('/me').then(user => { if (active) setCustomer(user.context === 'CUSTOMER'); }).catch(() => {}); return () => { active = false; }; }, []);
  async function act(alert: boolean) {
    setBusy(true); setNotice('');
    try { await request(alert ? '/me/availability-alerts' : '/me/wishlist/' + editionId, alert ? 'POST' : 'PUT', alert ? { editionId, kind } : {});
      setNotice(alert ? 'Alerta ativado. Avisaremos quando esta condição voltar a ficar disponível.' : 'Edição salva nos seus desejos.'); }
    catch (cause) { setNotice(cause instanceof ClientError && cause.code === 'ALERT_ALREADY_ACTIVE' ? 'Você já tem um alerta ativo para esta condição.' : readableError(cause)); }
    finally { setBusy(false); }
  }
  return <section className="account-card engagement-view" aria-label="Guardar edição e acompanhar disponibilidade"><h3>Para a sua coleção</h3>
    <p>Desejos e alertas são independentes. Nenhum deles reserva estoque ou dá prioridade.</p>
    {!customer ? <p><a href="#/login">Entre com sua conta de cliente</a> para salvar desejos e criar alertas.</p> : <>
      <button disabled={busy} onClick={() => { void act(false); }}>Salvar nos desejos</button>
      <label htmlFor="availability-kind">Condição do alerta</label><select id="availability-kind" value={kind} onChange={event => setKind(event.target.value as AvailabilityKind)}>{conditions.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}</select>
      <button className="secondary" disabled={busy} onClick={() => { void act(true); }}>Avisar quando voltar</button><a href="#/saved">Meus desejos e alertas</a>
    </>}{notice ? <p role="status">{notice}</p> : null}</section>;
}
export default function Saved() {
  const [page, setPage] = useState(1), [wishes, setWishes] = useState<EngagementPage<WishView>>(), [alerts, setAlerts] = useState<EngagementPage<AlertView>>(), [error, setError] = useState(''), [busy, setBusy] = useState(false), [revision, setRevision] = useState(0);
  useEffect(() => {
    const controller = new AbortController(); setBusy(true); setError('');
    Promise.all([request<EngagementPage<WishView>>('/me/wishlist?page=' + page, 'GET', undefined, true, controller.signal), request<EngagementPage<AlertView>>('/me/availability-alerts?page=' + page, 'GET', undefined, true, controller.signal)])
      .then(([saved, subscriptions]) => { if (!controller.signal.aborted) { setWishes(saved); setAlerts(subscriptions); } })
      .catch(cause => { if (!controller.signal.aborted) setError(readableError(cause)); }).finally(() => { if (!controller.signal.aborted) setBusy(false); });
    return () => controller.abort();
  }, [page, revision]);
  async function remove(path: string) { setBusy(true); try { await request(path, 'DELETE'); setRevision(value => value + 1); } catch (cause) { setError(readableError(cause)); setBusy(false); } }
  return <section className="account-card engagement-view"><h2>Meus desejos e alertas</h2><p>Salve edições para consultar depois. Alertas precisam de inscrição separada e não reservam estoque.</p>
    {error ? <div role="alert"><p>{error}</p><button onClick={() => setRevision(value => value + 1)}>Tentar novamente</button></div> : null}
    {busy ? <p role="status">Atualizando sua lista…</p> : null}
    <h3>Desejos</h3>{wishes?.items.length === 0 ? <p>Nenhuma edição salva nesta página.</p> : wishes?.items.map(item => <article key={item.id}><h4>{item.edition.title}</h4>{item.edition.active ? <a href={'#/edition?id=' + item.edition.id}>Ver edição</a> : <p>Edição indisponível no catálogo.</p>}<button className="secondary" disabled={busy} onClick={() => { void remove('/me/wishlist/' + item.edition.id); }}>Remover desejo de {item.edition.title}</button></article>)}
    <h3>Alertas</h3>{alerts?.items.length === 0 ? <p>Nenhum alerta nesta página.</p> : alerts?.items.map(item => <article key={item.id}><h4>{item.edition.title}</h4><p>{conditions.find(option => option.value === item.kind)?.label} · {states[item.status]}</p>
      {item.delivery?.status === 'FAILED' ? <p>O envio falhou. Sua inscrição continua ativa para nova tentativa.</p> : null}
      {item.status === 'DELIVERED' ? <p>Este alerta foi encerrado após o envio. Para um novo aviso, inscreva-se novamente na edição.</p> : null}
      {item.status === 'ACTIVE' ? <button className="secondary" disabled={busy} onClick={() => { void remove('/me/availability-alerts/' + item.id); }}>Cancelar alerta de {item.edition.title}</button> : null}</article>)}
    <div className="form-actions"><button disabled={busy || page === 1} onClick={() => setPage(value => value - 1)}>Página anterior</button><span>Página {page}</span><button disabled={busy || page * 20 >= Math.max(wishes?.total ?? 0, alerts?.total ?? 0)} onClick={() => setPage(value => value + 1)}>Próxima página</button></div>
    <a href="#/catalog">Explorar discos</a>
  </section>;
}
