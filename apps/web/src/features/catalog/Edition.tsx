import { useEffect, useRef, useState } from 'react';
import type { AccountView, CatalogEdition, CatalogImage, CatalogOffer, CatalogTrack } from '@garimpo/contracts';
import { catalogParams, price, readCatalog } from './api';
import { EngagementActions } from '../engagement/Engagement';
import { ReviewSection } from '../reviews/Reviews';
import { AddToCart } from '../cart/Add';

export function Photos({ images }: { images: CatalogImage[] }) {
  return <div className="shop-photos">{images.map(image => <figure key={image.id}><a href={image.url} target="_blank" rel="noopener noreferrer" aria-label={'Ampliar foto: ' + image.description}><img src={image.url} alt={image.description} width={240} height={240} loading="lazy" decoding="async" /></a><figcaption>{image.description}</figcaption></figure>)}</div>;
}
function Preview({ track }: { track: CatalogTrack }) {
  const [failed, setFailed] = useState(false);
  if (!track.audioUrl) return null;
  return <div className="shop-preview"><audio aria-label={'Prévia de ' + track.title} controls preload="none" src={track.audioUrl} onError={() => setFailed(true)} />
    {failed ? <p role="status">Não foi possível reproduzir esta prévia. Os dados da edição continuam disponíveis.</p> : null}
    <a href={track.audioUrl} target="_blank" rel="noopener noreferrer">Abrir prévia de {track.title} em outra aba</a>
  </div>;
}
function Offer({ offer, index, selected, select }: { offer: CatalogOffer; index: number; selected: string; select: (id: string) => void }) {
  return <article className={'shop-offer' + (selected === offer.id ? ' selected' : '')} aria-label={`${offer.kind === 'NEW' ? 'Oferta nova' : 'Exemplar usado'} ${index}`}>
    <h3>{offer.kind === 'NEW' ? 'Novo' : `Usado ${index}`} · {price(offer.priceCents)}</h3><p>{offer.available ? 'Disponível' : 'Esgotado'}</p>
    {offer.kind === 'USED' ? <><dl><dt>Conservação do disco</dt><dd>{offer.discGrade ?? 'Não informada'}</dd><dt>Conservação da capa</dt><dd>{offer.sleeveGrade ?? 'Não informada'}</dd></dl><p>{offer.particulars}</p><Photos images={offer.images} /></> : null}
    <label className="shop-select-offer"><input type="radio" name="selectedOffer" checked={selected === offer.id} disabled={!offer.available} onChange={() => select(offer.id)} />Selecionar {offer.kind === 'NEW' ? 'oferta nova' : 'usado'} {index} por {price(offer.priceCents)}</label>
  </article>;
}
export function Edition({ query, user, ready }: { query: string; user: AccountView | null; ready: boolean }) {
  const params = new URLSearchParams(query), id = params.get('id') ?? '', back = catalogParams(params.get('from') ?? '').toString();
  const [data, setData] = useState<CatalogEdition>(), [error, setError] = useState(''), [retry, setRetry] = useState(0), [selected, setSelected] = useState('');
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    const controller = new AbortController(); setData(undefined); setError(''); setSelected('');
    if (!id) { setError('Esta edição não está disponível.'); return () => controller.abort(); }
    readCatalog<CatalogEdition>('/editions/' + encodeURIComponent(id), controller.signal).then(value => { if (!controller.signal.aborted) setData(value); })
      .catch(cause => { if (!controller.signal.aborted) setError(cause instanceof Error ? cause.message : 'Não foi possível consultar esta edição.'); });
    return () => controller.abort();
  }, [id, retry]);
  useEffect(() => { heading.current?.focus(); }, [data?.id, error]);
  const selectedOffer = data?.offers.find(offer => offer.id === selected);
  return <section className="shop-detail"><a href={'#/catalog' + (back ? '?' + back : '')}>Voltar aos resultados</a>
    {error ? <><h1 ref={heading} tabIndex={-1}>Edição indisponível</h1><p role="alert">{error}</p><button type="button" onClick={() => setRetry(value => value + 1)}>Tentar novamente</button></> : !data ? <p role="status">Carregando edição…</p> : <>
      <p className="eyebrow">{data.format}{data.collectorEdition ? ' · Edição de colecionador' : ''}</p><h1 ref={heading} tabIndex={-1}>{data.title}</h1><p className="shop-artists">{data.artists.map(item => item.name).join(', ')}</p>
      <Photos images={data.images} /><h2>Sobre esta edição</h2><dl className="shop-metadata">
        <dt>Ano original</dt><dd>{data.originalYear ?? 'Não informado'}</dd><dt>Ano desta edição</dt><dd>{data.editionYear ?? 'Não informado'}</dd>
        <dt>Gravadora</dt><dd>{data.label?.name ?? 'Não informada'}</dd><dt>Catálogo</dt><dd>{data.catalogNumber ?? 'Não informado'}</dd>
        <dt>País de prensagem</dt><dd>{data.pressingCountry ?? 'Não informado'}</dd><dt>Peso</dt><dd>{data.weightGrams === null ? 'Não informado' : data.weightGrams + ' g'}</dd>
        <dt>Gêneros</dt><dd>{data.genres.map(item => item.name).join(', ')}</dd><dt>Gênero principal</dt><dd>{data.primaryGenre.name}</dd>
      </dl><h2>Faixas</h2>{!data.tracks.length ? <p>Faixas não informadas.</p> : <ol className="shop-tracks">{data.tracks.map(track => <li key={track.id}><h3>{track.position}. {track.title}</h3>
        <p>{track.artists.length ? track.artists.map(item => item.name).join(', ') : 'Artistas da faixa não informados'}{track.durationSeconds === null ? '' : ` · ${Math.floor(track.durationSeconds / 60)}:${String(track.durationSeconds % 60).padStart(2, '0')}`}</p><Preview track={track} />
      </li>)}</ol>}
      <section aria-labelledby="new-offers"><h2 id="new-offers">Ofertas novas</h2>{!data.offers.some(offer => offer.kind === 'NEW') ? <p>Nenhuma oferta nova cadastrada.</p> : data.offers.filter(offer => offer.kind === 'NEW').map((offer, index) => <Offer key={offer.id} offer={offer} index={index + 1} selected={selected} select={setSelected} />)}</section>
      <section aria-labelledby="used-offers"><h2 id="used-offers">Exemplares usados</h2>{!data.offers.some(offer => offer.kind === 'USED') ? <p>Nenhum exemplar usado cadastrado.</p> : data.offers.filter(offer => offer.kind === 'USED').map((offer, index) => <Offer key={offer.id} offer={offer} index={index + 1} selected={selected} select={setSelected} />)}</section>
      {selectedOffer ? <p role="status">{selectedOffer.kind === 'NEW' ? 'Oferta nova selecionada' : 'Usado selecionado'} · {price(selectedOffer.priceCents)}. Esta seleção não reserva estoque.</p> : null}
      <AddToCart key={(user?.id ?? 'visitor') + ':' + (selectedOffer?.id ?? '')} editionId={data.id} offer={selectedOffer} user={user} ready={ready} />
      <EngagementActions editionId={data.id} />
      <ReviewSection editionId={data.id} />
    </>}
  </section>;
}
