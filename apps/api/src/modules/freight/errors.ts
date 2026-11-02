export class FreightError extends Error {
  readonly status: number; readonly code: string;
  constructor(status: number, code: string, message: string) { super(message); this.status = status; this.code = code; }
}
export const freightConflict = () => new FreightError(409, 'FREIGHT_VERSION_CONFLICT', 'A configuração de frete mudou. Atualize e confira os valores.');
export const rangeConflict = () => new FreightError(409, 'FREIGHT_RANGE_CONFLICT', 'Esta faixa de CEP já está abrangida por outra configuração.');
export function isExclusion(error: unknown, depth = 0): boolean {
  if (!error || typeof error !== 'object' || depth > 5) return false;
  const value = error as Record<string, unknown>;
  if ([value.code, value.sqlState, value.originalCode].includes('23P01')) return true;
  return ['cause', 'meta', 'driverAdapterError'].some(key => isExclusion(value[key], depth + 1));
}
