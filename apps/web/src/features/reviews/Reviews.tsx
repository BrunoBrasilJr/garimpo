import { useEffect, useState } from 'react';
import type { AccountView, PrivateReview, PublicReviewPage, ReviewPage } from '@garimpo/contracts';
import { request, readableError } from '../account/client';
import { readCatalog } from '../catalog/api';
import './reviews.css';

export function ReviewForm({ editionId, orderId, existing, saved }: { editionId: string; orderId?: string; existing?: PrivateReview; saved: () => void }) {
  const [rating, setRating] = useState(existing?.rating ?? 5), [comment, setComment] = useState(existing?.comment ?? ''), [busy, setBusy] = useState(false), [error, setError] = useState('');
  return <form className="review-form" aria-label={existing ? 'Editar sua avaliação' : 'Avaliar esta compra'} onSubmit={event => {
    event.preventDefault(); setBusy(true); setError('');
    const data = { rating, comment, ...(existing ? { revision: existing.version } : { orderId }) };
    void request(existing ? '/me/reviews/' + existing.id : '/editions/' + editionId + '/reviews', existing ? 'PATCH' : 'POST', data)
      .then(saved).catch(cause => setError(readableError(cause))).finally(() => setBusy(false));
  }}><label>Nota<select aria-label="Nota" value={rating} onChange={event => setRating(Number(event.target.value))}>{[1, 2, 3, 4, 5].map(value => <option key={value} value={value}>{value} {value === 1 ? 'estrela' : 'estrelas'}</option>)}</select></label>
    <label>Comentário<textarea aria-label="Comentário" required maxLength={4000} rows={4} value={comment} onChange={event => setComment(event.target.value)} /></label>
    {existing?.visibility === 'HIDDEN' ? <p>Esta avaliação está oculta. Editar mantém o conteúdo oculto até nova análise da equipe.</p> : null}
    {error ? <p role="alert">{error}</p> : null}<button disabled={busy || !existing && !orderId}>{busy ? 'Salvando…' : existing ? 'Salvar avaliação' : 'Publicar avaliação'}</button>
  </form>;
}

export function ReviewSection({ editionId, orderId }: { editionId: string; orderId?: string }) {
  const [data, setData] = useState<PublicReviewPage>(), [mine, setMine] = useState<ReviewPage<PrivateReview>>(), [customer, setCustomer] = useState(false), [page, setPage] = useState(1), [revision, setRevision] = useState(0), [error, setError] = useState(''), [privateError, setPrivateError] = useState('');
  useEffect(() => {
    const controller = new AbortController(); setError('');
    readCatalog<PublicReviewPage>('/editions/' + encodeURIComponent(editionId) + '/reviews?page=' + page, controller.signal).then(value => { if (!controller.signal.aborted) setData(value); }).catch(cause => { if (!controller.signal.aborted) setError(cause instanceof Error ? cause.message : readableError(cause)); });
    return () => controller.abort();
  }, [editionId, page, revision]);
  useEffect(() => {
    const controller = new AbortController(); setMine(undefined); setCustomer(false); setPrivateError('');
    request<AccountView>('/me', 'GET', undefined, true, controller.signal).then(async user => {
      if (controller.signal.aborted || user.context !== 'CUSTOMER') return;
      setCustomer(true); const value = await request<ReviewPage<PrivateReview>>('/me/reviews?editionId=' + editionId + '&page=' + page, 'GET', undefined, true, controller.signal);
      if (!controller.signal.aborted) setMine(value);
    }).catch(cause => { if (!controller.signal.aborted && (!cause || typeof cause !== 'object' || !('status' in cause) || cause.status !== 401)) setPrivateError(readableError(cause)); });
    return () => controller.abort();
  }, [editionId, page, revision]);
  return <section className="review-section" aria-label="Avaliações de compras verificadas"><h2>Avaliações de compras verificadas</h2>
    {error ? <p role="alert">{error}</p> : !data ? <p role="status">Carregando avaliações…</p> : <>
      <p>{data.summary.count ? `${data.summary.average} de 5 · ${data.summary.count} avaliações` : 'Esta edição ainda não tem avaliações publicadas.'}</p>
      {data.items.map(item => <article key={item.id}><h3>{item.authorName} · {item.rating} de 5</h3><p>{item.comment}</p></article>)}
    </>}
    {privateError ? <p role="alert">{privateError}</p> : null}
    {customer ? <><h3>Suas avaliações</h3>{mine?.items.length === 0 ? <p>Depois de receber uma compra, você poderá avaliá-la pelo pedido.</p> : mine?.items.map(item => <article key={item.id}><p>{item.visibility === 'HIDDEN' ? item.awaitingModeration ? 'Oculta, aguardando análise' : 'Oculta pela equipe' : 'Publicada'}</p><ReviewForm key={item.id + item.version} editionId={editionId} existing={item} saved={() => setRevision(value => value + 1)} /></article>)}
      {!mine && !privateError ? <p role="status">Conferindo suas avaliações…</p> : null}
      {orderId && mine && !mine.items.some(item => item.orderId === orderId) ? <ReviewForm key={orderId} editionId={editionId} orderId={orderId} saved={() => setRevision(value => value + 1)} /> : null}
    </> : <p><a href="#/login">Entre com sua conta</a> para consultar suas avaliações.</p>}
    <div className="review-actions"><button className="secondary" disabled={page === 1} onClick={() => setPage(value => value - 1)}>Avaliações anteriores</button><span>Página {page}</span><button className="secondary" disabled={page * 20 >= Math.max(data?.total ?? 0, mine?.total ?? 0)} onClick={() => setPage(value => value + 1)}>Próximas avaliações</button><button className="secondary" onClick={() => setRevision(value => value + 1)}>Atualizar avaliações</button></div>
  </section>;
}
