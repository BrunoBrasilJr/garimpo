import { useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { BackHandler, Image, Text, View } from 'react-native';
import type { CatalogPage, CatalogFilters } from '@garimpo/contracts';
import { MobileCatalogClient, message, money } from './client';
import { Button } from './Controls';
import { Filters } from './Filters';
import { Edition } from './Edition';
import { styles as s } from './styles';

export default function Catalog({ origin, initialQuery = '', initialEdition = '', actions }: { origin: string; initialQuery?: string; initialEdition?: string; actions?: (editionId: string) => ReactNode }) {
  const client = useMemo(() => { try { return new MobileCatalogClient(origin); } catch { return null; } }, [origin]);
  const [query, setQuery] = useState(initialQuery), [edition, setEdition] = useState(initialEdition), [data, setData] = useState<CatalogPage>(), [options, setOptions] = useState<CatalogFilters>(), [loading, setLoading] = useState(true), [error, setError] = useState(''), [retry, setRetry] = useState(0);
  useEffect(() => {
    if (!client) { setLoading(false); setError('A conexão segura está indisponível. Tente novamente em instantes.'); return; }
    const controller = new AbortController(); setLoading(true); setError(''); const params = new URLSearchParams(query); if (!params.has('pageSize')) params.set('pageSize', '12');
    Promise.all([client.list(params, controller.signal), client.filters(controller.signal)]).then(([list, filters]) => {
      if (!controller.signal.aborted) { setData(list); setOptions(filters); setLoading(false); }
    }).catch(cause => { if (!controller.signal.aborted) { setError(message(cause)); setLoading(false); } });
    return () => controller.abort();
  }, [client, query, retry]);
  useEffect(() => { if (!edition) return; const handler = BackHandler.addEventListener('hardwareBackPress', () => { setEdition(''); return true; }); return () => handler.remove(); }, [edition]);
  function page(number: number) { const params = new URLSearchParams(query); params.set('page', String(number)); setQuery(params.toString()); }
  if (edition && client) return <><Edition client={client} id={edition} back={() => setEdition('')} />{actions?.(edition)}</>;
  return <View style={s.page}><Text allowFontScaling accessibilityRole="header" style={s.title}>Explore os discos</Text><Text allowFontScaling style={s.text}>Novos, usados e edições para guardar boas histórias.</Text>
    {options ? <Filters key={query} options={options} query={query} apply={setQuery} busy={loading} /> : null}
    {error ? <><Text allowFontScaling accessibilityRole="alert" accessibilityLiveRegion="polite" style={s.alert}>{error}</Text><Button title="Tentar novamente" onPress={() => setRetry(value => value + 1)} /></> : null}
    {loading ? <Text allowFontScaling accessibilityLiveRegion="polite" style={s.text}>Buscando discos…</Text> : data && !error && client ? <>
      <Text allowFontScaling accessibilityRole="header" style={s.heading}>{data.total} {data.total === 1 ? 'edição encontrada' : 'edições encontradas'}</Text>
      {!data.items.length ? <Text allowFontScaling style={s.text}>Nenhum disco encontrado com estes filtros. Tente outra combinação.</Text> : data.items.map(item => {
        const image = item.images[0], uri = image ? client.image(image.url) : undefined;
        return <View key={item.id} style={s.card}>{uri && image ? <Image source={{ uri }} accessible accessibilityRole="image" accessibilityLabel={image.description} resizeMethod="resize" resizeMode="contain" style={s.image} /> : null}
          <Text allowFontScaling accessibilityRole="header" style={s.heading}>{item.title}</Text><Text allowFontScaling style={s.text}>{item.artists.map(artist => artist.name).join(', ')}</Text><Text allowFontScaling style={s.text}>{item.format}{item.collectorEdition ? ' · Colecionador' : ''}</Text>
          <Text allowFontScaling style={s.text}>Ano desta edição: {item.editionYear ?? 'Não informado'}</Text><Text allowFontScaling style={s.text}>{item.available ? 'Disponível' : 'Esgotado'}{item.minPriceCents === null ? '' : ' · a partir de ' + money(item.minPriceCents)}</Text><Button title={'Ver edição ' + item.title} onPress={() => setEdition(item.id)} />
        </View>;
      })}
      <View style={s.actions}><Button title="Página anterior" disabled={data.page <= 1} secondary onPress={() => page(data.page - 1)} /><Text allowFontScaling style={s.text}>Página {data.page} de {Math.max(1, data.totalPages)}</Text><Button title="Próxima página" disabled={data.page >= data.totalPages} secondary onPress={() => page(data.page + 1)} /></View>
    </> : null}
  </View>;
}
