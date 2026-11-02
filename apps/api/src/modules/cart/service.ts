import type { CartChange, CartView } from '@garimpo/contracts';
import type { Prisma } from '../../persistence/client.ts';
import { serializable } from '../../persistence/transaction.ts';
import { idempotent } from '../../core/idempotency.ts';
import { appendAudit } from '../../core/audit.ts';
import { Accounts } from '../accounts/service.ts';
import { PricingError } from '../pricing/errors.ts';
import { activePromotions } from '../pricing/service.ts';
import { promoted } from '../pricing/calculate.ts';
import { lockOffers, reservedQuantities } from '../inventory/reservations.ts';
import { activeCheckout, closeCheckout, expireOwn, lockCoupons, lockCustomer } from '../checkout/lifecycle.ts';
import { cartInclude, captureQuote, physicalLines, json } from './quote.ts';
import { CartError, missing, staleCart } from './errors.ts';
import { quantities } from './rules.ts';

export type CartCommand = { type: 'ADD'; version: number; offerId: string; quantity: number }
  | { type: 'UPDATE'; version: number; itemId: string; quantity: number }
  | { type: 'REMOVE'; version: number; itemId: string }
  | { type: 'CLEAR' }
  | { type: 'MERGE'; version: number; items: { offerId: string; quantity: number }[] };
