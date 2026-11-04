import type { Prisma } from '../../../persistence/client.ts';
import type { z } from 'zod';
import { appendAudit } from '../../../core/audit.ts';
import { payloadHash } from '../../../core/idempotency.ts';
import { enqueue } from '../../../core/outbox.ts';
import { serializable } from '../../../persistence/transaction.ts';
import { lockIdentities, staff } from '../../accounts/blocking-helpers.ts';
import { AccountError } from '../../accounts/errors.ts';
import type { Accounts } from '../../accounts/service.ts';
import { CartError, missing } from '../../cart/errors.ts';
import { changeExchangeHolds, dispatchSubstitutes } from '../../inventory/exchange-stock.ts';
import { lockOffers, reservedQuantities } from '../../inventory/reservations.ts';
import { unclaimedUnit } from '../shared/claims.ts';
import { convertExchange } from './conversion.ts';
import { exchangeView, includeExchange, live } from './model.ts';
import type { Exchange, ExchangeCommand } from './model.ts';
import type * as input from './validation.ts';

const days = (count: number) => count * 86400000;
// An accepted hold has no response deadline after posting. It ends by an explicit case transition.
const indefiniteHold = new Date('9999-12-31T00:00:00.000Z');
const conflict = (message = 'A etapa ou as unidades da troca não permitem esta operação.') => new CartError(409, 'EXCHANGE_STATE_CONFLICT', message);
const customerCommands = new Set(['posting', 'response', 'convert']);

export class Exchanges {
  readonly accounts: Accounts;
  constructor(accounts: Accounts) { this.accounts = accounts; }

  async actor(tx: Prisma.TransactionClient, access: string, internal: boolean, admin = false) {
    return internal ? staff(this.accounts, tx, access, admin) : (await this.accounts.authorize(tx, access, true)).user;
  }

  async ownedCase(tx: Prisma.TransactionClient, id: string, actorId: string, internal: boolean) {
    const row = await tx.exchangeRequest.findFirst({ where: { id, ...(!internal ? { order: { userId: actorId } } : {}) }, include: includeExchange });
    if (!row) throw missing();
    return row;
  }

  async detail(access: string, id: string, internal = false) {
    return serializable(this.accounts.db, async tx => {
      const first = await this.actor(tx, access, internal);
      const target = await this.ownedCase(tx, id, first.id, internal);
      await lockIdentities(tx, [first.id, target.order.userId]);
      await this.actor(tx, access, internal);
      const fresh = await this.ownedCase(tx, id, first.id, internal);
      return exchangeView(await this.reconcileLocked(tx, fresh));
    });
  }

  async open(access: string, orderId: string, data: z.infer<typeof input.request>, key: string) {
    return serializable(this.accounts.db, async tx => {
      const first = await this.actor(tx, access, false);
      await lockIdentities(tx, [first.id]);
      const actor = await this.actor(tx, access, false);
      const identity = { actorScope: actor.id, operation: 'EXCHANGE.OPEN', key };
      const requestHash = payloadHash({ orderId, ...data });
      const replay = await tx.idempotencyRecord.findUnique({ where: { actorScope_operation_key: identity } });
      if (replay) {
        if (replay.requestHash !== requestHash) throw conflict('Esta tentativa já foi usada com outros dados.');
        return exchangeView(await this.ownedCase(tx, replay.resultRef, actor.id, false));
      }
      const order = await tx.order.findFirst({ where: { id: orderId, userId: actor.id } });
      if (!order) throw missing();
      if (order.status !== 'DELIVERED') throw conflict('A troca exige que o pedido tenha sido entregue.');
      const now = this.accounts.clock.now();
      const selected: { orderUnitId: string; originalOfferId: string }[] = [];
      for (const item of data.items) {
        const available = { orderItemId: item.orderItemId, orderItem: { orderId }, ...unclaimedUnit };
        const units = await tx.orderUnit.findMany({
          where: { ...available, deliveredAt: { gt: new Date(now.getTime() - days(7)), lte: now } },
          orderBy: { logicalIndex: 'asc' }, take: item.quantity, select: { id: true, currentOfferId: true }
        });
        if (units.length !== item.quantity) {
          if (await tx.orderUnit.count({ where: available }) >= item.quantity) throw new CartError(422, 'EXCHANGE_WINDOW', 'O prazo de troca encerrou.');
          throw conflict('A quantidade excede as unidades disponíveis para troca.');
        }
        selected.push(...units.map(unit => ({ orderUnitId: unit.id, originalOfferId: unit.currentOfferId })));
      }
      const created = await tx.exchangeRequest.create({
        data: { orderId, reason: data.reason, createdAt: now, items: { create: selected } }, include: includeExchange
      });
      await this.record(tx, created, actor.id, 'OPENED');
      await tx.idempotencyRecord.create({ data: { ...identity, requestHash, resultRef: created.id, createdAt: now } });
      return exchangeView(created);
    });
  }

