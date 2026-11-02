import { useEffect, useRef, useState } from 'react';
import type { CatalogEdition, CatalogMetadata, CatalogPage, MetadataType } from '@garimpo/contracts';
import { readableError } from '../../account/client';
import { ActionForm, Input, value } from './Forms';
import { catalogRequest } from './client';
import { EditionEditor, EditionFields, editionBody } from './Edition';
import type { Metadata } from './Edition';
import './catalog.css';

export default function Catalog() {
  const [revision, setRevision] = useState(0), [page, setPage] = useState(1), [q, setQ] = useState(''), [list, setList] = useState<CatalogPage>(),
    [metadata, setMetadata] = useState<Metadata>({ artist: [], genre: [], label: [] }), [selected, setSelected] = useState(''), [edition, setEdition] = useState<CatalogEdition>(),
    [error, setError] = useState(''), [notice, setNotice] = useState(''), [loading, setLoading] = useState(true);
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => { heading.current?.focus(); }, []);
  function changed() { setRevision(value => value + 1); setNotice('Alteração salva.'); }
  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      try {
        const [list, [artist, genre, label]] = await Promise.all([
          catalogRequest<CatalogPage>(`/admin/editions?page=${page}&q=${encodeURIComponent(q)}`.replace(/&q=$/, ''), 'GET', undefined, undefined, controller.signal),
          Promise.all((['artist', 'genre', 'label'] as const).map(type => catalogRequest<{ items: CatalogMetadata[] }>('/admin/catalog-metadata?type=' + type, 'GET', undefined, undefined, controller.signal)))
        ]);
        if (!controller.signal.aborted) { setList(list); setMetadata({ artist: artist!.items, genre: genre!.items, label: label!.items }); setError(''); }
      } catch (cause) { if (!controller.signal.aborted) setError(readableError(cause)); }
      finally { if (!controller.signal.aborted) setLoading(false); }
    }
    void load(); return () => controller.abort();
  }, [page, q, revision]);
  useEffect(() => {
    if (!selected) return;
    const controller = new AbortController();
    catalogRequest<CatalogEdition>('/admin/editions/' + selected, 'GET', undefined, undefined, controller.signal).then(setEdition).catch(cause => {
      if (!controller.signal.aborted) { setError(readableError(cause)); setEdition(undefined); }
    }); return () => controller.abort();
  }, [selected, revision]);
  return <div className="catalog-admin"><h1 ref={heading} tabIndex={-1}>Catálogo e estoque</h1><p>Cadastre edições, ofertas e exemplares; acompanhe o estoque físico.</p>
    {notice ? <p role="status">{notice}</p> : null}{error ? <div role="alert" className="account-error">{error}<button type="button" onClick={changed}>Tentar novamente</button></div> : null}
    <details><summary>Artistas, gêneros e gravadoras</summary><div className="catalog-grid">{(['artist', 'genre', 'label'] as const).map(type => <MetadataEditor key={type} type={type} items={metadata[type]} changed={changed} />)}</div></details>
    <details><summary>Criar edição</summary>{!metadata.artist.length || !metadata.genre.length ? <p>Cadastre ao menos um artista e um gênero antes da edição.</p> : <ActionForm title="Nova edição" submit="Criar rascunho" onSubmit={async data => {
      const result = await catalogRequest<CatalogEdition>('/admin/editions', 'POST', editionBody(data)); setSelected(result.id); setEdition(result); changed();
    }}><EditionFields metadata={metadata} /></ActionForm>}</details>
    <ActionForm title="Buscar edições" submit="Buscar" onSubmit={async data => { setQ(value(data, 'q')); setPage(1); }}><Input label="Título, artista ou faixa" name="q" maxLength={200} /></ActionForm>
    {loading ? <p role="status">Carregando edições…</p> : !list?.items.length ? <p>Nenhuma edição encontrada.</p> : <><ul className="catalog-list">{list.items.map(item => <li key={item.id}><button className="secondary" type="button" onClick={() => { setSelected(item.id); setEdition(item); }}>{item.title} · {item.active ? 'Publicada' : 'Rascunho ou inativa'}</button></li>)}</ul>
      <nav aria-label="Páginas das edições"><button type="button" disabled={page <= 1} onClick={() => setPage(value => value - 1)}>Anterior</button><span>Página {page} de {Math.max(1, list.totalPages)}</span><button type="button" disabled={page >= list.totalPages} onClick={() => setPage(value => value + 1)}>Próxima</button></nav></>}
    {selected && edition?.id === selected ? <section className="catalog-section"><EditionEditor key={selected} edition={edition} metadata={metadata} changed={changed} revision={revision} /></section> : null}
  </div>;
}
function MetadataEditor({ type, items, changed }: { type: MetadataType; items: CatalogMetadata[]; changed: () => void }) {
  const names = { artist: 'Artistas', genre: 'Gêneros', label: 'Gravadoras' };
  return <section><h2>{names[type]}</h2><ActionForm title={`Cadastrar em ${names[type]}`} submit="Cadastrar" reset onSubmit={async data => { await catalogRequest('/admin/catalog-metadata', 'POST', { type, name: value(data, 'name') }); changed(); }}><Input label="Nome" name="name" required maxLength={200} /></ActionForm>
    {items.map(item => <details key={item.id}><summary>{item.name}</summary><ActionForm title={'Editar ' + item.name} submit="Renomear" onSubmit={async data => { await catalogRequest(`/admin/catalog-metadata/${type}/${item.id}`, 'PATCH', { name: value(data, 'name') }); changed(); }}><Input label="Nome" name="name" required maxLength={200} defaultValue={item.name} /></ActionForm>
      <ActionForm title={'Excluir ' + item.name} submit="Excluir metadado" onSubmit={async () => { await catalogRequest(`/admin/catalog-metadata/${type}/${item.id}`, 'DELETE'); changed(); }} /></details>)}
  </section>;
}
