export class CartError extends Error {
  readonly status: number;
  readonly code: string;
  constructor(status: number, code: string, message: string) { super(message); this.status = status; this.code = code; }
}
export const staleCart = () => new CartError(409, 'CART_VERSION_CONFLICT', 'Seu carrinho mudou em outro acesso. Atualize e confira os itens.');
export const missing = () => new CartError(404, 'CART_RESOURCE_NOT_FOUND', 'Este item ou checkout não está disponível nesta conta.');
