import type { RankingReport, SalesReport } from '@garimpo/contracts';
import type { Accounts } from '../accounts/service.ts';
import { staff } from '../accounts/blocking-helpers.ts';
import { CartError } from '../cart/errors.ts';
import { afterDay, dayStart } from '../orders/calendar.ts';
import { serializable } from '../../persistence/transaction.ts';
import type { ReportQuery } from './validation.ts';

interface CohortRow { orderId: string; editionId: string; title: string; genreId: string; genreName: string; retained: bigint; productCents: bigint }
function exact(value: bigint) {
  const number = Number(value);
  if (!Number.isSafeInteger(number)) throw new CartError(503, 'REPORT_TOTAL_OUT_OF_RANGE', 'O total excedeu o intervalo exato deste relatório.');
  return number;
}
export class Reports {
  readonly accounts: Accounts;
  constructor(accounts: Accounts) { this.accounts = accounts; }
  async read(access: string, input: ReportQuery, mode: 'sales'): Promise<SalesReport>;
  async read(access: string, input: ReportQuery, mode: 'genres' | 'products'): Promise<RankingReport>;
  async read(access: string, input: ReportQuery, mode: 'sales' | 'genres' | 'products'): Promise<SalesReport | RankingReport>;
  async read(access: string, input: ReportQuery, mode: 'sales' | 'genres' | 'products'): Promise<SalesReport | RankingReport> {
    const now = this.accounts.clock.now(), asOf = input.asOf ? new Date(input.asOf) : now;
    if (asOf > now || asOf.getUTCFullYear() < 1900) throw new CartError(422, 'INVALID_REPORT_ASOF', 'O instante de consulta deve estar no passado ou no presente.');
    const start = dayStart(input.from), end = afterDay(input.to);
    const period = { from: input.from, to: input.to, asOf: asOf.toISOString() };
    return serializable(this.accounts.db, async tx => {
      await staff(this.accounts, tx, access, true);
      const rows = await tx.$queryRaw<CohortRow[]>`
        SELECT o.id AS "orderId", i."editionId",
          i."productSnapshot"->>'title' AS title,
          i."productSnapshot"->>'primaryGenreId' AS "genreId",
          i."productSnapshot"->>'primaryGenre' AS "genreName",
          count(u.id) FILTER (WHERE NOT EXISTS (
            SELECT 1 FROM "CancellationRequest" c WHERE c."orderId"=o.id AND u.id=ANY(c."unitIds") AND c."createdAt"<=${asOf}
          ) AND NOT EXISTS (
            SELECT 1 FROM "ReturnItem" ri JOIN "ReturnRequest" r ON r.id=ri."returnId"
            WHERE ri."orderUnitId"=u.id AND r."refundAuthorizedAt"<=${asOf} AND ri.inspection IS DISTINCT FROM 'REJECTED'
          )) AS retained,
          coalesce(sum(u."netPaidCents") FILTER (WHERE NOT EXISTS (
            SELECT 1 FROM "CancellationRequest" c WHERE c."orderId"=o.id AND u.id=ANY(c."unitIds") AND c."createdAt"<=${asOf}
          ) AND NOT EXISTS (
            SELECT 1 FROM "ReturnItem" ri JOIN "ReturnRequest" r ON r.id=ri."returnId"
            WHERE ri."orderUnitId"=u.id AND r."refundAuthorizedAt"<=${asOf} AND ri.inspection IS DISTINCT FROM 'REJECTED'
          )),0)::bigint AS "productCents"
        FROM "FinancialEvent" sale JOIN "Order" o ON o.id=sale."orderId"
        JOIN "OrderItem" i ON i."orderId"=o.id JOIN "OrderUnit" u ON u."orderItemId"=i.id
        WHERE sale.type='SALE' AND sale."occurredAt">=${start} AND sale."occurredAt"<${end} AND sale."occurredAt"<=${asOf}
        GROUP BY o.id, i.id
      `;
      if (mode !== 'sales') {
        const ranks = new Map<string, { id: string; name: string; units: bigint; productCents: bigint }>();
        for (const row of rows) {
          if (row.retained === 0n) continue;
          const id = mode === 'genres' ? row.genreId : row.editionId, name = mode === 'genres' ? row.genreName : row.title;
          if (!id || !name) throw new CartError(503, 'REPORT_SNAPSHOT_INCOMPLETE', 'O histórico de classificação está incompleto.');
          const old = ranks.get(id) ?? { id, name, units: 0n, productCents: 0n };
          old.units += row.retained; old.productCents += row.productCents; ranks.set(id, old);
        }
        const sorted = [...ranks.values()].sort((a, b) => a.units === b.units ? a.id.localeCompare(b.id) : a.units > b.units ? -1 : 1);
        return { ...period, page: input.page, pageSize: input.pageSize, total: sorted.length, totalPages: Math.ceil(sorted.length / input.pageSize),
          items: sorted.slice((input.page - 1) * input.pageSize, input.page * input.pageSize).map(row => ({ ...row, units: exact(row.units), productCents: exact(row.productCents) })) };
      }
      const events = await tx.financialEvent.groupBy({
        by: ['type'], where: { occurredAt: { gte: start, lt: end, lte: asOf } }, _sum: { productCents: true, shippingCents: true }
      });
      const amount = (type: string, field: 'productCents' | 'shippingCents') => {
        const value = events.find(event => event.type === type)?._sum[field] ?? 0;
        if (typeof value === 'number' && !Number.isSafeInteger(value)) throw new CartError(503, 'REPORT_TOTAL_OUT_OF_RANGE', 'O total excedeu o intervalo exato deste relatório.');
        return BigInt(value);
      };
      const saleProducts = amount('SALE', 'productCents'), saleShipping = amount('SALE', 'shippingCents');
      const refundProducts = amount('REFUND', 'productCents'), refundShipping = amount('REFUND', 'shippingCents');
      const keptOrders = new Set(rows.filter(row => row.retained > 0n).map(row => row.orderId));
      const total = rows.reduce((sum, row) => sum + row.productCents, 0n), denominator = BigInt(keptOrders.size);
      return { ...period,
        financial: { saleProductsCents: exact(saleProducts), saleShippingCents: exact(saleShipping),
          refundedProductsCents: exact(refundProducts), refundedShippingCents: exact(refundShipping),
          netProductsCents: exact(saleProducts - refundProducts), netShippingCents: exact(saleShipping - refundShipping),
          technicalRefundCents: exact(amount('LATE_REFUND', 'productCents') + amount('LATE_REFUND', 'shippingCents')) },
        cohort: { paidOrders: new Set(rows.map(row => row.orderId)).size, retainedOrders: keptOrders.size,
          retainedUnits: exact(rows.reduce((sum, row) => sum + row.retained, 0n)), retainedProductsCents: exact(total),
          averageTicketCents: denominator ? exact((total + denominator / 2n) / denominator) : null }
      };
    });
  }
}