  async change(access: string, id: string, command: ExchangeCommand, internal: boolean, key?: string) {
    if (!internal && !customerCommands.has(command.type)) throw new AccountError(403, 'STAFF_REQUIRED');
    const admin = command.type === 'extension' || command.type === 'inspection-exception';
    return serializable(this.accounts.db, async tx => {
      const first = await this.actor(tx, access, internal, admin);
      const target = await this.ownedCase(tx, id, first.id, internal);
      await lockIdentities(tx, [first.id, target.order.userId]);
      const actor = await this.actor(tx, access, internal, admin);
      const row = await this.ownedCase(tx, id, actor.id, internal);
      const identity = key ? { actorScope: actor.id, operation: 'EXCHANGE.' + command.type, key } : null;
      const requestHash = identity ? payloadHash({ id, command: JSON.stringify(command) }) : '';
      if (identity) {
        const replay = await tx.idempotencyRecord.findUnique({ where: { actorScope_operation_key: identity } });
        if (replay) {
          if (replay.requestHash !== requestHash) throw conflict('Esta tentativa já foi usada com outros dados.');
          return exchangeView(row);
        }
      }
      if (row.version !== command.data.version) throw conflict('A troca mudou. Atualize os dados.');
      const now = this.accounts.clock.now();
      if (row.state === 'AWAITING_POSTING' && row.postingDueAt && row.postingDueAt <= now
        && !['posting', 'extension', 'cancel'].includes(command.type)) throw conflict('O prazo de postagem encerrou.');
      const patch = await this.transition(tx, row, command, actor.id, internal, now);
      const changed = await tx.exchangeRequest.update({ where: { id }, data: { ...patch, version: { increment: 1 } }, include: includeExchange });
      await this.record(tx, changed, actor.id, command.type.toUpperCase().replaceAll('-', '_'), 'reason' in command.data ? command.data.reason : undefined);
      if (identity) await tx.idempotencyRecord.create({ data: { ...identity, requestHash, resultRef: id, createdAt: now } });
      return exchangeView(await this.reconcileLocked(tx, changed));
    });
  }

