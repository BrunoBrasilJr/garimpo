import { useEffect, useState } from 'react';
import { Text, TextInput, View } from 'react-native';
import type { PrivateReview, PublicReviewPage, ReviewPage } from '@garimpo/contracts';
import type { MobileAccountClient } from '../account/client';
import { MobileError, errorMessage } from '../account/client';
import { MobileCatalogClient } from '../catalog/client';
import { Button, Choice } from '../catalog/Controls';
import { styles as s } from '../catalog/styles';

export function ReviewForm({ client, editionId, orderId, existing, saved }: { client: MobileAccountClient; editionId: string; orderId?: string; existing?: PrivateReview; saved: () => void }) {
  const [rating, setRating] = useState(existing?.rating ?? 5), [comment, setComment] = useState(existing?.comment ?? ''), [busy, setBusy] = useState(false), [error, setError] = useState('');
  async function submit() {
    setBusy(true); setError('');
    try { await client.request(existing ? '/me/reviews/' + existing.id : '/editions/' + editionId + '/reviews', existing ? 'PATCH' : 'POST', { rating, comment, ...(existing ? { revision: existing.version } : { orderId }) }); saved(); }
    catch (cause) { setError(errorMessage(cause)); } finally { setBusy(false); }
  }
  return <View style={s.card}><Text allowFontScaling accessibilityRole="header" style={s.subheading}>{existing ? 'Editar sua avaliação' : 'Avaliar esta compra'}</Text>
    <Choice label="Nota" value={String(rating)} clearable={false} options={[1, 2, 3, 4, 5].map(value => ({ value: String(value), label: value + (value === 1 ? ' estrela' : ' estrelas') }))} change={value => { if (value) setRating(Number(value)); }} />
    <Text allowFontScaling style={s.label}>Comentário</Text><TextInput accessibilityLabel="Comentário" allowFontScaling multiline maxLength={4000} value={comment} onChangeText={setComment} style={[s.input, { minHeight: 130, textAlignVertical: 'top' }]} />
    {existing?.visibility === 'HIDDEN' ? <Text allowFontScaling style={s.help}>Esta avaliação está oculta. Editar mantém o conteúdo oculto até nova análise da equipe.</Text> : null}
    {error ? <Text allowFontScaling accessibilityRole="alert" style={s.alert}>{error}</Text> : null}<Button title={busy ? 'Salvando…' : existing ? 'Salvar avaliação' : 'Publicar avaliação'} disabled={busy || !comment.trim() || !existing && !orderId} onPress={() => { void submit(); }} />
  </View>;
}

export function ReviewSection({ origin, editionId, client, orderId }: { origin: string; editionId: string; client?: MobileAccountClient | undefined; orderId?: string }) {
  const [page, setPage] = useState(1), [revision, setRevision] = useState(0), [data, setData] = useState<PublicReviewPage>(), [mine, setMine] = useState<ReviewPage<PrivateReview>>(), [error, setError] = useState(''), [privateError, setPrivateError] = useState('');
  useEffect(() => {
    const controller = new AbortController(); setError(''); setData(undefined);
    void (async () => {
      const safe = new MobileCatalogClient(origin).origin;
      const response = await globalThis.fetch(safe + '/api/v1/editions/' + encodeURIComponent(editionId) + '/reviews?page=' + page, { signal: controller.signal, credentials: 'omit', cache: 'no-store', headers: { Accept: 'application/json', 'X-Garimpo-Client': 'mobile' } });
      if (!response.ok) throw new MobileError(response.status, {}, 'Não foi possível consultar as avaliações agora.');
      const value = await response.json() as PublicReviewPage; if (!controller.signal.aborted) setData(value);
    })().catch(cause => { if (!controller.signal.aborted) setError(errorMessage(cause)); });
    return () => controller.abort();
  }, [origin, editionId, page, revision]);
  useEffect(() => {
    let active = true; setMine(undefined); setPrivateError('');
    if (client) void client.request<ReviewPage<PrivateReview>>('/me/reviews?editionId=' + encodeURIComponent(editionId) + '&page=' + page)
      .then(value => { if (active) setMine(value); }).catch(cause => { if (active) setPrivateError(errorMessage(cause)); });
    return () => { active = false; };
  }, [client, editionId, page, revision]);
  return <View style={s.page}><Text allowFontScaling accessibilityRole="header" style={s.heading}>Avaliações de compras verificadas</Text>
    {error ? <Text allowFontScaling accessibilityRole="alert" style={s.alert}>{error}</Text> : !data ? <Text allowFontScaling accessibilityLiveRegion="polite" style={s.text}>Carregando avaliações…</Text> : <><Text allowFontScaling style={s.text}>{data.summary.count ? `${data.summary.average?.toLocaleString('pt-BR')} de 5 · ${data.summary.count} ${data.summary.count === 1 ? 'avaliação' : 'avaliações'}` : 'Esta edição ainda não tem avaliações publicadas.'}</Text>{data.items.map(item => <View key={item.id} style={s.card}><Text allowFontScaling accessibilityRole="header" style={s.subheading}>{item.authorName} · {item.rating} de 5</Text><Text allowFontScaling style={s.text}>{item.comment}</Text></View>)}</>}
    {privateError ? <Text allowFontScaling accessibilityRole="alert" style={s.alert}>{privateError}</Text> : null}
    {client ? <><Text allowFontScaling accessibilityRole="header" style={s.heading}>Suas avaliações</Text>{mine?.items.length === 0 ? <Text allowFontScaling style={s.text}>Depois de receber uma compra, você poderá avaliá-la pelo pedido.</Text> : mine?.items.map(item => <View key={item.id} style={s.field}><Text allowFontScaling style={s.text}>{item.visibility === 'HIDDEN' ? item.awaitingModeration ? 'Oculta, aguardando análise' : 'Oculta pela equipe' : 'Publicada'}</Text><ReviewForm key={item.id + item.version} client={client} editionId={editionId} existing={item} saved={() => setRevision(value => value + 1)} /></View>)}
      {!mine && !privateError ? <Text allowFontScaling accessibilityLiveRegion="polite" style={s.text}>Conferindo suas avaliações…</Text> : null}
      {orderId && mine && !mine.items.some(item => item.orderId === orderId) ? <ReviewForm key={orderId} client={client} editionId={editionId} orderId={orderId} saved={() => setRevision(value => value + 1)} /> : null}</> : <Text allowFontScaling style={s.help}>Entre com sua conta para consultar suas avaliações.</Text>}
    <View style={s.actions}><Button title="Avaliações anteriores" disabled={page === 1} secondary onPress={() => setPage(value => value - 1)} /><Text allowFontScaling style={s.text}>Página {page}</Text><Button title="Próximas avaliações" disabled={page * 20 >= Math.max(data?.total ?? 0, mine?.total ?? 0)} secondary onPress={() => setPage(value => value + 1)} /><Button title="Atualizar avaliações" secondary onPress={() => setRevision(value => value + 1)} /></View>
  </View>;
}
