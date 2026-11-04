import { useCallback, useEffect, useRef, useState } from 'react';
import type { OrderDetail, OrderPage } from '@garimpo/contracts';
import type { PurchaseRequest } from '../checkout/useFlow';
export interface OrderFilters { status: string; fromDate: string; throughDate: string; customerEmail: string }
export const emptyFilters: OrderFilters = { status: '', fromDate: '', throughDate: '', customerEmail: '' };
export function useHistory(request: PurchaseRequest, prefix: string, id: string, message: (cause: unknown) => string) {
  const [filters, setFilters] = useState(emptyFilters), [page, setPage] = useState(1), [paymentPage, setPaymentPage] = useState(1), [refundPage, setRefundPage] = useState(1), [list, setList] = useState<OrderPage>(), [detail, setDetail] = useState<OrderDetail>(), [loading, setLoading] = useState(true), [error, setError] = useState('');
  const controller = useRef<AbortController | null>(null), alive = useRef(true), generation = useRef(0);
  const load = useCallback(async () => {
    const epoch = ++generation.current; controller.current?.abort(); const operation = new AbortController(); controller.current = operation; setLoading(true); setError('');
    try {
      if (id && !/^[a-f0-9]{8}-(?:[a-f0-9]{4}-){3}[a-f0-9]{12}$/i.test(id)) throw new Error('INVALID_ORDER_REFERENCE');
      const query = new URLSearchParams({ page: String(page), pageSize: '10' }); for (const [key, value] of Object.entries(filters)) if (value && (key !== 'customerEmail' || prefix === '/admin/orders')) query.set(key, value);
      const [rows, selected] = await Promise.all([request<OrderPage>(prefix + '?' + query, 'GET', undefined, operation.signal), id ? request<OrderDetail>(prefix + '/' + id + '?paymentPage=' + paymentPage + '&refundPage=' + refundPage, 'GET', undefined, operation.signal) : Promise.resolve(undefined)]);
      if (alive.current && epoch === generation.current) { setList(rows); setDetail(selected); }
    } catch (cause) { if (alive.current && epoch === generation.current && !operation.signal.aborted) { setList(undefined); setDetail(undefined); setError(cause instanceof Error && cause.message === 'INVALID_ORDER_REFERENCE' ? 'O pedido não pôde ser identificado. Volte à lista para selecionar seu pedido.' : cause && typeof cause === 'object' && 'code' in cause && cause.code === 'CART_RESOURCE_NOT_FOUND' ? 'Pedido não encontrado nesta conta.' : message(cause)); } }
    finally { if (alive.current && epoch === generation.current) setLoading(false); }
  }, [request, prefix, id, page, filters, paymentPage, refundPage, message]);
  useEffect(() => { alive.current = true; void load(); return () => { alive.current = false; generation.current++; controller.current?.abort(); }; }, [load]);
  useEffect(() => { setPaymentPage(1); setRefundPage(1); }, [id]);
  function apply(next: OrderFilters) { setPage(1); setFilters(next); }
  return { list, detail, loading, error, page, setPage, filters, apply, paymentPage, setPaymentPage, refundPage, setRefundPage, reload: load };
}