  private async transition(tx: Prisma.TransactionClient, row: Exchange, command: ExchangeCommand, actorId: string, internal: boolean, now: Date): Promise<Prisma.ExchangeRequestUncheckedUpdateInput> {
    const { id } = row, { clock } = this.accounts;
    const activeItems = row.items.filter(item => item.active);
    const releaseItems = (onlyRejected = false) => tx.exchangeItem.updateMany({
      where: { exchangeId: id, ...(onlyRejected ? { inspection: 'REJECTED' } : {}) }, data: { active: false }
    });
    switch (command.type) {
      case 'decision':
        if (row.state !== 'REQUESTED') break;
        if (command.data.decision === 'REJECT') { await releaseItems(); return { state: 'REJECTED' }; }
        return { state: 'AWAITING_POSTING', approvedAt: now, postingDueAt: new Date(now.getTime() + days(7)) };
      case 'posting': {
        const { trackingCode, postedAt, interaction } = command.data;
        if (row.state !== 'AWAITING_POSTING' || !row.approvedAt || !row.postingDueAt) break;
        if (postedAt < row.approvedAt || postedAt >= row.postingDueAt || postedAt > now || now >= row.postingDueAt) {
          throw new CartError(422, 'EXCHANGE_POSTING_WINDOW', 'Informe a postagem efetiva dentro do prazo.');
        }
        await this.external(tx, id, actorId, internal, interaction, postedAt, now, row.postingDueAt);
        await this.shipment(tx, row, actorId, 'EXCHANGE_RETURN', trackingCode, postedAt, now);
        const accepted = live(row).filter(offer => offer.state === 'ACCEPTED');
        await lockOffers(tx, accepted.map(offer => offer.offerId));
        await tx.reservation.updateMany({ where: { substituteId: { in: accepted.map(offer => offer.id) }, status: 'ACTIVE' },
          data: { expiresAt: indefiniteHold } });
        return { state: 'IN_TRANSIT' };
      }
      case 'receipt': {
        const physical = row.shipments.find(value => value.kind === 'EXCHANGE_RETURN');
        const { units, receivedAt, evidenceIds } = command.data;
        if (row.state !== 'IN_TRANSIT' || !physical || receivedAt < physical.postedAt || receivedAt > now
          || units.length !== activeItems.length || units.some(unit => !activeItems.some(item => item.orderUnitId === unit.id))
          || evidenceIds.some(id => !row.evidence.some(value => value.id === id && value.source === 'STAFF'))) break;
        await tx.shipment.update({ where: { id: physical.id }, data: { deliveredAt: receivedAt } });
        const rejected = new Set(units.filter(unit => unit.result === 'REJECTED').map(unit => unit.id));
        await changeExchangeHolds(tx, clock, live(row).filter(value => rejected.has(value.orderUnitId)), 'RELEASED');
        for (const unit of units) await tx.exchangeItem.update({ where: { exchangeId_orderUnitId: { exchangeId: id, orderUnitId: unit.id } }, data: { inspection: unit.result } });
        const accepted = rejected.size < units.length;
        return { state: accepted ? 'WAITING_SUBSTITUTE' : 'REJECTED_AWAITING_SHIPMENT', inspectedAt: now, waitingDueAt: accepted ? new Date(now.getTime() + days(30)) : null };
      }
      case 'offer': {
        if (!['AWAITING_POSTING', 'IN_TRANSIT', 'WAITING_SUBSTITUTE'].includes(row.state) || row.waitingDueAt && row.waitingDueAt <= now) break;
        const { offerId, unitId, equivalenceReason } = command.data;
        const expired = live(row).filter(offer => offer.state === 'OFFERED' && offer.expiresAt <= now);
        await lockOffers(tx, [offerId, ...expired.map(offer => offer.offerId)]);
        await changeExchangeHolds(tx, clock, expired, 'EXPIRED');
        const offer = await tx.offer.findFirst({ where: { id: offerId, active: true, edition: { active: true } } });
        if (!offer) throw missing();
        const item = activeItems.find(value => (!unitId || value.orderUnitId === unitId) && value.orderUnit.orderItem.editionId === offer.editionId
          && value.inspection !== 'REJECTED' && !value.substitutes.some(sub => sub.state === 'ACCEPTED' || sub.state === 'OFFERED' && sub.expiresAt > now));
        if (!item) throw new CartError(422, 'EXCHANGE_EQUIVALENCE', 'Escolha uma oferta equivalente da mesma edição para uma unidade sem substituto.');
        const holds = await reservedQuantities(tx, [offerId], now);
        if (offer.stockOnHand <= (holds.get(offerId) ?? 0)) throw conflict('O exemplar já está comprometido.');
        const expiresAt = new Date(now.getTime() + days(2));
        await tx.substituteOffer.create({ data: { exchangeId: id, orderUnitId: item.orderUnitId, offerId, equivalenceReason,
          createdAt: now, expiresAt, reservation: { create: { offerId, quantity: 1, expiresAt, createdAt: now } } } });
        return {};
      }
      case 'response': {
        const substitute = live(row).find(value => value.id === command.substituteId);
        if (!substitute || substitute.state !== 'OFFERED' || substitute.expiresAt <= now) break;
        await this.external(tx, id, actorId, internal, command.data.interaction, substitute.createdAt, now, substitute.expiresAt);
        if (command.data.decision === 'REJECT') {
          await changeExchangeHolds(tx, clock, [substitute], 'REJECTED');
          await tx.substituteOffer.update({ where: { id: substitute.id }, data: { respondedAt: now } });
        } else {
          await lockOffers(tx, [substitute.offerId]);
          const updated = await tx.reservation.updateMany({ where: { substituteId: substitute.id, status: 'ACTIVE', expiresAt: { gt: now } },
            data: { expiresAt: row.state === 'AWAITING_POSTING' ? row.postingDueAt! : indefiniteHold } });
          if (updated.count !== 1) throw conflict('A reserva expirou.');
          await tx.substituteOffer.update({ where: { id: substitute.id }, data: { state: 'ACCEPTED', respondedAt: now } });
        }
        return {};
      }
      case 'shipment': {
        const { postedAt, trackingCode } = command.data;
        if (row.state !== 'WAITING_SUBSTITUTE' || !row.inspectedAt || postedAt < row.inspectedAt || postedAt > now) break;
        const eligible = activeItems.filter(item => item.inspection !== 'REJECTED');
        const chosen = eligible.flatMap(item => {
          const substitute = item.substitutes.find(value => value.state === 'ACCEPTED');
          return substitute ? [{ id: substitute.id, offerId: substitute.offerId,
            originalOfferId: item.inspection === 'FIT' ? item.originalOfferId : null }] : [];
        });
        if (!chosen.length || chosen.length !== eligible.length) break;
        await dispatchSubstitutes(tx, clock, actorId, chosen);
        await this.shipment(tx, row, actorId, 'EXCHANGE_REPLACEMENT', trackingCode, postedAt, now);
        return { state: 'SHIPPED' };
      }
      case 'delivery': {
        const shipment = row.shipments.find(value => value.kind === 'EXCHANGE_REPLACEMENT');
        const { deliveredAt } = command.data;
        if (row.state !== 'SHIPPED' || !shipment || deliveredAt < shipment.postedAt || deliveredAt > now) break;
        await tx.shipment.update({ where: { id: shipment.id }, data: { deliveredAt } });
        for (const item of activeItems) {
          const substitute = item.substitutes.find(value => value.state === 'SHIPPED');
          if (!substitute) continue;
          await tx.orderUnit.update({ where: { id: item.orderUnitId }, data: { currentOfferId: substitute.offerId, deliveredAt } });
          await tx.exchangeItem.update({ where: { exchangeId_orderUnitId: { exchangeId: id, orderUnitId: item.orderUnitId } }, data: { active: false } });
        }
        return { state: 'DELIVERED' };
      }
      case 'cancel':
        if (!['REQUESTED', 'AWAITING_POSTING'].includes(row.state)) break;
        await changeExchangeHolds(tx, clock, live(row), 'RELEASED');
        await releaseItems();
        return { state: 'CANCELLED' };
      case 'convert': {
        if (row.convertedReturnId || !['REQUESTED', 'AWAITING_POSTING', 'IN_TRANSIT', 'WAITING_SUBSTITUTE'].includes(row.state)
          || live(row).some(value => value.state === 'ACCEPTED' || value.expiresAt > now)) break;
        const ids = activeItems.filter(item => item.inspection !== 'REJECTED').map(item => item.orderUnitId);
        if (!ids.length) break;
        await changeExchangeHolds(tx, clock, live(row), 'EXPIRED');
        return { state: 'CONVERTED', convertedReturnId: await convertExchange(tx, row, ids, command.data.reason, now, actorId) };
      }
      case 'extension':
        if (!['AWAITING_POSTING', 'EXPIRED'].includes(row.state) || !row.postingDueAt || command.data.dueAt <= row.postingDueAt || command.data.dueAt <= now) break;
        if (row.state === 'EXPIRED') {
          const ids = row.items.map(item => item.orderUnitId);
          if (await tx.orderUnit.count({ where: { id: { in: ids }, ...unclaimedUnit } }) !== ids.length) break;
          await tx.exchangeItem.updateMany({ where: { exchangeId: id }, data: { active: true } });
        } else if (row.postingDueAt <= now) {
          await changeExchangeHolds(tx, clock, live(row), 'EXPIRED');
        } else {
          const accepted = live(row).filter(value => value.state === 'ACCEPTED');
          await lockOffers(tx, accepted.map(offer => offer.offerId));
          await tx.reservation.updateMany({ where: { substituteId: { in: accepted.map(value => value.id) }, status: 'ACTIVE' },
            data: { expiresAt: command.data.dueAt } });
        }
        return { state: 'AWAITING_POSTING', postingDueAt: command.data.dueAt };
      case 'rejected-shipment': {
        const { postedAt, trackingCode } = command.data;
        if (!row.inspectedAt || postedAt < row.inspectedAt || postedAt > now || !activeItems.some(item => item.inspection === 'REJECTED')
          || row.shipments.some(value => value.kind === 'EXCHANGE_REJECTED')) break;
        await this.shipment(tx, row, actorId, 'EXCHANGE_REJECTED', trackingCode, postedAt, now);
        return row.state === 'REJECTED_AWAITING_SHIPMENT' ? { state: 'REJECTED_IN_TRANSIT' } : {};
      }
      case 'rejected-delivery': {
        const shipment = row.shipments.find(value => value.kind === 'EXCHANGE_REJECTED');
        const { deliveredAt } = command.data;
        if (!shipment || shipment.deliveredAt || deliveredAt < shipment.postedAt || deliveredAt > now) break;
        await tx.shipment.update({ where: { id: shipment.id }, data: { deliveredAt } });
        await releaseItems(true);
        return row.state === 'REJECTED_IN_TRANSIT' ? { state: 'REJECTED_DELIVERED' } : {};
      }
      case 'inspection-exception':
        if (!['WAITING_SUBSTITUTE', 'REJECTED_AWAITING_SHIPMENT'].includes(row.state)
          || !activeItems.some(item => item.inspection === 'REJECTED') || row.shipments.some(value => value.kind === 'EXCHANGE_REJECTED')) break;
        if (command.data.decision === 'KEEP_REJECTION') return {};
        await tx.exchangeItem.updateMany({ where: { exchangeId: id, inspection: 'REJECTED' }, data: { inspection: 'UNFIT' } });
        return { state: 'WAITING_SUBSTITUTE', waitingDueAt: row.waitingDueAt ?? new Date(now.getTime() + days(30)) };
    }
    throw conflict();
  }

