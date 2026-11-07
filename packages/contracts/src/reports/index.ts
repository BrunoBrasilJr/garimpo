export interface ReportPeriod { from: string; to: string; asOf: string }
export interface SalesReport extends ReportPeriod {
  financial: { saleProductsCents: number; saleShippingCents: number; refundedProductsCents: number; refundedShippingCents: number; netProductsCents: number; netShippingCents: number; technicalRefundCents: number };
  cohort: { paidOrders: number; retainedOrders: number; retainedUnits: number; retainedProductsCents: number; averageTicketCents: number | null };
}
export interface ReportRank { id: string; name: string; units: number; productCents: number }
export interface RankingReport extends ReportPeriod { items: ReportRank[]; page: number; pageSize: number; total: number; totalPages: number }
