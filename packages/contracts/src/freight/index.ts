export interface CepRangeInput { startZip: string; endZip: string }
export interface FreightRateInput { region: string; served: boolean; amountCents: number | null; deliveryDays: number | null; ranges: CepRangeInput[] }
export interface FreightRateView extends FreightRateInput { id: string; version: number; ranges: (CepRangeInput & { id: string })[] }
export interface FreightPage { items: FreightRateView[]; page: number; pageSize: number; total: number }
export type FreightQuote = { served: true; zip: string; rateId: string; rateVersion: number; region: string; amountCents: number; deliveryDays: number }
  | { served: false; zip: string; reason: 'NO_RATE' | 'NOT_SERVED'; region: string | null };
export interface DeliveryAddressSnapshot { id: string; recipient: string; zip: string; region: string; city: string; neighborhood: string; street: string; number: string; complement: string | null }
export interface AcceptedFreight { address: DeliveryAddressSnapshot; freight: Extract<FreightQuote, { served: true }>; revision: string }
