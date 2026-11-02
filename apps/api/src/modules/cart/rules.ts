import { createHash } from 'node:crypto';
import { CartError } from './errors.ts';
export const MAX_CART_LINES = 100, MAX_CART_UNITS = 1000, CHECKOUT_MILLISECONDS = 15 * 60 * 1000;
export function quantities(lines: { quantity: number }[]) {
  if (lines.length > MAX_CART_LINES || lines.some(line => !Number.isSafeInteger(line.quantity) || line.quantity < 1 || line.quantity > MAX_CART_UNITS) || lines.reduce((sum, line) => sum + line.quantity, 0) > MAX_CART_UNITS) throw new CartError(422, 'CART_CAPACITY', 'Use até 100 ofertas e 1000 unidades no carrinho.');
}
/** Opaque, deterministic UUID-shaped identity (custom version 8), frozen with its allocation. */
export function unitIdentity(lineId: string, index: number) {
  const bytes = createHash('sha256').update('garimpo:checkout-unit:' + lineId + ':' + index).digest();
  bytes[6] = (bytes[6]! & 0x0f) | 0x80; bytes[8] = (bytes[8]! & 0x3f) | 0x80;
  const hex = bytes.subarray(0, 16).toString('hex'); return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}
