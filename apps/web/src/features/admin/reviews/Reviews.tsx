import { useEffect, useState } from 'react';
import type { PrivateReview, ReviewPage, ReviewRevisionView } from '@garimpo/contracts';
import { request, readableError } from '../../account/client';
import '../../reviews/reviews.css';
export default function ReviewModeration() {
  const [page, setPage] = useState(1), [visibility, setVisibility] = useState(''), [revision, setRevision] = useState(0), [data, setData] = useState<ReviewPage<PrivateReview>>(), [error, setError] = useState(''), [history, setHistory] = useState<{ id: string; items: ReviewRevisionView[] }>();
  useEffect(() => {
    const controller = new AbortController(); setError('');
    request<ReviewPage<PrivateReview>>('/admin/reviews?page=' + page + (visibility ? '&visibility=' + visibility : ''), 'GET', undefined, true, controller.signal).then(value => { if (!controller.signal.aborted) setData(value); }).catch(cause => { if (!controller.signal.aborted) setError(readableError(cause)); });
    return () => controller.abort();
  }, [page, visibility, revision]);
  async function inspect(id: string) { try { const value = await request<{ items: ReviewRevisionView[] }>('/admin/reviews/' + id + '/history'); setHistory({ id, items: value.items }); } catch (cause) { setError(readableError(cause)); } }
  return <section className="account-card review-section"><h2>Moderar avaliações</h2><label>Visibilidade<select aria-label="Visibilidade" value={visibility} onChange={event => { setVisibility(event.target.value); setPage(1); }}>{[['', 'Todas'], ['PUBLIC', 'Publicadas'], ['HIDDEN', 'Ocultas']].map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
    {error ? <p role="alert">{error}</p> : null}{!data ? <p role="status">Carregando avaliações…</p> : !data.items.length ? <p>Nenhuma avaliação nesta página.</p> : data.items.map(item => <article key={item.id}><h3>{item.editionTitle}</h3><p>{item.authorName} · {item.rating} de 5 · revisão {item.version}</p><p>{item.comment}</p><p>{item.visibility === 'HIDDEN' ? item.awaitingModeration ? 'Oculta, aguardando análise' : 'Oculta' : 'Publicada'}</p>{item.hiddenReason ? <p>Motivo: {item.hiddenReason}</p> : null}
      <ModerationForm key={item.id + item.version} item={item} changed={() => { setHistory(undefined); setRevision(value => value + 1); }} />
      <button className="secondary" onClick={() => { void inspect(item.id); }}>Ver histórico de {item.editionTitle}</button>
      {history?.id === item.id ? <ol>{history.items.map(entry => <li key={entry.version}>Revisão {entry.version} · {entry.action} · {entry.actorName}<p>{entry.rating} de 5 · {entry.comment}</p><p>{entry.reason}</p></li>)}</ol> : null}
    </article>)}
    <div className="review-actions"><button disabled={page === 1} onClick={() => setPage(value => value - 1)}>Página anterior</button><span>Página {page}</span><button disabled={page * 20 >= (data?.total ?? 0)} onClick={() => setPage(value => value + 1)}>Próxima página</button><button className="secondary" onClick={() => setRevision(value => value + 1)}>Atualizar lista</button></div>
  </section>;
}
function ModerationForm({ item, changed }: { item: PrivateReview; changed: () => void }) {
  const [reason, setReason] = useState(''), [busy, setBusy] = useState(false), [error, setError] = useState('');
  return <form aria-label={'Moderar avaliação de ' + item.authorName} className="review-form" onSubmit={event => {
    event.preventDefault(); setBusy(true); setError('');
    void request('/admin/reviews/' + item.id + '/' + (item.visibility === 'HIDDEN' ? 'release' : 'hide'), 'POST', { revision: item.version, reason })
      .then(changed).catch(cause => setError(readableError(cause))).finally(() => setBusy(false));
  }}><label>Motivo<textarea aria-label="Motivo" required maxLength={500} rows={3} value={reason} onChange={event => setReason(event.target.value)} /></label>{error ? <p role="alert">{error}</p> : null}<button disabled={busy}>{busy ? 'Salvando…' : item.visibility === 'HIDDEN' ? 'Liberar revisão atual' : 'Ocultar avaliação'}</button></form>;
}
