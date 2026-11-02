import { useEffect, useState } from 'react';
import type { CatalogEdition, GuestCartState, GuestLine } from '@garimpo/contracts';
import { price, readCatalog } from '../catalog/api';
import { guestCart } from './storage';
import { cartError, quantity } from './client';
export function VisitorCart() {
  const [data, setData] = useState<GuestCartState>(), [editions, setEditions] = useState<Record<string, CatalogEdition>>({}), [error, setError] = useState(''), [revision, setRevision] = useState(0), [confirm, setConfirm] = useState(false), [busy, setBusy] = useState(false);
  useEffect(() => {
    const controller = new AbortController();
    const load = async () => {
      try {
        const local = await guestCart.read(); if (controller.signal.aborted) return; setData(local); setError('');
        const ids = [...new Set(local.items.map(line => line.editionId))], result: Record<string, CatalogEdition> = {};
        for (let index = 0; index < ids.length; index += 8) {
          const group = await Promise.allSettled(ids.slice(index, index + 8).map(id => readCatalog<CatalogEdition>('/editions/' + id, controller.signal)));
          group.forEach((item, offset) => { if (item.status === 'fulfilled') result[ids[index + offset]!] = item.value; });
          if (controller.signal.aborted) return;
        } setEditions(result);
      } catch (cause) { if (!controller.signal.aborted) setError(cartError(cause)); }
    };
    void load(); const changed = () => setRevision(value => value + 1); window.addEventListener('garimpo-guestcart', changed); window.addEventListener('storage', changed);
    return () => { controller.abort(); window.removeEventListener('garimpo-guestcart', changed); window.removeEventListener('storage', changed); };
  }, [revision]);
  async function action(work: () => Promise<unknown>) { setBusy(true); setError(''); try { await work(); setRevision(value => value + 1); setConfirm(false); } catch (cause) { setError(cartError(cause)); } finally { setBusy(false); } }
  return <section className="account-card cart-view"><h2>Seu carrinho</h2><p>Este carrinho está neste aparelho. Nenhum item está reservado. Ao entrar, os itens serão mesclados à sua conta, com aviso de ajustes.</p>
    {error ? <p role="alert">{error}</p> : null}{!data && !error ? <p role="status">Carregando carrinho…</p> : data && !data.items.length ? <p>Seu carrinho está vazio.</p> : data?.items.map(line => <VisitorLine key={line.entryId + ':' + line.units.length} line={line} edition={editions[line.editionId]} busy={busy} action={action} />)}
    {data?.pending.length ? <p>Há uma mescla aguardando confirmação de um acesso anterior. Confira o carrinho dessa conta antes de enviar esses itens a outra conta.</p> : null}
    <a href="#/login">Entrar para continuar</a><a href="#/catalog">Continuar explorando discos</a>
    <button type="button" className="secondary" disabled={busy} onClick={() => setConfirm(true)}>Limpar carrinho deste aparelho</button>
    {confirm ? <div role="alert"><p>Limpar remove somente os dados deste aparelho. Uma mescla já enviada pode estar na sua conta e deve ser conferida lá.</p><button type="button" disabled={busy} onClick={() => { void action(() => guestCart.reset()); }}>Confirmar limpeza local</button><button type="button" className="secondary" onClick={() => setConfirm(false)}>Manter carrinho</button></div> : null}
  </section>;
}
function VisitorLine({ line, edition, busy, action }: { line: GuestLine; edition: CatalogEdition | undefined; busy: boolean; action: (work: () => Promise<unknown>) => Promise<void> }) {
  const [amount, setAmount] = useState(String(line.units.length)), offer = edition?.offers.find(offer => offer.id === line.offerId);
  return <article aria-label={edition?.title ?? 'Item indisponível'}><h3>{edition?.title ?? 'Item indisponível'}</h3><p>{offer?.kind === 'USED' ? `Usado · disco ${offer.discGrade} · capa ${offer.sleeveGrade}` : offer?.kind === 'NEW' ? 'Oferta nova' : 'Oferta indisponível'}</p>
    {offer ? <p>Preço atual por unidade: {price(offer.priceCents)} · {offer.available ? 'Disponibilidade será conferida na finalização.' : 'Indisponível agora.'}</p> : <p>Não foi possível conferir esta oferta. Atualize antes de finalizar.</p>}
    <form onSubmit={event => { event.preventDefault(); void action(() => guestCart.quantity(line.entryId, quantity(amount))); }}><label>Quantidade de {edition?.title ?? 'item'}<input aria-label={'Quantidade de ' + (edition?.title ?? 'item')} type="number" min="1" max={offer?.kind === 'USED' ? 1 : 1000} step="1" value={amount} disabled={busy || offer?.kind === 'USED'} onChange={event => setAmount(event.target.value)} /></label>{offer?.kind !== 'USED' ? <button disabled={busy}>Atualizar quantidade</button> : null}</form>
    <button type="button" className="secondary" disabled={busy} onClick={() => { void action(() => guestCart.remove(line.entryId)); }}>Remover {edition?.title ?? 'item'}</button>
  </article>;
}
