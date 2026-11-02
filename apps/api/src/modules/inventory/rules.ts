import type { OfferKind } from '@garimpo/contracts';
import { CatalogError } from '../catalog/errors.ts';

export function adjustedStock(kind: OfferKind, current: number, delta: number) {
  if (!Number.isSafeInteger(delta) || delta === 0 || Math.abs(delta) > 2147483647) throw new CatalogError(422, 'INVALID_STOCK_DELTA', 'Informe um ajuste inteiro diferente de zero.');
  const next = current + delta;
  if (next < 0) throw new CatalogError(409, 'INSUFFICIENT_STOCK', 'O ajuste deixaria o estoque negativo.');
  if (next > 2147483647 || kind === 'USED' && next > 1) throw new CatalogError(422, 'INVALID_STOCK_QUANTITY', 'Novos precisam de quantidade válida; cada usado possui no máximo uma unidade.');
  return next;
}
export function lowStock(available: number | null, physical: number, threshold: number): boolean | null {
  return available === null ? physical <= threshold ? true : null : available <= threshold;
}
