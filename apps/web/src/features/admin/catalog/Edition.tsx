import { useRef, useState } from 'react';
import { GOLDMINE_GRADES } from '@garimpo/contracts';
import type { CatalogEdition, CatalogMetadata, CatalogOffer, CatalogImage } from '@garimpo/contracts';
import { ActionForm, Input, Select, value, optional, numberOrNull } from './Forms';
import { catalogRequest, cents, commandKey, money } from './client';
import { Stock } from './Stock';
import { ClientError } from '../../account/client';

export type Metadata = { artist: CatalogMetadata[]; genre: CatalogMetadata[]; label: CatalogMetadata[] };
const options = (items: CatalogMetadata[]) => items.map(item => ({ value: item.id, label: item.name }));
export function EditionFields({ data, metadata }: { data?: CatalogEdition; metadata: Metadata }) {
  const [tracks, setTracks] = useState(data?.tracks ?? []);
  return <><Input label="Título da edição" name="title" required maxLength={300} defaultValue={data?.title} />
    <Select label="Artistas da edição" name="artistIds" multiple options={options(metadata.artist)} value={data?.artists.map(item => item.id)} />
    <Select label="Gêneros da edição" name="genreIds" multiple options={options(metadata.genre)} value={data?.genres.map(item => item.id)} />
    <Select label="Gênero principal" name="primaryGenreId" options={options(metadata.genre)} value={data?.primaryGenre.id} />
    <Select label="Gravadora" name="labelId" options={options(metadata.label)} value={data?.label?.id ?? ''} required={false} />
    <Input label="Formato" name="format" required maxLength={60} defaultValue={data?.format ?? 'LP'} />
    <Input label="Ano original" name="originalYear" type="number" min={1} max={9999} defaultValue={data?.originalYear ?? ''} />
    <Input label="Ano desta edição" name="editionYear" type="number" min={1} max={9999} defaultValue={data?.editionYear ?? ''} />
    <Input label="Número de catálogo" name="catalogNumber" maxLength={100} defaultValue={data?.catalogNumber ?? ''} />
    <Input label="Peso em gramas" name="weightGrams" type="number" min={1} max={2147483647} defaultValue={data?.weightGrams ?? ''} />
    <Input label="País de prensagem" name="pressingCountry" maxLength={100} defaultValue={data?.pressingCountry ?? ''} />
    <Input label="Edição de colecionador" name="collectorEdition" type="checkbox" defaultChecked={data?.collectorEdition ?? false} />
    <h4>Faixas</h4>{tracks.map((track, index) => <div key={track.id} className="catalog-subcard"><h4>Faixa {index + 1}</h4>
      <Input label="Nome da faixa" name={`track.${track.id}.title`} required maxLength={300} defaultValue={track.title} />
      <Input label="Duração em segundos" name={`track.${track.id}.duration`} type="number" min={0} max={2147483647} defaultValue={track.durationSeconds ?? ''} />
      <Select label="Artistas da faixa" name={`track.${track.id}.artists`} multiple required={false} options={options(metadata.artist)} value={track.artists.map(item => item.id)} />
      <Input label="Link HTTPS do áudio" name={`track.${track.id}.audio`} type="url" maxLength={2048} defaultValue={track.audioUrl ?? ''} />
      <button type="button" className="secondary" onClick={() => setTracks(items => items.filter(item => item.id !== track.id))}>Remover faixa {index + 1}</button>
    </div>)}<input type="hidden" name="trackKeys" value={JSON.stringify(tracks.map(track => track.id))} />
    <button type="button" className="secondary" onClick={() => setTracks(items => [...items, { id: crypto.randomUUID(), position: items.length + 1, title: '', durationSeconds: null, audioUrl: null, artists: [] }])}>Adicionar faixa</button>
  </>;
}
export function editionBody(data: FormData) {
  const keys = JSON.parse(value(data, 'trackKeys')) as string[];
  return { title: value(data, 'title'), artistIds: data.getAll('artistIds'), genreIds: data.getAll('genreIds'), primaryGenreId: value(data, 'primaryGenreId'),
    labelId: optional(data, 'labelId'), format: value(data, 'format'), originalYear: numberOrNull(data, 'originalYear'), editionYear: numberOrNull(data, 'editionYear'),
    catalogNumber: optional(data, 'catalogNumber'), weightGrams: numberOrNull(data, 'weightGrams'), pressingCountry: optional(data, 'pressingCountry'), collectorEdition: data.has('collectorEdition'),
    tracks: keys.map((key, index) => ({ position: index + 1, title: value(data, `track.${key}.title`), durationSeconds: numberOrNull(data, `track.${key}.duration`), audioUrl: optional(data, `track.${key}.audio`), artistIds: data.getAll(`track.${key}.artists`) })) };
}
export function EditionEditor({ edition, metadata, changed, revision }: { edition: CatalogEdition; metadata: Metadata; changed: () => void; revision: number }) {
  const key = useRef<{ signature: string; key: string } | null>(null), [kind, setKind] = useState<'NEW' | 'USED'>('NEW');
  return <><h2>{edition.title} · {edition.active ? 'Publicada' : 'Inativa ou rascunho'}</h2>
    <details><summary>Editar dados e faixas</summary><ActionForm title="Editar edição" submit="Salvar edição" onSubmit={async data => { await catalogRequest('/admin/editions/' + edition.id, 'PATCH', editionBody(data)); changed(); }}>
      <EditionFields key={edition.id} data={edition} metadata={metadata} /></ActionForm></details>
    <Photos owner="editions" id={edition.id} images={edition.images} changed={changed} />
    <ActionForm title="Publicar edição" submit="Publicar edição" onSubmit={async () => { await catalogRequest('/admin/editions/' + edition.id, 'PATCH', { active: true }); changed(); }} />
    <Lifecycle owner="editions" id={edition.id} changed={changed} />
    <h2>Ofertas</h2><label>Tipo da nova oferta <select value={kind} onChange={event => setKind(event.target.value as 'NEW' | 'USED')}><option value="NEW">Novos</option><option value="USED">Usado individual</option></select></label>
    <ActionForm title="Criar oferta" submit="Criar oferta em rascunho" reset onSubmit={async data => {
      const body = { kind, priceCents: cents(value(data, 'price')), stockOnHand: Number(value(data, 'stock')), active: false, ...(kind === 'USED' ? { discGrade: value(data, 'discGrade'), sleeveGrade: value(data, 'sleeveGrade'), particulars: optional(data, 'particulars') } : {}) };
      await catalogRequest(`/admin/editions/${edition.id}/offers`, 'POST', body, commandKey(key, body)); key.current = null; changed();
    }}><Input label="Preço em reais" name="price" required inputMode="decimal" placeholder="129,90" /><Input key={kind} label="Quantidade física inicial" name="stock" type="number" step={1} min={0} max={kind === 'USED' ? 1 : 2147483647} required defaultValue={kind === 'USED' ? 1 : 0} />{kind === 'USED' ? <Condition /> : null}</ActionForm>
    {edition.offers.map((offer, index) => <Offer key={offer.id} offer={offer} index={index + 1} changed={changed} />)}
    <Stock editionId={edition.id} offerIds={edition.offers.map(offer => offer.id)} revision={revision} changed={changed} />
  </>;
}
function Condition({ offer }: { offer?: CatalogOffer }) {
  const grades = GOLDMINE_GRADES.map(grade => ({ value: grade, label: grade }));
  return <><Select label="Conservação do disco" name="discGrade" options={grades} value={offer?.discGrade ?? 'VG'} /><Select label="Conservação da capa" name="sleeveGrade" options={grades} value={offer?.sleeveGrade ?? 'VG'} />
    <Input label="Particularidades do exemplar" name="particulars" maxLength={4000} defaultValue={offer?.particulars ?? ''} required /></>;
}
function Offer({ offer, index, changed }: { offer: CatalogOffer; index: number; changed: () => void }) {
  return <section className="catalog-subcard" aria-label={`Oferta ${index}`}><h3>Oferta {index} · {offer.kind === 'NEW' ? 'Novos' : 'Usado'} · {money(offer.priceCents)} · {offer.active ? 'Ativa' : 'Inativa'}</h3>
    <ActionForm key={offer.version} title={`Editar oferta ${index}`} submit="Salvar oferta" onSubmit={async data => {
      await catalogRequest('/admin/offers/' + offer.id, 'PATCH', { version: offer.version, priceCents: cents(value(data, 'price')), ...(offer.kind === 'USED' ? { discGrade: value(data, 'discGrade'), sleeveGrade: value(data, 'sleeveGrade'), particulars: optional(data, 'particulars') } : {}) }); changed();
    }}><Input label="Preço em reais" name="price" required inputMode="decimal" defaultValue={(offer.priceCents / 100).toFixed(2).replace('.', ',')} />{offer.kind === 'USED' ? <Condition offer={offer} /> : null}</ActionForm>
    {offer.kind === 'USED' ? <Photos owner="offers" id={offer.id} images={offer.images} changed={changed} /> : null}
    <ActionForm title={`Ativar oferta ${index}`} submit="Ativar oferta" onSubmit={async () => { await catalogRequest('/admin/offers/' + offer.id, 'PATCH', { version: offer.version, active: true }); changed(); }} />
    <Lifecycle owner="offers" id={offer.id} changed={changed} />
  </section>;
}
function Photos({ owner, id, images, changed }: { owner: 'editions' | 'offers'; id: string; images: CatalogImage[]; changed: () => void }) {
  return <section className="catalog-subcard"><h3>{owner === 'editions' ? 'Fotos da edição (até 10)' : 'Fotos próprias do usado (até 8)'}</h3>
    <div className="catalog-photos">{images.map(image => <figure key={image.id}><img src={image.url} alt={image.description} width={160} height={160} loading="lazy" /><figcaption>{image.description}</figcaption>
      <ActionForm title={'Remover foto: ' + image.description} submit="Remover foto" onSubmit={async () => { await catalogRequest('/admin/images/' + image.id, 'DELETE'); changed(); }} /></figure>)}</div>
    <ActionForm title="Enviar foto" submit="Enviar foto" reset onSubmit={async data => {
      const file = data.get('photo'); if (!(file instanceof File) || !file.size || file.size > 5_000_000) throw new ClientError(422, 'INVALID_IMAGE', 'Selecione uma imagem de até 5 MB.');
      await catalogRequest(`/admin/${owner}/${id}/images?description=${encodeURIComponent(value(data, 'description'))}`, 'POST', file); changed();
    }}><Input label="Imagem JPEG, PNG ou WebP de até 5 MB" name="photo" type="file" accept="image/jpeg,image/png,image/webp" required /><Input label="Descrição da foto" name="description" required maxLength={500} /></ActionForm>
  </section>;
}
function Lifecycle({ owner, id, changed }: { owner: 'editions' | 'offers'; id: string; changed: () => void }) {
  return <details><summary>Inativar ou excluir</summary><ActionForm title="Inativar cadastro" submit="Inativar" onSubmit={async data => { await catalogRequest(`/admin/${owner}/${id}/inactivate`, 'POST', { reason: value(data, 'reason') }); changed(); }}>
    <p>A inativação preserva estoque e histórico.</p><Input label="Motivo da inativação" name="reason" required maxLength={500} /></ActionForm>
    <ActionForm title="Exclusão definitiva" submit="Excluir definitivamente" onSubmit={async () => { await catalogRequest(`/admin/${owner}/${id}`, 'DELETE'); changed(); }}><p>A exclusão só é permitida quando os vínculos e o histórico puderem ser conferidos e estiverem livres.</p></ActionForm></details>;
}
