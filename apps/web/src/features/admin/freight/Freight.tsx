import { useCallback, useEffect, useRef, useState } from 'react';
import type { FreightPage, FreightRateView } from '@garimpo/contracts';
import { request, readableError } from '../../account/client';
import { CatalogReadError, filterPrice, price } from '../../catalog/api';
import './freight.css';
interface Draft { region: string; served: boolean; amount: string; days: string; ranges: { startZip: string; endZip: string }[] }
const blank = (): Draft => ({ region: '', served: true, amount: '', days: '', ranges: [{ startZip: '', endZip: '' }] });
const zip = (value: string) => value.slice(0, 5) + '-' + value.slice(5);
class FormError extends Error {}
const failure = (cause: unknown) => cause instanceof FormError || cause instanceof CatalogReadError ? cause.message : readableError(cause);
export default function FreightAdmin() {
  const [data, setData] = useState<FreightPage>(), [page, setPage] = useState(1), [revision, setRevision] = useState(0), [draft, setDraft] = useState<Draft>(blank), [editing, setEditing] = useState<FreightRateView>(), [busy, setBusy] = useState(false), [error, setError] = useState(''), [notice, setNotice] = useState('');
  const alive = useRef(true), saveController = useRef<AbortController | null>(null), heading = useRef<HTMLHeadingElement>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => { alive.current = true; return () => { alive.current = false; saveController.current?.abort(); }; }, []);
  useEffect(() => {
    const controller = new AbortController(); setData(undefined); setLoading(true);
    request<FreightPage>('/admin/freight-rates?page=' + page, 'GET', undefined, true, controller.signal).then(value => { if (!controller.signal.aborted) setData(value); }).catch(cause => { if (!controller.signal.aborted) setError(failure(cause)); }).finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [page, revision]);
  const changeRange = useCallback((index: number, field: 'startZip' | 'endZip', value: string) => setDraft(draft => ({ ...draft, ranges: draft.ranges.map((range, at) => at === index ? { ...range, [field]: value } : range) })), []);
  function edit(row: FreightRateView) {
    setEditing(row); setError(''); setNotice(''); setDraft({ region: row.region, served: row.served, amount: row.amountCents === null ? '' : Math.trunc(row.amountCents / 100) + ',' + String(row.amountCents % 100).padStart(2, '0'), days: row.deliveryDays === null ? '' : String(row.deliveryDays), ranges: row.ranges.map(({ startZip, endZip }) => ({ startZip: zip(startZip), endZip: zip(endZip) })) });
    queueMicrotask(() => heading.current?.focus());
  }
  async function save() {
    setError(''); setNotice(''); setBusy(true); const controller = new AbortController(); saveController.current = controller;
    try {
      const amountCents = draft.served ? Number(filterPrice(draft.amount.trim())) : null, deliveryDays = draft.served ? Number(draft.days) : null;
      if (draft.served && (!/^\d+$/.test(draft.days) || deliveryDays! > 3650 || !Number.isSafeInteger(deliveryDays) || amountCents! <= 0)) throw new FormError('Informe um valor positivo de frete e um prazo inteiro de 0 a 3650 dias.');
      const body = { region: draft.region.trim(), served: draft.served, amountCents, deliveryDays, ranges: draft.ranges, ...(editing ? { version: editing.version } : {}) };
      await request<FreightRateView>('/admin/freight-rates' + (editing ? '/' + editing.id : ''), editing ? 'PATCH' : 'POST', body, true, controller.signal);
      if (alive.current) { setNotice(editing ? 'Configuração de frete atualizada. Pedidos já criados mantêm os valores originais.' : 'Região cadastrada. Confira a cobertura na lista.'); setEditing(undefined); setDraft(blank()); setPage(1); setRevision(value => value + 1); }
    } catch (cause) { if (alive.current && !controller.signal.aborted) setError(failure(cause)); }
    finally { if (alive.current) setBusy(false); }
  }
  return <section className="account-card freight-panel"><h2>Frete e cobertura</h2><p>Cadastre as faixas de CEP atendidas, o valor e o prazo de entrega. Sem configuração, o CEP não é atendido. Regiões não atendidas ficam sem preço e prazo.</p>
    {error ? <p role="alert">{error}</p> : null}{notice ? <p role="status">{notice}</p> : null}
    <form aria-label="Configurar frete" autoComplete="off" onSubmit={event => { event.preventDefault(); void save(); }}>
      <h3 ref={heading} tabIndex={-1}>{editing ? 'Editar região — versão ' + editing.version : 'Cadastrar região'}</h3>
      <label>Nome da região<input required maxLength={100} value={draft.region} disabled={busy} onChange={event => setDraft({ ...draft, region: event.target.value })} /></label>
      <label className="freight-check"><input type="checkbox" checked={draft.served} disabled={busy} onChange={event => setDraft({ ...draft, served: event.target.checked })} />Esta região é atendida</label>
      <label>Valor do frete em reais<input required={draft.served} disabled={busy || !draft.served} inputMode="decimal" maxLength={20} value={draft.amount} onChange={event => setDraft({ ...draft, amount: event.target.value })} /></label>
      <label>Prazo estimado em dias<input required={draft.served} disabled={busy || !draft.served} type="number" min="0" max="3650" step="1" value={draft.days} onChange={event => setDraft({ ...draft, days: event.target.value })} /></label>
      <p>Use o prazo definido para a operação. Alterações de frete precisam de novo aceite nas finalizações em andamento.</p>
      {draft.ranges.map((range, index) => <fieldset key={index}><legend>Faixa {index + 1}</legend><label>CEP inicial da faixa {index + 1}<input required inputMode="numeric" pattern="[0-9]{5}-?[0-9]{3}" maxLength={9} value={range.startZip} disabled={busy} onChange={event => changeRange(index, 'startZip', event.target.value)} /></label><label>CEP final da faixa {index + 1}<input required inputMode="numeric" pattern="[0-9]{5}-?[0-9]{3}" maxLength={9} value={range.endZip} disabled={busy} onChange={event => changeRange(index, 'endZip', event.target.value)} /></label><button type="button" className="secondary" disabled={busy || draft.ranges.length === 1} onClick={() => setDraft({ ...draft, ranges: draft.ranges.filter((_range, at) => at !== index) })}>Remover faixa {index + 1}</button></fieldset>)}
      <div className="freight-actions"><button type="button" className="secondary" disabled={busy || draft.ranges.length >= 100} onClick={() => setDraft({ ...draft, ranges: [...draft.ranges, { startZip: '', endZip: '' }] })}>Adicionar faixa de CEP</button><button disabled={busy}>{busy ? 'Salvando…' : 'Salvar configuração'}</button>{editing ? <button type="button" className="secondary" disabled={busy} onClick={() => { setEditing(undefined); setDraft(blank()); setError(''); }}>Cancelar edição</button> : null}</div>
    </form>
    <h3>Regiões cadastradas</h3><button type="button" className="secondary" disabled={busy} onClick={() => { setError(''); setRevision(value => value + 1); }}>Atualizar lista de frete</button>
    {!data ? loading ? <p role="status">Conferindo regiões…</p> : <p>Lista indisponível. Use Atualizar lista de frete para conferir novamente.</p> : !data.items.length ? <p>Nenhuma faixa cadastrada. Sem tabela, nenhum CEP é atendido.</p> : data.items.map(row => <article aria-label={row.region} key={row.id}><h4>{row.region}</h4><p>{row.served ? `${price(row.amountCents!)} · prazo informado: ${row.deliveryDays} dias` : 'Região não atendida'} · versão {row.version}</p>{row.ranges.map(range => <p key={range.id}>{zip(range.startZip)} até {zip(range.endZip)}</p>)}<button type="button" disabled={busy} onClick={() => edit(row)}>Editar frete de {row.region}</button></article>)}
    {data ? <div className="freight-actions" aria-label="Páginas de regiões"><button type="button" className="secondary" disabled={busy || page <= 1} onClick={() => setPage(page - 1)}>Página anterior</button><p>Página {page} · {data.total} regiões</p><button type="button" className="secondary" disabled={busy || page * data.pageSize >= data.total} onClick={() => setPage(page + 1)}>Próxima página</button></div> : null}
  </section>;
}
