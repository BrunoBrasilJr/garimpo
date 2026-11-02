import type { Database, Prisma } from '../../persistence/client.ts';
import { CatalogError } from './errors.ts';

export interface OfferBindings { reservedQuantity: number; protectedQuantity: number }
export type CommercialSnapshot = { status: 'UNAVAILABLE' } | { status: 'KNOWN'; hasHistory: boolean; offers: Record<string, OfferBindings> };
/** Real adapters must read commercial state in the caller's transaction. No external I/O. */
export interface CommercialBindings {
  inspect(tx: Prisma.TransactionClient | Database, editionId: string, offerIds: string[]): Promise<CommercialSnapshot>;
}
export const unavailableCommercialBindings = Object.freeze<CommercialBindings>({ async inspect() { return { status: 'UNAVAILABLE' }; } });
export function requireKnown(snapshot: CommercialSnapshot, offerIds: string[]) {
  if (snapshot.status !== 'KNOWN' || typeof snapshot.hasHistory !== 'boolean' || !snapshot.offers || typeof snapshot.offers !== 'object') throw new CatalogError(503, 'COMMERCIAL_BINDINGS_UNAVAILABLE', 'Não foi possível conferir reservas e histórico. A redução ou exclusão está protegida; você pode inativar o item.');
  for (const id of offerIds) {
    const value = snapshot.offers[id];
    if (!Object.hasOwn(snapshot.offers, id) || !value || !Number.isSafeInteger(value.reservedQuantity) || !Number.isSafeInteger(value.protectedQuantity) || value.reservedQuantity < 0 || value.protectedQuantity < value.reservedQuantity) {
      throw new CatalogError(503, 'COMMERCIAL_BINDINGS_UNAVAILABLE', 'Não foi possível conferir os vínculos comerciais deste item.');
    }
  }
  return snapshot;
}
export async function requireUnbound(port: CommercialBindings, tx: Prisma.TransactionClient, editionId: string, offerIds: string[]) {
  const snapshot = requireKnown(await port.inspect(tx, editionId, offerIds), offerIds);
  if (snapshot.hasHistory || offerIds.some(id => snapshot.offers[id]!.protectedQuantity > 0)) {
    throw new CatalogError(409, 'COMMERCIAL_REFERENCE', 'Este item possui histórico ou unidade vinculada. Inative para preservar os registros.');
  }
}
