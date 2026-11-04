import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import type { ExchangeView } from '@garimpo/contracts';
import { readableError, request } from '../account/client';
import { price } from '../catalog/api';
import { dateLabel } from '../orders/labels';
import { stateLabel } from './labels';
import { isReturn } from './useSupport';
import type { SupportCase, useSupport } from './useSupport';

export function CaseDetails({ row }: { row: SupportCase }) {
  return <section aria-label="Detalhes do atendimento">
    <h4>{isReturn(row) ? 'Devolução' : 'Troca'} {row.id.slice(0, 8)}</h4>
    <p role="status">{stateLabel(row.state)}</p>
    <p>{row.reason} · {row.items.length} unidade(s)</p>
    {row.postingDueAt ? <p>Prazo de postagem <time dateTime={row.postingDueAt}>{dateLabel(row.postingDueAt)}</time></p> : null}
    {'waitingDueAt' in row && row.waitingDueAt ? <p>Prazo da espera <time dateTime={row.waitingDueAt}>{dateLabel(row.waitingDueAt)}</time></p> : null}
    {row.shipments.map(shipment => <p key={shipment.id}>
      {shipment.kind.includes('REJECTED') ? 'Reenvio do original' : shipment.kind.includes('REPLACEMENT') ? 'Envio do substituto' : 'Retorno'} · {shipment.trackingCode}
      {' · postagem ' + dateLabel(shipment.postedAt)}{shipment.deliveredAt ? ' · entrega ' + dateLabel(shipment.deliveredAt) : ''}
    </p>)}
    {isReturn(row) && row.refund ? <section aria-label="Estorno do atendimento">
      <h5>Estorno {row.refund.status === 'FAILED' ? 'com falha' : row.refund.status === 'PENDING' ? 'pendente' : 'concluído'}</h5>
      <p>Produtos {price(row.refund.productCents)} · frete {price(row.refund.shippingCents)}</p>
      {row.refund.status === 'FAILED' ? <p>A obrigação continua registrada e aguarda nova tentativa.</p> : null}
    </section> : null}
  </section>;
}

export function Evidence({ accountId, row, flow, internal }: { accountId: string; row: SupportCase; flow: ReturnType<typeof useSupport>; internal: boolean }) {
  const [file, setFile] = useState<File>();
  const [preview, setPreview] = useState<{ id: string; url: string }>();
  const [error, setError] = useState('');
  const controller = useRef<AbortController | null>(null);
  useEffect(() => () => controller.current?.abort(), []);
  const base = '/aftersales/' + row.id + '/evidence';
  async function open(id: string) {
    controller.current?.abort();
    const current = new AbortController(); controller.current = current;
    setError('');
    try {
      const blob = await request<Blob>(base + '/' + id, 'GET', undefined, true, current.signal, { accountId, responseBlob: true });
      if (current.signal.aborted) return;
      const reader = new FileReader();
      reader.onload = () => { if (!current.signal.aborted && typeof reader.result === 'string') setPreview({ id, url: reader.result }); };
      reader.onerror = () => { if (!current.signal.aborted) setError('Não foi possível abrir a imagem.'); };
      reader.readAsDataURL(blob);
    } catch (cause) { if (!current.signal.aborted) setError(readableError(cause)); }
  }
  async function upload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!file) return;
    if (file.size > 5_000_000) { setError('A imagem deve ter no máximo 5 MB.'); return; }
    setError('');
    if (await flow.update(base, file)) setFile(undefined);
  }
  const count = row.evidence.filter(item => item.source === (internal ? 'STAFF' : 'CUSTOMER')).length;
  return <section aria-label="Evidências privadas">
    <h5>Evidências privadas</h5><p>{count} de 5 imagens enviadas nesta origem. Formatos JPEG, PNG ou WebP até 5 MB.</p>
    {error ? <p role="alert">{error}</p> : null}
    <form onSubmit={event => { void upload(event); }}>
      <label>Selecionar evidência<input key={file ? 'chosen' : 'empty'} type="file" accept="image/jpeg,image/png,image/webp" disabled={flow.busy || count >= 5} onChange={event => setFile(event.currentTarget.files?.[0])} /></label>
      {file ? <p>{file.name}</p> : null}<button disabled={!file || flow.busy || count >= 5}>Enviar evidência</button>
    </form>
    {row.evidence.map((item, index) => <button key={item.id} type="button" className="secondary" onClick={() => { void open(item.id); }}>Ver evidência {index + 1} · {item.source === 'STAFF' ? 'equipe' : 'cliente'}</button>)}
    {preview ? <figure><img src={preview.url} alt="Evidência privada selecionada" /><button type="button" className="secondary" onClick={() => setPreview(undefined)}>Fechar imagem</button></figure> : null}
  </section>;
}

export function CustomerCaseActions({ row, flow }: { row: SupportCase; flow: ReturnType<typeof useSupport> }) {
  const [tracking, setTracking] = useState(''), [when, setWhen] = useState(''), [reason, setReason] = useState('');
  const returns = isReturn(row);
  const prefix = '/' + (returns ? 'returns' : 'exchanges') + '/' + row.id;
  const canConvert = !returns && ['REQUESTED', 'AWAITING_POSTING', 'IN_TRANSIT', 'WAITING_SUBSTITUTE'].includes(row.state)
    && !row.substitutes.some(item => item.state === 'OFFERED' || item.state === 'ACCEPTED');
  return <>
    {row.state === 'AWAITING_POSTING' ? <form onSubmit={event => {
      event.preventDefault(); if (when) void flow.update(prefix + '/posting', { version: row.version, trackingCode: tracking, postedAt: new Date(when).toISOString() });
    }} aria-label="Informar postagem do retorno">
      <label>Código de rastreamento do retorno<input required value={tracking} maxLength={120} onChange={event => setTracking(event.target.value)} /></label>
      <label>Data e hora efetivas da postagem<input required type="datetime-local" step="0.001" value={when} onChange={event => setWhen(event.target.value)} /></label>
      <button disabled={flow.busy}>Informar postagem</button>
    </form> : null}
    {!returns ? <Substitutes row={row} flow={flow} /> : null}
    {canConvert ? <form onSubmit={event => { event.preventDefault(); void flow.update(prefix + '/convert-to-return', { version: row.version, reason }); }}>
      <label>Motivo da conversão<input value={reason} required minLength={3} maxLength={500} onChange={event => setReason(event.target.value)} /></label>
      <button disabled={flow.busy}>Converter em devolução</button>
    </form> : null}
  </>;
}

function Substitutes({ row, flow }: { row: ExchangeView; flow: ReturnType<typeof useSupport> }) {
  return <section aria-label="Ofertas de substituto"><h5>Ofertas de substituto</h5>
    {!row.substitutes.length ? <p>Nenhum substituto ofertado.</p> : row.substitutes.map(offer => <article key={offer.id}>
      <p>{offer.equivalenceReason} · {stateLabel(offer.state)}</p>
      <p>Prazo da oferta <time dateTime={offer.expiresAt}>{dateLabel(offer.expiresAt)}</time></p>
      {offer.state === 'OFFERED' ? <div>{(['ACCEPT', 'REJECT'] as const).map(decision => <button type="button" key={decision}
        disabled={flow.busy} onClick={() => { void flow.update('/exchanges/' + row.id + '/substitute-offers/' + offer.id + '/response', { version: row.version, decision }); }}>
        {decision === 'ACCEPT' ? 'Aceitar substituto' : 'Recusar substituto'}</button>)}</div> : null}
    </article>)}
  </section>;
}
