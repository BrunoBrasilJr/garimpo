import { createHash } from 'node:crypto';
import type { StockPage, StockEditionView, StockMovementView, StockAdjustmentResult } from '@garimpo/contracts';
import type { Catalog } from '../catalog/service.ts';
import type { Prisma } from '../../persistence/client.ts';
import { CatalogError, missing } from '../catalog/errors.ts';
import { requireKnown } from '../catalog/lifecycle.ts';
import { idempotent } from '../../core/idempotency.ts';
import { serializable } from '../../persistence/transaction.ts';
import { appendAudit } from '../../core/audit.ts';
import { enqueue } from '../../core/outbox.ts';
import { adjustedStock, lowStock } from './rules.ts';
import { availability, availabilityReturned } from '../engagement/availability.ts';

const movementInclude = { actor: { select: { name: true } } } satisfies Prisma.StockMovementInclude;
function movementView(row: Prisma.StockMovementGetPayload<{ include: typeof movementInclude }>): StockMovementView {
  return { id: row.id, offerId: row.offerId, offerVersion: row.offerVersion, deltaOnHand: row.deltaOnHand, balanceBefore: row.balanceBefore,
    balanceAfter: row.balanceAfter, reason: row.reason, actorName: row.actor?.name ?? null, createdAt: row.createdAt.toISOString() };
}
export class Inventory {
  readonly catalog: Catalog;
  constructor(catalog: Catalog) { this.catalog = catalog; }
  async adjust(access: string, offerId: string, delta: number, reason: string, key: string): Promise<StockAdjustmentResult> {
    const { db, clock } = this.catalog, actor = await this.catalog.staff(db, access);
    const result = await idempotent(db, { actorScope: actor.id, operation: 'INVENTORY.ADJUST', key, payload: { offerId, delta, reason } }, async tx => {
      await this.catalog.staff(tx, access);
      const first = await tx.offer.findUnique({ where: { id: offerId } }); if (!first) throw missing();
      await tx.$queryRaw`SELECT id FROM "Edition" WHERE id = ${first.editionId}::uuid FOR UPDATE`;
      await tx.$queryRaw`SELECT id FROM "Offer" WHERE id = ${offerId}::uuid FOR UPDATE`;
      const offer = await tx.offer.findUniqueOrThrow({ where: { id: offerId } });
      const beforeAvailability = await availability(tx, offer.editionId);
      const stockOnHand = adjustedStock(offer.kind, offer.stockOnHand, delta);
      if (delta < 0) {
        const snapshot = requireKnown(await this.catalog.commercialBindings.inspect(tx, offer.editionId, [offerId]), [offerId]);
        if (stockOnHand < snapshot.offers[offerId]!.protectedQuantity) throw new CatalogError(409, 'STOCK_COMMERCIALLY_BOUND', 'Resolva a unidade reservada ou comprometida antes de registrar perda, avaria ou redução.');
      }
      const updated = await tx.offer.update({ where: { id: offerId }, data: { stockOnHand, version: { increment: 1 } } });
      const originKey = 'ADJUST:' + createHash('sha256').update(JSON.stringify([actor.id, offerId, key])).digest('hex');
      const movement = await tx.stockMovement.create({ data: { offerId, offerVersion: updated.version, deltaOnHand: delta,
        balanceBefore: offer.stockOnHand, balanceAfter: stockOnHand, reason, originKey, actorId: actor.id, createdAt: clock.now() } });
      await appendAudit(tx, { actorId: actor.id, action: 'INVENTORY.ADJUSTED', targetType: 'OFFER', targetId: offerId,
        result: 'SUCCESS', reason: 'EXPLICIT_STOCK_ADJUSTMENT', changes: { delta, before: offer.stockOnHand, after: stockOnHand, reason } }, clock);
      await enqueue(tx, { type: 'INVENTORY.STOCK_CHANGED', aggregateId: offerId,
        payload: { offerId, editionId: offer.editionId, before: offer.stockOnHand, after: stockOnHand } }, clock);
      await availabilityReturned(tx, offer.editionId, beforeAvailability, clock);
      return movement.id;
    }, clock);
    const movement = await db.stockMovement.findUniqueOrThrow({ where: { id: result.resultRef }, include: movementInclude });
    const offer = await db.offer.findUniqueOrThrow({ where: { id: offerId } });
    return { movement: movementView(movement), stockOnHand: offer.stockOnHand, version: offer.version };
  }
  async threshold(access: string, editionId: string, value: number) {
    return serializable(this.catalog.db, async tx => {
      const actor = await this.catalog.staff(tx, access);
      if (!Number.isSafeInteger(value) || value < 0 || value > 2147483647) throw new CatalogError(422, 'INVALID_THRESHOLD', 'Informe um limiar inteiro não negativo.');
      const rows = await tx.$queryRaw<{ id: string }[]>`SELECT id FROM "Edition" WHERE id = ${editionId}::uuid FOR UPDATE`;
      if (!rows.length) throw missing();
      const edition = await tx.edition.update({ where: { id: editionId }, data: { lowStockNewThreshold: value } });
      await appendAudit(tx, { actorId: actor.id, action: 'INVENTORY.THRESHOLD_UPDATED', targetType: 'EDITION', targetId: editionId,
        result: 'SUCCESS', reason: 'EXPLICIT_THRESHOLD', changes: { lowStockNewThreshold: value } }, this.catalog.clock);
      // A dashboard threshold does not enqueue any customer notification.
      return { editionId: edition.id, lowStockNewThreshold: edition.lowStockNewThreshold };
    });
  }
  async list(access: string, query: { page: number; pageSize: number; editionId?: string | undefined; lowStock?: boolean | undefined; includeInactive?: boolean | undefined }): Promise<StockPage> {
    return serializable(this.catalog.db, async tx => {
      await this.catalog.staff(tx, access);
      const editions = await tx.edition.findMany({ where: { ...(query.editionId ? { id: query.editionId } : {}), ...(query.includeInactive || query.editionId ? {} : { active: true }) },
        orderBy: [{ title: 'asc' }, { id: 'asc' }], include: { offers: { orderBy: [{ kind: 'asc' }, { id: 'asc' }], include: { _count: { select: { movements: true } } } } } });
      const rows: StockEditionView[] = [];
      for (const edition of editions) {
        const ids = edition.offers.map(offer => offer.id), supplied = await this.catalog.commercialBindings.inspect(tx, edition.id, ids);
        const snapshot = supplied.status === 'KNOWN' ? requireKnown(supplied, ids) : supplied;
        const offers = edition.offers.map(offer => {
          const binding = snapshot.status === 'KNOWN' ? snapshot.offers[offer.id]! : null;
          if (binding && binding.protectedQuantity > offer.stockOnHand) throw new CatalogError(503, 'STOCK_BINDINGS_INCONSISTENT', 'Não foi possível conciliar estoque e vínculos comerciais.');
          return { id: offer.id, kind: offer.kind, active: offer.active, version: offer.version, stockOnHand: offer.stockOnHand,
            reservedQuantity: binding?.reservedQuantity ?? null, protectedQuantity: binding?.protectedQuantity ?? null,
            availableQuantity: !edition.active || !offer.active ? 0 : binding ? offer.stockOnHand - binding.protectedQuantity : null,
            movements: [] as StockMovementView[], movementCount: offer._count.movements };
        });
        const fresh = offers.filter(offer => offer.kind === 'NEW'), used = offers.filter(offer => offer.kind === 'USED');
        const total = (items: typeof offers) => items.reduce((sum, offer) => sum + offer.stockOnHand, 0);
        const available = (items: typeof offers): number | null => items.some(item => item.availableQuantity === null) ? null : items.reduce((sum, offer) => sum + offer.availableQuantity!, 0);
        const newPhysical = total(fresh), usedPhysical = total(used), newAvailable = available(fresh), usedAvailable = available(used);
        const row: StockEditionView = { id: edition.id, title: edition.title, active: edition.active, lowStockNewThreshold: edition.lowStockNewThreshold,
          bindingsStatus: snapshot.status, newPhysical, usedPhysical, newAvailable, usedAvailable,
          lowStockNew: edition.active ? lowStock(newAvailable, newPhysical, edition.lowStockNewThreshold) : false,
          lowStockUsed: edition.active ? lowStock(usedAvailable, usedPhysical, 0) : false, offers };
        if (!query.lowStock || row.lowStockNew === true || row.lowStockUsed === true) rows.push(row);
      }
      const items = rows.slice((query.page - 1) * query.pageSize, query.page * query.pageSize);
      // Fetch only the bounded page's latest history; counts make truncation explicit.
      for (const row of items) for (const offer of row.offers) {
        const movements = await tx.stockMovement.findMany({ where: { offerId: offer.id }, orderBy: [{ offerVersion: 'desc' }, { id: 'desc' }], take: 20, include: movementInclude });
        offer.movements = movements.map(movementView);
      }
      return { items, page: query.page, pageSize: query.pageSize, total: rows.length, totalPages: Math.ceil(rows.length / query.pageSize) };
    });
  }
}
