import { useEffect, useState } from 'react';
import { AppState, Text, View } from 'react-native';
import type { CatalogEdition, GuestCartState, GuestLine } from '@garimpo/contracts';
import { MobileCatalogClient, money } from '../catalog/client';
import { Button } from '../catalog/Controls';
import { styles as s } from '../catalog/styles';
import { CartField } from './Field';
import { guestCart, subscribeGuest } from './storage';
import { cartError, quantity } from './client';
export function VisitorCart({ origin, login, browse }: { origin: string; login: () => void; browse: () => void }) {
  const [data, setData] = useState<GuestCartState>(), [editions, setEditions] = useState<Record<string, CatalogEdition>>({}), [error, setError] = useState(''), [revision, setRevision] = useState(0), [busy, setBusy] = useState(false), [confirm, setConfirm] = useState(false);
  useEffect(() => {
    const controller = new AbortController();
    void (async () => {
      try {
        const local = await guestCart.read(); if (controller.signal.aborted) return; setData(local); setError('');
        const client = new MobileCatalogClient(origin), ids = [...new Set(local.items.map(line => line.editionId))], result: Record<string, CatalogEdition> = {};
        for (let index = 0; index < ids.length; index += 8) {
          const group = await Promise.allSettled(ids.slice(index, index + 8).map(id => client.detail(id, controller.signal)));
          group.forEach((item, offset) => { if (item.status === 'fulfilled') result[ids[index + offset]!] = item.value; }); if (controller.signal.aborted) return;
        } setEditions(result);
      } catch (cause) { if (!controller.signal.aborted) setError(cartError(cause)); }
    })();
    const stop = subscribeGuest(() => setRevision(value => value + 1)), listener = AppState.addEventListener('change', status => { if (status === 'active') setRevision(value => value + 1); });
    return () => { controller.abort(); stop(); listener.remove(); };
  }, [origin, revision]);
  async function action(work: () => Promise<unknown>) { setBusy(true); setError(''); try { await work(); setRevision(value => value + 1); setConfirm(false); } catch (cause) { setError(cartError(cause)); } finally { setBusy(false); } }
  return <View style={s.page}><Text allowFontScaling accessibilityRole="header" style={s.title}>Seu carrinho</Text><Text allowFontScaling style={s.text}>Este carrinho está neste aparelho. Nenhum item está reservado. Ao entrar, os itens serão mesclados à sua conta, com aviso de ajustes.</Text>
    {error ? <Text allowFontScaling accessibilityRole="alert" style={s.alert}>{error}</Text> : null}{!data && !error ? <Text allowFontScaling accessibilityLiveRegion="polite" style={s.text}>Carregando carrinho…</Text> : data && !data.items.length ? <Text allowFontScaling style={s.text}>Seu carrinho está vazio.</Text> : data?.items.map(line => <VisitorLine key={line.entryId + ':' + line.units.length} line={line} edition={editions[line.editionId]} busy={busy} action={action} />)}
    {data?.pending.length ? <Text allowFontScaling style={s.text}>Há uma mescla aguardando confirmação de outro acesso. Confira essa conta antes de enviar os mesmos itens a outra conta.</Text> : null}
    <Button title="Atualizar itens deste aparelho" secondary disabled={busy} onPress={() => setRevision(value => value + 1)} /><Button title="Entrar para continuar" onPress={login} /><Button title="Continuar explorando discos" secondary onPress={browse} /><Button title="Limpar carrinho deste aparelho" secondary disabled={busy} onPress={() => setConfirm(true)} />
    {confirm ? <View style={s.card}><Text allowFontScaling accessibilityRole="alert" style={s.text}>Limpar remove somente os dados deste aparelho. Uma mescla já enviada pode estar na sua conta e deve ser conferida lá.</Text><Button title="Confirmar limpeza local" disabled={busy} onPress={() => { void action(() => guestCart.reset()); }} /><Button title="Manter carrinho" secondary onPress={() => setConfirm(false)} /></View> : null}
  </View>;
}
function VisitorLine({ line, edition, busy, action }: { line: GuestLine; edition: CatalogEdition | undefined; busy: boolean; action: (work: () => Promise<unknown>) => Promise<void> }) {
  const [amount, setAmount] = useState(String(line.units.length)), offer = edition?.offers.find(offer => offer.id === line.offerId), title = edition?.title ?? 'Item a conferir';
  return <View style={s.card}><Text allowFontScaling accessibilityRole="header" style={s.heading}>{title}</Text><Text allowFontScaling style={s.text}>{offer?.kind === 'USED' ? `Usado · disco ${offer.discGrade} · capa ${offer.sleeveGrade}` : offer?.kind === 'NEW' ? 'Oferta nova' : 'Oferta a conferir'}</Text>
    <Text allowFontScaling style={s.text}>{offer ? `Preço atual por unidade: ${money(offer.priceCents)} · ${offer.available ? 'Disponibilidade será conferida na finalização.' : 'Indisponível agora.'}` : 'Não foi possível conferir esta oferta. Atualize antes de finalizar.'}</Text>
    <CartField label={'Quantidade de ' + title} value={amount} change={setAmount} numeric disabled={busy || offer?.kind === 'USED'} />{offer?.kind !== 'USED' ? <Button title={'Atualizar quantidade de ' + title} disabled={busy} onPress={() => { void action(() => guestCart.quantity(line.entryId, quantity(amount))); }} /> : null}
    <Button title={'Remover ' + title} secondary disabled={busy} onPress={() => { void action(() => guestCart.remove(line.entryId)); }} />
  </View>;
}