type Desired = { offerId: string; quantity: number; lastSeenPriceCents: number };
export class Carts {
  readonly accounts: Accounts;
  constructor(accounts: Accounts) { this.accounts = accounts; }
  async cart(tx: Prisma.TransactionClient, userId: string) {
    return tx.cart.upsert({ where: { userId }, update: {}, create: { userId, createdAt: this.accounts.clock.now(), updatedAt: this.accounts.clock.now() }, include: cartInclude });
  }
  async read(access: string, couponCode?: string): Promise<CartView> {
    return serializable(this.accounts.db, async tx => {
      const user = await lockCustomer(this.accounts, tx, access), active = await expireOwn(tx, user.id, this.accounts.clock), cart = await this.cart(tx, user.id), now = this.accounts.clock.now();
      const items = await physicalLines(tx, cart, now, active?.id);
      let pricing: CartView['pricing'];
      try {
        if (items.some(item => !item.active || item.quantity > item.availableQuantity)) throw new CartError(409, 'INSUFFICIENT_STOCK', 'Há itens indisponíveis ou com quantidade maior que o saldo atual. Confira o carrinho.');
        const value = await captureQuote(tx, this.accounts, cart, couponCode); pricing = { status: 'READY', revision: value.revision, quote: value.snapshot.quote, couponCode: couponCode ?? null };
      } catch (error) {
        if (!(error instanceof CartError || error instanceof PricingError)) throw error;
        pricing = { status: 'UNAVAILABLE', code: error.code, message: error.message };
      }
      return { id: cart.id, version: cart.version, items, pricing, serverTime: now.toISOString() };
    });
  }
  async change(access: string, command: CartCommand, requestKey?: string): Promise<CartChange> {
    const user = (await this.accounts.authorize(this.accounts.db, access, true)).user;
    if ((command.type === 'ADD' || command.type === 'MERGE') && !requestKey) throw new CartError(422, 'IDEMPOTENCY_KEY_REQUIRED', 'Tente novamente com uma chave válida para esta alteração.');
    const apply = async (tx: Prisma.TransactionClient) => {
      const actor = await lockCustomer(this.accounts, tx, access), cart = await this.cart(tx, actor.id), now = this.accounts.clock.now();
      if ('version' in command && command.version !== cart.version) throw staleCart();
      if ('quantity' in command) quantities([{ quantity: command.quantity }]);
      if (command.type === 'MERGE') quantities(command.items);
      const active = await activeCheckout(tx, actor.id), incoming = command.type === 'ADD' ? [command.offerId] : command.type === 'MERGE' ? command.items.map(item => item.offerId) : [];
      await lockOffers(tx, [...cart.items.map(item => item.offerId), ...(active?.items.map(item => item.offerId) ?? []), ...incoming]);
      await lockCoupons(tx, [active?.couponUsage?.couponId]);
      if (active && active.expiresAt <= now) await closeCheckout(tx, active, 'EXPIRED', this.accounts.clock, 'CHECKOUT_DEADLINE');
      const desired = new Map<string, Desired>(cart.items.map(item => [item.offerId, { offerId: item.offerId, quantity: item.quantity, lastSeenPriceCents: item.lastSeenPriceCents }])), warnings: string[] = [];
      const rows = await tx.offer.findMany({ where: { id: { in: [...new Set([...cart.items.map(item => item.offerId), ...incoming])] } }, include: { edition: { select: { active: true, title: true } } } });
      const offers = new Map(rows.map(offer => [offer.id, offer])), promotions = await activePromotions(tx, rows.map(row => row.id), now);
      const currentPrice = (offerId: string) => { const offer = offers.get(offerId)!; return promoted({ offerId, basePriceCents: offer.priceCents }, promotions, now).priceCents; };
      if (command.type === 'CLEAR') desired.clear();
      else if (command.type === 'REMOVE' || command.type === 'UPDATE') {
        const item = cart.items.find(item => item.id === command.itemId); if (!item) throw missing();
        if (command.type === 'REMOVE') desired.delete(item.offerId);
        else { if (item.offer.kind === 'USED' && command.quantity !== 1) throw new CartError(422, 'USED_QUANTITY', 'Cada exemplar usado possui uma unidade.'); desired.set(item.offerId, { ...desired.get(item.offerId)!, quantity: command.quantity }); }
      } else if (command.type === 'ADD') {
        const offer = offers.get(command.offerId); if (!offer) throw missing();
        if (!offer.active || !offer.edition.active) throw new CartError(409, 'OFFER_UNAVAILABLE', 'Esta oferta não está disponível para adicionar.');
        const previous = desired.get(offer.id), quantity = (previous?.quantity ?? 0) + command.quantity;
        if (offer.kind === 'USED' && quantity !== 1) throw new CartError(422, 'USED_QUANTITY', 'Este exemplar usado já está no carrinho.');
        desired.set(offer.id, { offerId: offer.id, quantity, lastSeenPriceCents: previous?.lastSeenPriceCents ?? currentPrice(offer.id) });
      } else {
        const requests = new Map<string, number>(); for (const item of command.items) requests.set(item.offerId, (requests.get(item.offerId) ?? 0) + item.quantity);
        const reserved = await reservedQuantities(tx, rows.map(row => row.id), now, active?.id);
        for (const [offerId, wanted] of requests) {
          const offer = offers.get(offerId), previous = desired.get(offerId);
          if (!offer) { warnings.push('Uma oferta do carrinho visitante não existe mais e não foi adicionada.'); continue; }
          const available = offer.active && offer.edition.active ? Math.max(0, offer.stockOnHand - (reserved.get(offerId) ?? 0)) : 0;
          const requested = (previous?.quantity ?? 0) + wanted, quantity = Math.min(available, offer.kind === 'USED' ? 1 : requested);
          if (quantity < requested) warnings.push(offer.edition.title + ': quantidade ajustada de ' + requested + ' para ' + quantity + ' conforme disponibilidade; usados não se duplicam.');
          if (!quantity) desired.delete(offerId); else desired.set(offerId, { offerId, quantity, lastSeenPriceCents: previous?.lastSeenPriceCents ?? currentPrice(offerId) });
        }
      }
      quantities([...desired.values()]);
      const changed = desired.size !== cart.items.length || cart.items.some(item => desired.get(item.offerId)?.quantity !== item.quantity);
      if (changed) {
        if (active?.status === 'ACTIVE' && active.expiresAt > now) await closeCheckout(tx, active, 'CANCELLED', this.accounts.clock, 'CART_CHANGED');
        for (const item of cart.items) {
          const next = desired.get(item.offerId);
          if (!next) await tx.cartItem.delete({ where: { id: item.id } });
          else if (next.quantity !== item.quantity) await tx.cartItem.update({ where: { id: item.id }, data: { quantity: next.quantity } });
          desired.delete(item.offerId);
        }
        if (desired.size) await tx.cartItem.createMany({ data: [...desired.values()].map(item => ({ ...item, cartId: cart.id })) });
        await tx.cart.update({ where: { id: cart.id, version: cart.version }, data: { version: { increment: 1 }, updatedAt: now } });
      }
      const audit = await appendAudit(tx, { actorId: actor.id, action: 'CART.' + command.type, targetType: 'CART', targetId: cart.id, result: 'SUCCESS', reason: changed ? 'CART_CHANGED' : 'CART_UNCHANGED', changes: { warnings } }, this.accounts.clock);
      return audit.id;
    };
    const result = command.type === 'ADD' || command.type === 'MERGE'
      ? await idempotent(this.accounts.db, { actorScope: user.id, operation: 'CART.' + command.type, key: requestKey!, payload: command }, apply, this.accounts.clock)
      : { resultRef: await serializable(this.accounts.db, apply) };
    const audit = await this.accounts.db.auditLog.findUniqueOrThrow({ where: { id: result.resultRef } }), changes = audit.redactedChanges as { warnings?: unknown };
    return { cart: await this.read(access), warnings: Array.isArray(changes.warnings) ? changes.warnings.filter((value): value is string => typeof value === 'string') : [] };
  }
}
