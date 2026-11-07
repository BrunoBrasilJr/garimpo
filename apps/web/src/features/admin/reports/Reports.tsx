import { useEffect, useRef, useState } from 'react';
import type { AccountView, RankingReport, SalesReport } from '@garimpo/contracts';
import { readableError, request } from '../../account/client';
import { price } from '../../catalog/api';
import { dateLabel } from '../../orders/labels';

type Result = { sales: SalesReport; genres: RankingReport; products: RankingReport };
const date = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
const signedMoney = (cents: number) => cents < 0 ? '−' + price(-cents) : price(cents);

export default function Reports({ user }: { user: AccountView }) {
  const [from, setFrom] = useState(() => date().slice(0, 8) + '01'), [to, setTo] = useState(date);
  const [result, setResult] = useState<Result>(), [busy, setBusy] = useState(false), [error, setError] = useState('');
  const [genrePage, setGenrePage] = useState(1), [productPage, setProductPage] = useState(1);
  const operation = useRef<AbortController | null>(null), heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => () => operation.current?.abort(), []);
  async function load(pageGenres = 1, pageProducts = 1, frozen = false) {
    operation.current?.abort();
    const controller = new AbortController(); operation.current = controller;
    setBusy(true); setError('');
    try {
      const query = new URLSearchParams({ from: frozen && result ? result.sales.from : from, to: frozen && result ? result.sales.to : to });
      if (frozen && result) query.set('asOf', result.sales.asOf);
      const sales = await request<SalesReport>('/admin/reports/sales?' + query, 'GET', undefined, true, controller.signal, { accountId: user.id });
      query.set('asOf', sales.asOf);
      const [genres, products] = await Promise.all([
        request<RankingReport>('/admin/reports/genres?' + query + '&page=' + pageGenres, 'GET', undefined, true, controller.signal, { accountId: user.id }),
        request<RankingReport>('/admin/reports/products?' + query + '&page=' + pageProducts, 'GET', undefined, true, controller.signal, { accountId: user.id })
      ]);
      if (!controller.signal.aborted) {
        setResult({ sales, genres, products }); setGenrePage(pageGenres); setProductPage(pageProducts);
        heading.current?.focus();
      }
    } catch (cause) { if (!controller.signal.aborted) setError(readableError(cause)); }
    finally { if (!controller.signal.aborted) setBusy(false); }
  }
  if (user.context !== 'STAFF' || user.role !== 'ADMIN') return <section className="account-card"><h2>Acesso restrito</h2><p>Somente administradores consultam os relatórios.</p></section>;
  return <section className="account-card">
    <h2 ref={heading} tabIndex={-1}>Relatórios</h2>
    <form aria-label="Período dos relatórios" onSubmit={event => { event.preventDefault(); void load(); }}>
      <label>Data inicial (São Paulo)<input type="date" value={from} required onChange={event => setFrom(event.target.value)} /></label>
      <label>Data final (São Paulo)<input type="date" value={to} required min={from} onChange={event => setTo(event.target.value)} /></label>
      <button disabled={busy}>Consultar relatórios</button>
    </form>
    {busy ? <p role="status">Apurando os relatórios…</p> : null}{error ? <p role="alert">{error}</p> : null}
    {result ? <>
      <p>Período de {result.sales.from} a {result.sales.to}. Consulta em {dateLabel(result.sales.asOf)}.</p>
      <section aria-label="Eventos financeiros"><h3>Eventos financeiros do período</h3>
        <p>Produtos vendidos {price(result.sales.financial.saleProductsCents)} · frete recebido {price(result.sales.financial.saleShippingCents)}</p>
        <p>Produtos estornados {price(result.sales.financial.refundedProductsCents)} · frete estornado {price(result.sales.financial.refundedShippingCents)}</p>
        <p>Saldo dos produtos {signedMoney(result.sales.financial.netProductsCents)} · saldo do frete {signedMoney(result.sales.financial.netShippingCents)}</p>
        <p>Restituições de pagamentos sem venda {price(result.sales.financial.technicalRefundCents)}</p>
      </section>
      <section aria-label="Ticket médio"><h3>Ticket médio dos pedidos pagos no período</h3>
        <p>{result.sales.cohort.averageTicketCents === null ? 'Sem pedidos mantidos.' : price(result.sales.cohort.averageTicketCents)}</p>
        <p>{result.sales.cohort.retainedOrders} pedidos mantidos · {result.sales.cohort.retainedUnits} unidades · produtos {price(result.sales.cohort.retainedProductsCents)}</p>
        <p>Considera os cancelamentos e devoluções conhecidos na consulta. O frete fica separado.</p>
      </section>
      {([['Gêneros mais vendidos', result.genres, genrePage, true], ['Edições por giro líquido', result.products, productPage, false]] as const).map(([title, ranking, page, genre]) => <section key={title} aria-label={title}>
        <h3>{title}</h3>{ranking.items.length ? <ol start={(page - 1) * ranking.pageSize + 1}>{ranking.items.map(item => <li key={item.id}>
          {item.name} · {item.units} unidades mantidas · {price(item.productCents)}
        </li>)}</ol> : <p>Sem unidades mantidas no período.</p>}
        <p>Página {page} de {Math.max(1, ranking.totalPages)}</p>
        <button type="button" className="secondary" disabled={busy || page <= 1} onClick={() => { void load(genre ? page - 1 : genrePage, genre ? productPage : page - 1, true); }}>Anterior em {title.toLowerCase()}</button>
        <button type="button" className="secondary" disabled={busy || page >= ranking.totalPages} onClick={() => { void load(genre ? page + 1 : genrePage, genre ? productPage : page + 1, true); }}>Próxima em {title.toLowerCase()}</button>
      </section>)}
    </> : null}
  </section>;
}
