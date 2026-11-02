import { useEffect, useRef, useState } from 'react';
import type { CatalogFilters, CatalogPage } from '@garimpo/contracts';
import { catalogParams, price, readCatalog } from './api';
import { Filters } from './Filters';
import { Edition } from './Edition';
import './catalog.css';

export default function Catalog({ mode, query }: { mode: 'catalog' | 'edition'; query: string }) {
  return <div className="shop">{mode === 'edition' ? <Edition query={query} /> : <Search query={query} />}</div>;
}
function Search({ query }: { query: string }) {
  const key = catalogParams(query).toString(), params = new URLSearchParams(key);
  const [options, setOptions] = useState<CatalogFilters>(), [data, setData] = useState<CatalogPage>(), [loading, setLoading] = useState(true), [error, setError] = useState(''), [retry, setRetry] = useState(0);
  const heading = useRef<HTMLHeadingElement>(null), results = useRef<HTMLHeadingElement>(null), initial = useRef(true);
  useEffect(() => { heading.current?.focus(); }, []);
  useEffect(() => {
    const controller = new AbortController();
    readCatalog<CatalogFilters>('/catalog/filters', controller.signal).then(value => { if (!controller.signal.aborted) setOptions(value); })
      .catch(cause => { if (!controller.signal.aborted) setError(cause instanceof Error ? cause.message : 'Não foi possível carregar os filtros.'); });
    return () => controller.abort();
  }, [retry]);
  useEffect(() => {
    const controller = new AbortController(); setLoading(true); setError('');
    readCatalog<CatalogPage>('/editions' + (key ? '?' + key : '?pageSize=12'), controller.signal).then(value => {
      if (!controller.signal.aborted) { setData(value); setLoading(false); }
    }).catch(cause => { if (!controller.signal.aborted) { setError(cause instanceof Error ? cause.message : 'Não foi possível consultar o catálogo.'); setLoading(false); } });
    return () => controller.abort();
  }, [key, retry]);
  useEffect(() => { if (!loading && data) { if (!initial.current) results.current?.focus(); initial.current = false; } }, [loading, data]);
  function page(number: number) { const next = new URLSearchParams(key); next.set('page', String(number)); location.hash = '#/catalog?' + next; }
  return <><p className="eyebrow">DISCOS E DESCOBERTAS</p><h1 ref={heading} tabIndex={-1}>Explore os discos</h1><p>Novos, usados e edições para guardar boas histórias.</p>
    {options ? <Filters key={key} options={options} params={params} /> : null}
    {error ? <div role="alert" className="shop-error"><p>{error}</p><button type="button" onClick={() => setRetry(value => value + 1)}>Tentar novamente</button><a href="#/catalog">Limpar filtros</a></div> : null}
    {loading ? <p role="status">Buscando discos…</p> : data && !error ? <section aria-labelledby="catalog-results"><h2 id="catalog-results" ref={results} tabIndex={-1}>{data.total} {data.total === 1 ? 'edição encontrada' : 'edições encontradas'}</h2>
      {!data.items.length ? <p>Nenhum disco encontrado com estes filtros. Tente outra combinação.</p> : <div className="shop-grid">{data.items.map(item => <article key={item.id} className="shop-card" aria-label={item.title}>
        {item.images[0] ? <img src={item.images[0].url} alt={item.images[0].description} width={280} height={280} loading="lazy" decoding="async" /> : null}
        <p className="eyebrow">{item.format}{item.collectorEdition ? ' · Colecionador' : ''}</p><h3><a href={`#/edition?id=${encodeURIComponent(item.id)}&from=${encodeURIComponent(key)}`}>{item.title}</a></h3><p>{item.artists.map(artist => artist.name).join(', ')}</p>
        <p>Ano desta edição: {item.editionYear ?? 'Não informado'}</p><p>{item.available ? 'Disponível' : 'Esgotado'}{item.minPriceCents === null ? '' : ' · a partir de ' + price(item.minPriceCents)}</p>
      </article>)}</div>}
      <nav className="shop-pagination" aria-label="Páginas do catálogo"><button type="button" disabled={data.page <= 1} onClick={() => page(data.page - 1)}>Página anterior</button><span>Página {data.page} de {Math.max(1, data.totalPages)}</span><button type="button" disabled={data.page >= data.totalPages} onClick={() => page(data.page + 1)}>Próxima página</button></nav>
    </section> : null}
  </>;
}
