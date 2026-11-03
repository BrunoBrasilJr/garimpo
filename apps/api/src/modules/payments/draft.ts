import type { AcceptedFreight, CheckoutSnapshot } from '@garimpo/contracts';
import type { Prisma } from '../../persistence/client.ts';
import type { Accounts } from '../accounts/service.ts';
import { AccountError } from '../accounts/errors.ts';
import { requireFirstOrderEmail } from '../accounts/checkout.ts';
import { checkoutInclude, lockCoupons } from '../checkout/lifecycle.ts';
import { ownAddress } from '../checkout/quotes.ts';
import { CartError, missing } from '../cart/errors.ts';
import { Freight, freightRevision } from '../freight/service.ts';
import { FreightError } from '../freight/errors.ts';
import { lockOffers, reservedQuantities } from '../inventory/reservations.ts';
import type { CardInput } from './validation.ts';
/** Same frozen quote, address and capacity rules as initial Pix/boleto creation; no provider I/O. */
export async function cardDraft(accounts: Accounts, tx: Prisma.TransactionClient, userId: string, checkoutId: string, input: Omit<CardInput, 'scenario'>) {
  const user = await tx.user.findUniqueOrThrow({ where: { id: userId } });
  if (user.context !== 'CUSTOMER' || user.blockedAt || user.closedAt || user.inactiveAt) throw new AccountError(403, 'ACCOUNT_UNAVAILABLE');
  const checkout = await tx.checkout.findFirst({ where: { id: checkoutId, userId }, include: checkoutInclude }); if (!checkout) throw missing();
  await lockOffers(tx, checkout.items.map(item => item.offerId)); await lockCoupons(tx, [checkout.couponUsage?.couponId]);
  if (checkout.status !== 'ACTIVE') throw new CartError(409, 'CHECKOUT_UNAVAILABLE', 'Esta finalização foi encerrada.');
  if (checkout.expiresAt <= accounts.clock.now()) throw new CartError(409, 'CHECKOUT_EXPIRED', 'O prazo da finalização terminou.');
  if (checkout.version !== input.version) throw new CartError(409, 'CHECKOUT_VERSION_CONFLICT', 'Confira novamente a finalização.');
  await requireFirstOrderEmail(tx, user);
  const cart = await tx.cart.findUniqueOrThrow({ where: { id: checkout.cartId } }); if (cart.userId !== userId || cart.version !== checkout.cartVersion) throw new CartError(409, 'CART_VERSION_CONFLICT', 'O carrinho mudou.');
  const accepted = checkout.freightSnapshot as unknown as AcceptedFreight | null;
  if (!accepted || !checkout.freightRevision || checkout.addressId !== input.addressId || accepted.address.id !== input.addressId || checkout.freightRevision !== input.freightRevision) throw new FreightError(409, 'FREIGHT_CONFIRMATION_REQUIRED', 'Confira o endereço e aceite o frete.');
  const address = await ownAddress(tx, userId, input.addressId), freight = await new Freight(accounts).quote(tx, address.zip, true), now = accounts.clock.now();
  if (checkout.expiresAt <= now) throw new CartError(409, 'CHECKOUT_EXPIRED', 'O prazo da finalização terminou.');
  if (!freight.served || freightRevision(freight, address) !== input.freightRevision) throw new FreightError(409, 'FREIGHT_CONFIRMATION_REQUIRED', 'O endereço ou frete mudou. Confira novamente.');
  const snapshot = checkout.quoteSnapshot as unknown as CheckoutSnapshot, others = await reservedQuantities(tx, checkout.items.map(item => item.offerId), now, checkout.id);
  const offers = await tx.offer.findMany({ where: { id: { in: checkout.items.map(item => item.offerId) } } });
  if (checkout.items.some(item => item.quantity > (offers.find(offer => offer.id === item.offerId)?.stockOnHand ?? 0) - (others.get(item.offerId) ?? 0))) throw new CartError(409, 'INSUFFICIENT_STOCK', 'Não foi possível confirmar o saldo.');
  if (snapshot.quote.couponId && (checkout.couponUsage?.status !== 'RESERVED' || checkout.couponUsage.expiresAt <= now || checkout.couponUsage.couponId !== snapshot.quote.couponId)) throw new CartError(409, 'COUPON_RESERVATION_UNAVAILABLE', 'O cupom reservado não está disponível.');
  return { checkout, snapshot, address, freight, now };
}
