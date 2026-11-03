import type { CheckoutQuote, CheckoutSnapshot, CheckoutView, DeliveryAddressSnapshot, AcceptedFreight } from '@garimpo/contracts';
import type { Prisma } from '../../persistence/client.ts';
import { Accounts } from '../accounts/service.ts';
import { serializable } from '../../persistence/transaction.ts';
import { appendAudit } from '../../core/audit.ts';
import { Freight, freightRevision } from '../freight/service.ts';
import { FreightError } from '../freight/errors.ts';
import { Pricing } from '../pricing/service.ts';
import { unitIdentity } from '../cart/rules.ts';
import { json } from '../cart/quote.ts';
import { CartError, missing } from '../cart/errors.ts';
import { expireOwn, lockCustomer, checkoutInclude, lockCoupons, closeCheckout } from './lifecycle.ts';
import { lockOffers } from '../inventory/reservations.ts';
import { Checkouts } from './service.ts';
import type { QuoteInput, AddressInput } from '../orders/validation.ts';
import * as validate from '../orders/validation.ts';
export async function ownAddress(tx: Prisma.TransactionClient, userId: string, id: string): Promise<DeliveryAddressSnapshot> {
  const row = await tx.address.findFirst({ where: { id, userId, deletedAt: null } }); if (!row) throw missing();
  return { id: row.id, recipient: row.recipient, zip: row.zip, region: row.region, city: row.city, neighborhood: row.neighborhood, street: row.street, number: row.number, complement: row.complement };
}
export class CheckoutQuotes {
  readonly accounts: Accounts;
  constructor(accounts: Accounts) { this.accounts = accounts; }
  async quote(access: string, input: QuoteInput): Promise<CheckoutQuote> {
    input = validate.parse(validate.quote, input);
    const result = await serializable(this.accounts.db, async tx => {
      if ('items' in input) {
        const units = [...input.items].sort((a, b) => a.offerId.localeCompare(b.offerId)).flatMap(line => Array.from({ length: line.quantity }, (_unused, index) => ({ id: unitIdentity(line.offerId, index), offerId: line.offerId })));
        const quote = await new Pricing(this.accounts).quote(tx, units, input.couponCode), freight = await new Freight(this.accounts).quote(tx, input.zip);
        return { value: { quote, freight, freightRevision: freightRevision(freight, { zip: input.zip }), totalCents: freight.served ? quote.totalCents + freight.amountCents : null, checkout: null, serverTime: this.accounts.clock.now().toISOString() } };
      }
      const user = await lockCustomer(this.accounts, tx, access), row = await expireOwn(tx, user.id, this.accounts.clock); if (!row || row.id !== input.checkoutId) return { error: missing() };
      const address = await ownAddress(tx, user.id, input.addressId), freight = await new Freight(this.accounts).quote(tx, address.zip), { quote } = row.quoteSnapshot as unknown as CheckoutSnapshot;
      return { value: { quote, freight, freightRevision: freightRevision(freight, address), totalCents: freight.served ? quote.totalCents + freight.amountCents : null, checkout: { id: row.id, version: row.version, expiresAt: row.expiresAt.toISOString() }, serverTime: this.accounts.clock.now().toISOString() } };
    });
    if (result.error) throw result.error; return result.value!;
  }
  async accept(access: string, id: string, input: AddressInput): Promise<CheckoutView> {
    input = validate.parse(validate.address, input);
    const result = await serializable(this.accounts.db, async tx => {
      const user = await lockCustomer(this.accounts, tx, access), row = await expireOwn(tx, user.id, this.accounts.clock); if (!row || row.id !== id) return { error: missing() };
      if (row.version !== input.version) throw new CartError(409, 'CHECKOUT_VERSION_CONFLICT', 'A finalização mudou. Atualize antes de aceitar o frete.');
      await lockOffers(tx, row.items.map(item => item.offerId)); await lockCoupons(tx, [row.couponUsage?.couponId]);
      const address = await ownAddress(tx, user.id, input.addressId), freight = await new Freight(this.accounts).quote(tx, address.zip, true), revision = freightRevision(freight, address);
      if (row.expiresAt <= this.accounts.clock.now()) { await closeCheckout(tx, row, 'EXPIRED', this.accounts.clock, 'FREIGHT_ACCEPTANCE_AFTER_LOCK_DEADLINE'); return { error: new CartError(409, 'CHECKOUT_EXPIRED', 'O prazo da finalização terminou. Confira o carrinho para iniciar outra.') }; }
      if (!freight.served) throw new FreightError(422, 'ZIP_NOT_SERVED', 'Este CEP não é atendido. Escolha outro endereço antes de vencer a finalização.');
      if (revision !== input.freightRevision) throw new FreightError(409, 'FREIGHT_CONFIRMATION_REQUIRED', 'O endereço ou o frete mudou. Confira a nova cotação antes de aceitar.');
      const accepted: AcceptedFreight = { address, freight, revision };
      const updated = await tx.checkout.update({ where: { id, version: input.version }, data: { addressId: address.id, freightRevision: revision, freightSnapshot: json(accepted), version: { increment: 1 } }, include: checkoutInclude });
      await appendAudit(tx, { actorId: user.id, action: 'CHECKOUT.FREIGHT_ACCEPTED', targetType: 'CHECKOUT', targetId: id, result: 'SUCCESS', reason: 'OWN_ADDRESS_QUOTE_CONFIRMED', changes: { addressId: address.id, freightCents: freight.amountCents, freightRevision: revision } }, this.accounts.clock);
      return { row: updated };
    });
    if (result.error) throw result.error; return new Checkouts(this.accounts).view(result.row!);
  }
}
