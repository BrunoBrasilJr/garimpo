import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { Image, Pressable, Text, View } from 'react-native';
import type { CatalogEdition, CatalogImage, CatalogOffer, CatalogTrack } from '@garimpo/contracts';
import { MobileCatalogClient, message, money } from './client';
import { Button } from './Controls';
import { AudioPreview } from './Audio';
import { styles as s } from './styles';

export function Photos({ images, client }: { images: CatalogImage[]; client: MobileCatalogClient }) {
  return <View style={s.page}>{images.map(image => { const uri = client.image(image.url); return uri ? <View key={image.id} style={s.field}>
    <Image source={{ uri }} accessible accessibilityRole="image" accessibilityLabel={image.description} resizeMode="contain" resizeMethod="resize" style={s.image} />
    <Text allowFontScaling style={s.help}>{image.description}</Text></View> : null; })}</View>;
}
function Offer({ offer, index, selected, select, client }: { offer: CatalogOffer; index: number; selected: string; select: (value: string) => void; client: MobileCatalogClient }) {
  const name = `${offer.kind === 'NEW' ? 'Oferta nova' : 'Usado'} ${index}`;
  return <View style={[s.card, selected === offer.id ? s.selected : null]}><Text allowFontScaling accessibilityRole="header" style={s.subheading}>{name} · {money(offer.priceCents)}</Text>
    <Text allowFontScaling style={s.text}>{offer.available ? 'Disponível' : 'Esgotado'}</Text>
    {offer.kind === 'USED' ? <><Text allowFontScaling style={s.text}>Conservação do disco: {offer.discGrade ?? 'Não informada'}</Text><Text allowFontScaling style={s.text}>Conservação da capa: {offer.sleeveGrade ?? 'Não informada'}</Text><Text allowFontScaling style={s.text}>{offer.particulars}</Text><Photos images={offer.images} client={client} /></> : null}
    <Pressable accessibilityRole="radio" accessibilityLabel={`Selecionar ${name.toLowerCase()} por ${money(offer.priceCents)}`} accessibilityState={{ checked: selected === offer.id, disabled: !offer.available }} disabled={!offer.available} onPress={() => select(offer.id)} style={[s.button, s.secondary, !offer.available ? s.disabled : null]}>
      <Text allowFontScaling style={[s.buttonText, s.secondaryText]}>{selected === offer.id ? 'Selecionado' : 'Selecionar ' + name.toLowerCase()}</Text>
    </Pressable>
  </View>;
}
export function Edition({ client, id, back, cart }: { client: MobileCatalogClient; id: string; back: () => void; cart?: ((edition: CatalogEdition, offer: CatalogOffer | undefined) => ReactNode) | undefined }) {
  const [data, setData] = useState<CatalogEdition>(), [error, setError] = useState(''), [retry, setRetry] = useState(0), [selected, setSelected] = useState(''), [track, setTrack] = useState<CatalogTrack | null>(null);
  useEffect(() => {
    const controller = new AbortController(); setData(undefined); setError(''); setTrack(null); setSelected('');
    client.detail(id, controller.signal).then(value => { if (!controller.signal.aborted) setData(value); }).catch(cause => { if (!controller.signal.aborted) setError(message(cause)); });
    return () => controller.abort();
  }, [client, id, retry]);
  const chosen = data?.offers.find(offer => offer.id === selected), fresh = data?.offers.filter(offer => offer.kind === 'NEW') ?? [], used = data?.offers.filter(offer => offer.kind === 'USED') ?? [];
  return <View style={s.page}><Button title="Voltar aos resultados" secondary onPress={back} />
    {error ? <><Text allowFontScaling accessibilityRole="alert" accessibilityLiveRegion="polite" style={s.alert}>{error}</Text><Button title="Tentar novamente" onPress={() => setRetry(value => value + 1)} /></> : !data ? <Text allowFontScaling accessibilityLiveRegion="polite" style={s.text}>Carregando edição…</Text> : <>
      <Text allowFontScaling accessibilityRole="header" style={s.title}>{data.title}</Text><Text allowFontScaling style={s.text}>{data.artists.map(item => item.name).join(', ')}</Text>
      <Text allowFontScaling style={s.text}>{data.format}{data.collectorEdition ? ' · Edição de colecionador' : ''}</Text><Photos client={client} images={data.images} />
      <Text allowFontScaling accessibilityRole="header" style={s.heading}>Sobre esta edição</Text>
      <Text allowFontScaling style={s.text}>Ano original: {data.originalYear ?? 'Não informado'}</Text><Text allowFontScaling style={s.text}>Ano desta edição: {data.editionYear ?? 'Não informado'}</Text>
      <Text allowFontScaling style={s.text}>Gravadora: {data.label?.name ?? 'Não informada'}</Text><Text allowFontScaling style={s.text}>Catálogo: {data.catalogNumber ?? 'Não informado'}</Text><Text allowFontScaling style={s.text}>País de prensagem: {data.pressingCountry ?? 'Não informado'}</Text><Text allowFontScaling style={s.text}>Peso: {data.weightGrams === null ? 'Não informado' : data.weightGrams + ' g'}</Text>
      <Text allowFontScaling style={s.text}>Gêneros: {data.genres.map(item => item.name).join(', ')}</Text><Text allowFontScaling style={s.text}>Gênero principal: {data.primaryGenre.name}</Text>
      <Text allowFontScaling accessibilityRole="header" style={s.heading}>Faixas</Text>
      {!data.tracks.length ? <Text allowFontScaling style={s.text}>Faixas não informadas.</Text> : data.tracks.map(item => <View key={item.id} style={s.card}><Text allowFontScaling accessibilityRole="header" style={s.subheading}>{item.position}. {item.title}</Text><Text allowFontScaling style={s.text}>{item.artists.length ? item.artists.map(artist => artist.name).join(', ') : 'Artistas da faixa não informados'}</Text>
        {item.durationSeconds === null ? null : <Text allowFontScaling style={s.help}>{Math.floor(item.durationSeconds / 60)}:{String(item.durationSeconds % 60).padStart(2, '0')}</Text>}
        {item.audioUrl ? <Button title={'Abrir prévia de ' + item.title} secondary onPress={() => setTrack(item)} /> : null}
        {track?.id === item.id && item.audioUrl ? <AudioPreview key={item.id} url={item.audioUrl} title={item.title} close={() => setTrack(null)} /> : null}
      </View>)}
      <Text allowFontScaling accessibilityRole="header" style={s.heading}>Ofertas novas</Text>{!fresh.length ? <Text allowFontScaling style={s.text}>Nenhuma oferta nova cadastrada.</Text> : fresh.map((offer, index) => <Offer key={offer.id} offer={offer} index={index + 1} selected={selected} select={setSelected} client={client} />)}
      <Text allowFontScaling accessibilityRole="header" style={s.heading}>Exemplares usados</Text>{!used.length ? <Text allowFontScaling style={s.text}>Nenhum exemplar usado cadastrado.</Text> : used.map((offer, index) => <Offer key={offer.id} offer={offer} index={index + 1} selected={selected} select={setSelected} client={client} />)}
      {chosen ? <Text allowFontScaling accessibilityLiveRegion="polite" style={s.text}>{chosen.kind === 'NEW' ? 'Oferta nova selecionada' : 'Usado selecionado'} · {money(chosen.priceCents)}. Esta seleção não reserva estoque.</Text> : null}
      {cart?.(data, chosen)}
    </>}
  </View>;
}
