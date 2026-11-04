import { useCallback, useEffect, useRef, useState } from 'react';
import { guestTag } from '@garimpo/contracts';
import type { AftersalesOverview, ExchangeView, ReturnView } from '@garimpo/contracts';
import { readableError, request } from '../account/client';

export type SupportCase = ReturnView | ExchangeView;
export type Selection = { kind: 'returns' | 'exchanges'; id: string };
export const isReturn = (row: SupportCase): row is ReturnView => 'refund' in row;

export function useSupport(accountId: string, orderId: string, internal: boolean, refreshOrder: () => Promise<void>) {
  const [overview, setOverview] = useState<AftersalesOverview>();
  const [row, setRow] = useState<SupportCase>();
  const [selection, setSelection] = useState<Selection>();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const mutation = useRef<AbortController | null>(null);
  const intent = useRef<{ path: string; body: string; key: string } | null>(null);
  const overviewPath = (internal ? '/admin' : '') + '/orders/' + orderId + '/aftersales';
  const fetchOverview = useCallback((signal?: AbortSignal) => request<AftersalesOverview>(overviewPath, 'GET', undefined, true, signal, { accountId }), [accountId, overviewPath]);
  const casePath = selection ? (internal ? '/admin/' : '/me/') + selection.kind + '/' + selection.id : '';
  const fetchCase = useCallback((signal?: AbortSignal) => casePath ? request<SupportCase>(casePath, 'GET', undefined, true, signal, { accountId }) : Promise.resolve(undefined), [accountId, casePath]);

  useEffect(() => {
    const controller = new AbortController();
    void fetchOverview(controller.signal).then(value => { if (!controller.signal.aborted) setOverview(value); })
      .catch(cause => { if (!controller.signal.aborted) setError(readableError(cause)); });
    return () => controller.abort();
  }, [fetchOverview]);

  useEffect(() => {
    const controller = new AbortController();
    void fetchCase(controller.signal).then(value => { if (!controller.signal.aborted) setRow(value); })
      .catch(cause => { if (!controller.signal.aborted) setError(readableError(cause)); });
    return () => controller.abort();
  }, [fetchCase]);
  useEffect(() => () => mutation.current?.abort(), []);

  function select(value: Selection) {
    if (selection?.id === value.id) return;
    setRow(undefined); setSelection(value); setError(''); setNotice('');
  }

  async function update<T>(path: string, body: unknown, keyNeeded = false, nextKind?: Selection['kind']) {
    if (mutation.current) return;
    const controller = new AbortController();
    mutation.current = controller;
    setBusy(true); setError(''); setNotice('');
    if (keyNeeded) {
      const json = JSON.stringify(body);
      if (intent.current?.path !== path || intent.current.body !== json) intent.current = { path, body: json, key: 'support.' + guestTag() };
    }
    try {
      const value = await request<T>(path, 'POST', body, true, controller.signal, {
        accountId, ...(keyNeeded && intent.current ? { idempotencyKey: intent.current.key } : {})
      });
      if (controller.signal.aborted) return;
      intent.current = null;
      if (nextKind) {
        const next = value as SupportCase;
        setSelection({ kind: nextKind, id: next.id }); setRow(next);
      }
      const [updated, selected] = await Promise.all([fetchOverview(controller.signal), nextKind ? Promise.resolve(undefined) : fetchCase(controller.signal), refreshOrder()]);
      if (controller.signal.aborted) return;
      setOverview(updated);
      if (selected) setRow(selected);
      setNotice('Alteração registrada.');
      return value;
    } catch (cause) { if (!controller.signal.aborted) setError(readableError(cause)); }
    finally { mutation.current = null; if (!controller.signal.aborted) setBusy(false); }
  }

  async function reload() {
    setError('');
    try {
      const [updated, selected] = await Promise.all([fetchOverview(), fetchCase()]);
      setOverview(updated); setRow(selected);
    } catch (cause) { setError(readableError(cause)); }
  }
  return { overview, row, selection, busy, error, notice, select, update, reload };
}
