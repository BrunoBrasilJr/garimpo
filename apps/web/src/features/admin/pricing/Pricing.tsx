import { useEffect, useState } from 'react';
import type { CouponView, DiscountType, NamedPricingTarget, PricingPage, PromotionView } from '@garimpo/contracts';
import { request, readableError } from '../../account/client';
import { filterPrice, price } from '../../catalog/api';
import { TargetPicker } from './Picker';
import './pricing.css';
type Kind = 'coupons' | 'promotions';
const scaled = (value: number) => Math.trunc(value / 100) + ',' + String(value % 100).padStart(2, '0');
function local(value: string) { const date = new Date(value); return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16); }
function utc(value: string) { const date = new Date(value); if (!Number.isFinite(date.getTime())) throw new Error('Preencha as datas de início e fim.'); return date.toISOString(); }
const display = (item: CouponView | PromotionView) => 'code' in item ? item.code : item.name;
export default function PricingAdmin() {
  const [kind, setKind] = useState<Kind>('coupons'), [page, setPage] = useState(1), [active, setActive] = useState(''), [revision, setRevision] = useState(0), [data, setData] = useState<PricingPage<CouponView | PromotionView>>(), [editing, setEditing] = useState<CouponView | PromotionView>(), [error, setError] = useState('');
  useEffect(() => {
    const controller = new AbortController(); setData(undefined); setError('');
    request<PricingPage<CouponView | PromotionView>>('/admin/' + kind + '?page=' + page + (active ? '&active=' + active : ''), 'GET', undefined, true, controller.signal)
      .then(value => { if (!controller.signal.aborted) setData(value); }).catch(cause => { if (!controller.signal.aborted) setError(readableError(cause)); });
    return () => controller.abort();
  }, [kind, page, active, revision]);
  const caption = kind === 'coupons' ? 'cupom' : 'promoção';
  return <section className="account-card pricing-view"><h2>Cupons e promoções</h2><p>Promoções sobrepostas usam o menor preço. Cupons respeitam seus alvos, valor mínimo após promoções e regra de acumulação, sem descontar frete.</p>
    <div className="pricing-actions"><button className={kind === 'coupons' ? '' : 'secondary'} onClick={() => { setKind('coupons'); setPage(1); setEditing(undefined); }}>Cupons</button><button className={kind === 'promotions' ? '' : 'secondary'} onClick={() => { setKind('promotions'); setPage(1); setEditing(undefined); }}>Promoções</button></div>
    <h3>{editing ? 'Editar ' + caption + ' ' + display(editing) : 'Novo cadastro de ' + caption}</h3>
    <CampaignForm key={kind + (editing ? editing.id + editing.version : 'new')} kind={kind} initial={editing} saved={() => { setEditing(undefined); setRevision(value => value + 1); }} cancel={() => setEditing(undefined)} />
    <h3>{kind === 'coupons' ? 'Cupons cadastrados' : 'Promoções cadastradas'}</h3><label>Filtrar cadastros<select aria-label="Filtrar cadastros" value={active} onChange={event => { setActive(event.target.value); setPage(1); }}><option value="">Todos</option><option value="true">Ativos</option><option value="false">Inativos</option></select></label>
    {error ? <p role="alert">{error}</p> : !data ? <p role="status">Carregando cadastros…</p> : !data.items.length ? <p>Nenhum cadastro nesta página.</p> : data.items.map(item => <article key={item.id}><h4>{display(item)}</h4><p>{item.type === 'PERCENT' ? scaled(item.amount) + '%' : price(item.amount)} de desconto · {item.active ? 'Ativo' : 'Inativo'} · versão {item.version}</p><p>{new Date(item.startsAt).toLocaleString('pt-BR')} até {new Date(item.endsAt).toLocaleString('pt-BR')}</p>
      {'code' in item ? <><p>Mínimo elegível: {price(item.minimumEligibleCents)} · {item.allowPromotional ? 'Aceita itens promocionais' : 'Exclui itens promocionais'}</p><p>Limite total: {item.totalLimit ?? 'sem limite'} · por cliente: {item.perUserLimit ?? 'sem limite'} · utilizações: indisponíveis.</p><ul>{item.targets.map(target => <li key={target.kind + target.id}>{target.label}</li>)}</ul></> : <ul>{item.offers.map(offer => <li key={offer.id}>{offer.label}</li>)}</ul>}
      <button className="secondary" onClick={() => setEditing(item)}>Editar {caption} {display(item)}</button>
    </article>)}
    <div className="pricing-actions"><button disabled={page === 1} onClick={() => setPage(value => value - 1)}>Página anterior</button><span>Página {page}</span><button disabled={page * 20 >= (data?.total ?? 0)} onClick={() => setPage(value => value + 1)}>Próxima página</button><button className="secondary" onClick={() => setRevision(value => value + 1)}>Atualizar cadastros</button></div>
  </section>;
}
function CampaignForm({ kind, initial, saved, cancel }: { kind: Kind; initial: CouponView | PromotionView | undefined; saved: () => void; cancel: () => void }) {
  const coupon = initial && 'code' in initial ? initial : undefined, promotion = initial && 'name' in initial ? initial : undefined;
  const [name, setName] = useState(coupon?.code ?? promotion?.name ?? ''), [type, setType] = useState<DiscountType>(initial?.type ?? 'PERCENT'), [amount, setAmount] = useState(initial ? scaled(initial.amount) : ''), [start, setStart] = useState(local(initial?.startsAt ?? new Date().toISOString())), [end, setEnd] = useState(local(initial?.endsAt ?? new Date(Date.now() + 30 * 86400000).toISOString())), [active, setActive] = useState(initial?.active ?? true);
  const [minimum, setMinimum] = useState(scaled(coupon?.minimumEligibleCents ?? 0)), [totalLimit, setTotalLimit] = useState(String(coupon?.totalLimit ?? '')), [perUserLimit, setPerUserLimit] = useState(String(coupon?.perUserLimit ?? '')), [allowPromotional, setAllowPromotional] = useState(coupon?.allowPromotional ?? false), [selected, setSelected] = useState<NamedPricingTarget[]>(coupon?.targets ?? promotion?.offers.map(item => ({ kind: 'OFFER', ...item })) ?? []), [busy, setBusy] = useState(false), [error, setError] = useState(''), [notice, setNotice] = useState('');
  async function submit() {
    setBusy(true); setError(''); setNotice('');
    try {
      const common = { type, amount: Number(filterPrice(amount.trim())), startsAt: utc(start), endsAt: utc(end), active };
      const value = kind === 'coupons' ? { ...common, ...(!initial ? { code: name } : {}), minimumEligibleCents: Number(filterPrice(minimum.trim())), totalLimit: totalLimit ? Number(totalLimit) : null, perUserLimit: perUserLimit ? Number(perUserLimit) : null, allowPromotional, targets: selected.map(item => ({ kind: item.kind, id: item.id })) } : { ...common, name, offerIds: selected.map(item => item.id) };
      await request('/admin/' + kind + (initial ? '/' + initial.id : ''), initial ? 'PATCH' : 'POST', { ...value, ...(initial ? { version: initial.version } : {}) }); setNotice('Cadastro salvo.'); saved();
    } catch (cause) { setError(cause instanceof Error ? cause.message : readableError(cause)); } finally { setBusy(false); }
  }
  return <form className="pricing-form" aria-label={kind === 'coupons' ? 'Configurar cupom' : 'Configurar promoção'} onSubmit={event => { event.preventDefault(); void submit(); }}>
    <label>{kind === 'coupons' ? 'Código do cupom' : 'Nome da promoção'}<input aria-label={kind === 'coupons' ? 'Código do cupom' : 'Nome da promoção'} required maxLength={kind === 'coupons' ? 40 : 200} disabled={Boolean(coupon)} value={name} onChange={event => setName(event.target.value)} /></label>
    <label>Tipo de desconto<select aria-label="Tipo de desconto" value={type} onChange={event => setType(event.target.value as DiscountType)}><option value="PERCENT">Percentual</option><option value="FIXED">Valor fixo em reais</option></select></label>
    <label>{type === 'PERCENT' ? 'Desconto em percentual' : 'Desconto em reais'}<input aria-label={type === 'PERCENT' ? 'Desconto em percentual' : 'Desconto em reais'} required inputMode="decimal" value={amount} onChange={event => setAmount(event.target.value)} placeholder={type === 'PERCENT' ? '10,00' : '15,00'} /></label>
    <label>Início da validade<input aria-label="Início da validade" type="datetime-local" required value={start} onChange={event => setStart(event.target.value)} /></label><label>Fim da validade<input aria-label="Fim da validade" type="datetime-local" required value={end} onChange={event => setEnd(event.target.value)} /></label><p>Horários locais do aparelho. O instante final não está incluído na validade.</p>
    {kind === 'coupons' ? <><label>Mínimo elegível em reais<input aria-label="Mínimo elegível em reais" required inputMode="decimal" value={minimum} onChange={event => setMinimum(event.target.value)} /></label><label>Limite total de utilizações<input aria-label="Limite total de utilizações" type="number" min="1" max="2147483647" step="1" value={totalLimit} onChange={event => setTotalLimit(event.target.value)} placeholder="Sem limite" /></label><label>Limite por cliente<input aria-label="Limite por cliente" type="number" min="1" max="2147483647" step="1" value={perUserLimit} onChange={event => setPerUserLimit(event.target.value)} placeholder="Sem limite" /></label><label className="pricing-check"><input type="checkbox" checked={allowPromotional} onChange={event => setAllowPromotional(event.target.checked)} />Permitir itens que já estejam em promoção</label></> : null}
    <TargetPicker offersOnly={kind === 'promotions'} selected={selected} change={setSelected} /><label className="pricing-check"><input type="checkbox" checked={active} onChange={event => setActive(event.target.checked)} />Cadastro ativo</label>
    {error ? <p role="alert">{error}</p> : null}{notice ? <p role="status">{notice}</p> : null}<div className="pricing-actions"><button disabled={busy || kind === 'promotions' && !selected.length}>{busy ? 'Salvando…' : 'Salvar cadastro'}</button>{initial ? <button type="button" className="secondary" disabled={busy} onClick={cancel}>Cancelar edição</button> : null}</div>
  </form>;
}
