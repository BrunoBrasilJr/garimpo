import { useState } from 'react';
import { Text, View } from 'react-native';
import type { CatalogFilters } from '@garimpo/contracts';
import { Button, Choice, Field } from './Controls';
import { cents, message } from './client';
import { styles as s } from './styles';

export function Filters({ options, query, apply, busy }: { options: CatalogFilters; query: string; apply: (query: string) => void; busy: boolean }) {
  const initial = new URLSearchParams(query), [values, setValues] = useState<Record<string, string>>(() => Object.fromEntries([...initial].map(([key, value]) => [key, key === 'minPrice' || key === 'maxPrice' ? (Number(value) / 100).toFixed(2).replace('.', ',') : value]))), [open, setOpen] = useState(false), [error, setError] = useState('');
  const get = (key: string) => values[key] ?? '', set = (key: string) => (value: string) => setValues(current => ({ ...current, [key]: value }));
  const meta = (items: { id: string; name: string }[]) => items.map(item => ({ value: item.id, label: item.name })), grades = options.conditions.map(item => ({ value: item.code, label: item.code }));
  function submit() {
    try {
      const next = new URLSearchParams();
      for (const key of ['q', 'artist', 'genre', 'decade', 'minPrice', 'maxPrice', 'discCondition', 'sleeveCondition', 'available']) { const value = get(key).trim(); if (value) next.set(key, key === 'minPrice' || key === 'maxPrice' ? cents(value) : value); }
      next.set('pageSize', '12'); next.set('page', '1'); apply(next.toString()); setError('');
    } catch (cause) { setError(message(cause)); }
  }
  return <View style={s.card}><Text allowFontScaling accessibilityRole="header" style={s.heading}>Encontre seu disco</Text>
    <Field label="Título, artista ou faixa" value={get('q')} change={set('q')} maxLength={200} />
    <Button title={open ? 'Recolher filtros' : 'Combinar filtros'} onPress={() => setOpen(value => !value)} secondary />
    {open ? <View style={s.page}>
      <Choice label="Artista da edição ou da faixa" value={get('artist')} change={set('artist')} options={meta(options.artists)} />
      <Choice label="Gênero" value={get('genre')} change={set('genre')} options={meta(options.genres)} />
      <Choice label="Década desta edição" value={get('decade')} change={set('decade')} options={options.decades.map(year => ({ value: String(year), label: `${year}–${year + 9}` }))} />
      <Field label="Preço mínimo em reais" value={get('minPrice')} change={set('minPrice')} numeric /><Field label="Preço máximo em reais" value={get('maxPrice')} change={set('maxPrice')} numeric />
      <Choice label="Conservação do disco usado" value={get('discCondition')} change={set('discCondition')} options={grades} /><Choice label="Conservação da capa usada" value={get('sleeveCondition')} change={set('sleeveCondition')} options={grades} />
      <Choice label="Disponibilidade" value={get('available')} change={set('available')} options={[{ value: 'true', label: 'Disponíveis' }, { value: 'false', label: 'Esgotados' }]} />
      <Text allowFontScaling style={s.help}>A década considera o ano da edição/prensagem. Todos os filtros são combinados.</Text>
    </View> : null}
    {error ? <Text allowFontScaling accessibilityRole="alert" accessibilityLiveRegion="polite" style={s.alert}>{error}</Text> : null}
    <View style={s.actions}><Button title="Buscar discos" onPress={submit} disabled={busy} /><Button title="Limpar filtros" secondary onPress={() => { setValues({}); apply(''); setError(''); }} disabled={busy} /></View>
  </View>;
}
