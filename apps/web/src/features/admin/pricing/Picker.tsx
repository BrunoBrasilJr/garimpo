import { useEffect, useState } from 'react';
import type { CatalogMetadata, CatalogPage, NamedPricingTarget, PricingTarget } from '@garimpo/contracts';
import { request, readableError } from '../../account/client';
export function TargetPicker({ offersOnly = false, selected, change }: { offersOnly?: boolean; selected: NamedPricingTarget[]; change: (items: NamedPricingTarget[]) => void }) {
  const [kind, setKind] = useState<PricingTarget['kind']>('OFFER'), [search, setSearch] = useState(''), [page, setPage] = useState(1), [options, setOptions] = useState<NamedPricingTarget[]>([]), [hasMore, setHasMore] = useState(false), [choice, setChoice] = useState(''), [busy, setBusy] = useState(false), [error, setError] = useState('');
  useEffect(() => {
    const controller = new AbortController(); setBusy(true); setError(''); setChoice('');
    const timer = setTimeout(() => {
      void (async () => {
        if (kind === 'GENRE') {
          const value = await request<{ items: CatalogMetadata[] }>('/admin/catalog-metadata?type=genre', 'GET', undefined, true, controller.signal);
          const rows = value.items.filter(item => item.name.toLocaleLowerCase('pt-BR').includes(search.toLocaleLowerCase('pt-BR')));
          if (!controller.signal.aborted) { setOptions(rows.slice((page - 1) * 20, page * 20).map(item => ({ kind, id: item.id, label: item.name }))); setHasMore(page * 20 < rows.length); }
        } else {
          const value = await request<CatalogPage>('/admin/editions?pageSize=20&page=' + page + (search ? '&q=' + encodeURIComponent(search) : ''), 'GET', undefined, true, controller.signal);
          const rows: NamedPricingTarget[] = kind === 'EDITION' ? value.items.map(item => ({ kind, id: item.id, label: item.title })) : value.items.flatMap(edition => edition.offers.map(offer => ({ kind, id: offer.id, label: `${edition.title} · ${offer.kind === 'NEW' ? 'novo' : 'usado'} · ref. ${offer.id.slice(0, 8)}${edition.active && offer.active ? '' : ' · inativo'}` })));
          if (!controller.signal.aborted) { setOptions(rows); setHasMore(page < value.totalPages); }
        }
      })().catch(cause => { if (!controller.signal.aborted) setError(readableError(cause)); }).finally(() => { if (!controller.signal.aborted) setBusy(false); });
    }, 200);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [kind, search, page]);
  return <fieldset className="pricing-picker"><legend>{offersOnly ? 'Ofertas da promoção' : 'Alvos do cupom'}</legend>
    {!offersOnly ? <label>Tipo de alvo<select aria-label="Tipo de alvo" value={kind} onChange={event => { setKind(event.target.value as PricingTarget['kind']); setSearch(''); setPage(1); }}><option value="OFFER">Oferta individual</option><option value="EDITION">Edição</option><option value="GENRE">Gênero</option></select></label> : null}
    <label>Buscar alvo<input aria-label="Buscar alvo" value={search} onChange={event => { setSearch(event.target.value); setPage(1); }} placeholder={kind === 'GENRE' ? 'Nome do gênero' : 'Título ou artista'} /></label>
    <label>Selecionar alvo<select aria-label="Selecionar alvo" value={choice} disabled={busy} onChange={event => setChoice(event.target.value)}><option value="">{busy ? 'Carregando opções…' : 'Escolha um alvo'}</option>{options.map(item => <option key={item.kind + item.id} value={item.id}>{item.label}</option>)}</select></label>
    <div className="pricing-actions"><button type="button" className="secondary" disabled={busy || !choice || selected.some(item => item.kind === kind && item.id === choice)} onClick={() => { const item = options.find(item => item.id === choice); if (item) change([...selected, item]); setChoice(''); }}>Adicionar alvo</button><button type="button" className="secondary" disabled={busy || page === 1} onClick={() => setPage(value => value - 1)}>Opções anteriores</button><button type="button" className="secondary" disabled={busy || !hasMore} onClick={() => setPage(value => value + 1)}>Mais opções</button></div>
    {error ? <p role="alert">{error}</p> : null}{!selected.length ? <p>{offersOnly ? 'Selecione ao menos uma oferta.' : 'Sem alvos selecionados, o cupom cobre todas as ofertas elegíveis.'}</p> : <ul>{selected.map(item => <li key={item.kind + item.id}>{item.label}<button type="button" className="secondary" onClick={() => change(selected.filter(value => value.kind !== item.kind || value.id !== item.id))}>Remover alvo {item.label}</button></li>)}</ul>}
    {!offersOnly ? <p>Basta corresponder a um dos alvos selecionados. As regras de itens promocionais e de valor mínimo continuam valendo.</p> : null}
  </fieldset>;
}
