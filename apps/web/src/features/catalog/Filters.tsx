import { useEffect, useId, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import type { CatalogFilters } from '@garimpo/contracts';
import { filterPrice } from './api';

function Choice({ label, name, value, options }: { label: string; name: string; value: string; options: { value: string; label: string }[] }) {
  const id = useId(); return <div className="shop-field"><label htmlFor={id}>{label}</label><select id={id} name={name} defaultValue={value}><option value="">Todos</option>{options.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}</select></div>;
}
export function Filters({ options, params }: { options: CatalogFilters; params: URLSearchParams }) {
  const [error, setError] = useState(''), alert = useRef<HTMLParagraphElement>(null);
  useEffect(() => { if (error) alert.current?.focus(); }, [error]);
  const metadata = (items: { id: string; name: string }[]) => items.map(item => ({ value: item.id, label: item.name }));
  const conditions = options.conditions.map(item => ({ value: item.code, label: item.code }));
  const get = (key: string) => params.get(key) ?? '';
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); const data = new FormData(event.currentTarget), query = new URLSearchParams();
    try {
      for (const [key, value] of data) { const text = String(value).trim(); if (text) query.set(key, key === 'minPrice' || key === 'maxPrice' ? filterPrice(text) : text); }
      query.set('page', '1'); location.hash = '#/catalog?' + query; setError('');
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Confira os filtros.'); }
  }
  return <form aria-label="Buscar e filtrar discos" onSubmit={submit} className="shop-filters">
    <h2>Encontre seu disco</h2>{error ? <p ref={alert} tabIndex={-1} role="alert">{error}</p> : null}
    <label className="shop-field">Título, artista ou faixa<input name="q" type="search" maxLength={200} defaultValue={get('q')} /></label>
    <details><summary>Combinar filtros</summary><div className="shop-filter-grid">
      <Choice label="Artista da edição ou da faixa" name="artist" value={get('artist')} options={metadata(options.artists)} />
      <Choice label="Gênero" name="genre" value={get('genre')} options={metadata(options.genres)} />
      <Choice label="Década desta edição" name="decade" value={get('decade')} options={options.decades.map(year => ({ value: String(year), label: `${year}–${year + 9}` }))} />
      <label className="shop-field">Preço mínimo em reais<input name="minPrice" inputMode="decimal" defaultValue={get('minPrice') ? (Number(get('minPrice')) / 100).toFixed(2).replace('.', ',') : ''} placeholder="0,00" /></label>
      <label className="shop-field">Preço máximo em reais<input name="maxPrice" inputMode="decimal" defaultValue={get('maxPrice') ? (Number(get('maxPrice')) / 100).toFixed(2).replace('.', ',') : ''} placeholder="199,90" /></label>
      <Choice label="Conservação do disco usado" name="discCondition" value={get('discCondition')} options={conditions} />
      <Choice label="Conservação da capa usada" name="sleeveCondition" value={get('sleeveCondition')} options={conditions} />
      <Choice label="Disponibilidade" name="available" value={get('available')} options={[{ value: 'true', label: 'Disponíveis' }, { value: 'false', label: 'Esgotados' }]} />
      <label className="shop-field">Edições por página<input name="pageSize" type="number" min={1} max={100} step={1} required defaultValue={get('pageSize') || '12'} /></label>
    </div><p>A década considera o ano da edição/prensagem. Todos os filtros selecionados são combinados.</p></details>
    <div className="shop-actions"><button type="submit">Buscar discos</button><a href="#/catalog">Limpar filtros</a></div>
  </form>;
}