  private async shipment(tx: Prisma.TransactionClient, row: Exchange, actorId: string, kind: string, trackingCode: string, postedAt: Date, now: Date) {
    await tx.shipment.create({ data: { orderId: row.orderId, exchangeId: row.id, createdById: actorId, kind, trackingCode, postedAt, createdAt: now } });
  }

  private async external(tx: Prisma.TransactionClient, exchangeId: string, actorId: string, internal: boolean,
    interaction: z.infer<typeof input.posting>['interaction'], from: Date, now: Date, due: Date) {
    if (internal ? !interaction || interaction.occurredAt < from || interaction.occurredAt > now || interaction.occurredAt >= due : Boolean(interaction)) {
      throw new CartError(422, 'EXCHANGE_EXTERNAL_INTERACTION', 'A equipe deve registrar uma interação externa efetiva no prazo.');
    }
    if (interaction) await tx.externalInteraction.create({ data: { ...interaction, exchangeId, actorId, createdAt: now } });
  }

  private async record(tx: Prisma.TransactionClient, row: Exchange, actorId: string | null, action: string, reason?: string) {
    const { clock } = this.accounts;
    await appendAudit(tx, { ...(actorId ? { actorId } : {}), action: 'EXCHANGE.' + action, targetType: 'EXCHANGE', targetId: row.id,
      result: 'SUCCESS', reason: 'EXCHANGE_COMMAND', changes: { orderId: row.orderId, state: row.state, ...(reason ? { reason } : {}) } }, clock);
    await enqueue(tx, { type: 'EXCHANGE.UPDATED', aggregateId: row.id, payload: { orderId: row.orderId, userId: row.order.userId }, clock);
  }

  private async reconcileLocked(tx: Prisma.TransactionClient, row: Exchange) {
    const { clock } = this.accounts;
    const now = clock.now(), holds = live(row);
    if (row.state === 'AWAITING_POSTING' && row.postingDueAt && row.postingDueAt <= now) {
      await changeExchangeHolds(tx, clock, holds, 'EXPIRED');
      await tx.exchangeItem.updateMany({ where: { exchangeId: row.id }, data: { active: false } });
      const expired = await tx.exchangeRequest.update({ where: { id: row.id }, data: { state: 'EXPIRED', version: { increment: 1 } }, include: includeExchange });
      await this.record(tx, expired, null, 'POSTING_EXPIRED');
      return expired;
    }
    const stale = holds.filter(value => value.state === 'OFFERED' && value.expiresAt <= now);
    const unconfirmed = row.items.filter(item => item.active && item.inspection !== 'REJECTED'
      && !holds.some(value => value.orderUnitId === item.orderUnitId && (value.state === 'ACCEPTED' || value.expiresAt > now)));
    let patch: Prisma.ExchangeRequestUncheckedUpdateInput | null = null;
    if (stale.length) { await changeExchangeHolds(tx, clock, stale, 'EXPIRED'); patch = {}; }
    if (row.state === 'WAITING_SUBSTITUTE' && !row.convertedReturnId && row.waitingDueAt && row.waitingDueAt <= now
      && !holds.some(value => value.state === 'OFFERED' && value.expiresAt > now) && unconfirmed.length) {
      const convertedReturnId = await convertExchange(tx, row, unconfirmed.map(item => item.orderUnitId), 'Prazo de espera pelo substituto encerrado.', now, null);
      patch = { convertedReturnId, ...(holds.some(value => value.state === 'ACCEPTED') ? {} : { state: 'CONVERTED' }) };
    }
    if (!patch) return row;
    const changed = await tx.exchangeRequest.update({ where: { id: row.id }, data: { ...patch, version: { increment: 1 } }, include: includeExchange });
    await this.record(tx, changed, null, patch.convertedReturnId ? 'WAIT_CONVERTED' : 'OFFER_EXPIRED');
    return changed;
  }

  async reconcile(limit = 100) {
    if (!Number.isInteger(limit) || limit < 1 || limit > 1000) throw new Error('Invalid exchange reconciliation limit.');
    const { db, clock } = this.accounts, now = clock.now();
    const pending = await db.exchangeRequest.findMany({ where: { OR: [
      { state: 'AWAITING_POSTING', postingDueAt: { lte: now } },
      { items: { some: { substitutes: { some: { state: 'OFFERED', expiresAt: { lte: now } } } } } },
      { state: 'WAITING_SUBSTITUTE', convertedReturnId: null, waitingDueAt: { lte: now },
        items: {
          none: { substitutes: { some: { state: 'OFFERED', expiresAt: { gt: now } } } },
          some: { active: true, inspection: { in: ['FIT', 'UNFIT'] }, substitutes: { none: { state: 'ACCEPTED' } } }
        } }
    ] }, select: { id: true, order: { select: { userId: true } } }, orderBy: [{ createdAt: 'asc' }, { id: 'asc' }], take: limit });
    let changed = 0;
    for (const target of pending) {
      changed += await serializable(db, async tx => {
        await lockIdentities(tx, [target.order.userId]);
        const row = await this.ownedCase(tx, target.id, target.order.userId, true);
        return (await this.reconcileLocked(tx, row)).version === row.version ? 0 : 1;
      });
    }
    return changed;
  }
}
