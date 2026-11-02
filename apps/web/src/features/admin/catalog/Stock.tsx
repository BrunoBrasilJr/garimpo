import { useEffect, useRef, useState } from 'react';
import type { StockPage } from '@garimpo/contracts';
import { readableError } from '../../account/client';
import { ActionForm, Input, value } from './Forms';
import { catalogRequest, commandKey } from './client';

const quantity = (value: number | null) => value === null ? 'Não conferido' : String(value);
export function Stock({ editionId, revision, changed }: { editionId: string; revision: number; changed: () => void }) {
  const [data, setData] = useState<StockPage>(), [error, setError] = useState('');
  useEffect(() => {
    const controller = new AbortController();
    catalogRequest<StockPage>('/admin/stock?editionId=' + editionId, 'GET', undefined, undefined, controller.signal)
      .then(result => { if (!controller.signal.aborted) { setData(result); setError(''); } }).catch(cause => { if (!controller.signal.aborted) setError(readableError(cause)); });
    return () => controller.abort();
  }, [editionId, revision]);
  const row = data?.items[0];
  return <section className="catalog-section"><h2>Estoque e movimentações</h2>{error ? <p role="alert">{error}</p> : null}
    {!row ? <p role="status">Carregando estoque…</p> : <>
      <p>Novos: {row.newPhysical} físicos, {quantity(row.newAvailable)} disponíveis. Usados: {row.usedPhysical} físicos, {quantity(row.usedAvailable)} disponíveis.</p>
      {row.bindingsStatus === 'UNAVAILABLE' ? <p className="catalog-warning">Reservas e saldo disponível ainda não conferidos. Entradas são permitidas; reduções e exclusões ficam protegidas.</p> : null}
      {row.lowStockNew === true ? <p role="status">Novos no limite de reposição.</p> : null}{row.lowStockUsed === true ? <p role="status">Nenhum usado disponível nesta edição.</p> : null}
      <ActionForm title="Limiar de reposição dos novos" submit="Salvar limiar" onSubmit={async data => {
        await catalogRequest('/admin/editions/' + editionId + '/low-stock', 'PATCH', { lowStockNewThreshold: Number(value(data, 'threshold')) }); changed();
      }}><Input label="Avisar quando disponível for menor ou igual a" name="threshold" type="number" min={0} max={2147483647} step={1} required defaultValue={row.lowStockNewThreshold} /></ActionForm>
      <p>Os avisos ficam neste painel.</p>
      {row.offers.map((offer, index) => <div key={offer.id} className="catalog-subcard"><h3>{offer.kind === 'NEW' ? 'Novos' : 'Usado'} · oferta {index + 1}</h3>
        <p>Físico: {offer.stockOnHand} · reservado: {quantity(offer.reservedQuantity)} · disponível: {quantity(offer.availableQuantity)}</p>
        <Adjustment id={offer.id} changed={changed} />
        <h4>Últimas movimentações ({offer.movements.length} de {offer.movementCount})</h4>
        {!offer.movements.length ? <p>Nenhuma movimentação registrada.</p> : <ol>{offer.movements.map(item => <li key={item.id}>
          <strong>{item.deltaOnHand > 0 ? '+' : ''}{item.deltaOnHand}</strong> · {item.balanceBefore} → {item.balanceAfter} · {item.reason}<br />
          {item.actorName ?? 'Consolidação inicial'} · {new Date(item.createdAt).toLocaleString('pt-BR')}
        </li>)}</ol>}
      </div>)}
    </>}
  </section>;
}
function Adjustment({ id, changed }: { id: string; changed: () => void }) {
  const key = useRef<{ signature: string; key: string } | null>(null);
  return <ActionForm title="Ajustar quantidade física" submit="Registrar ajuste" reset onSubmit={async data => {
    const body = { delta: Number(value(data, 'delta')), reason: value(data, 'reason') };
    await catalogRequest('/admin/offers/' + id + '/stock-adjustments', 'POST', body, commandKey(key, body)); key.current = null; changed();
  }}><Input label="Variação da quantidade" name="delta" type="number" step={1} min={-2147483647} max={2147483647} required defaultValue={1} hint="Positivo para entrada; negativo para redução. O estoque final não pode ser negativo." />
    <Input label="Motivo do ajuste" name="reason" required maxLength={500} /></ActionForm>;
}
