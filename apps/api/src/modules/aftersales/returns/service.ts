import type { ReturnView } from '@garimpo/contracts';
import type { Prisma } from '../../../persistence/client.ts';
import { appendAudit } from '../../../core/audit.ts';
import { payloadHash } from '../../../core/idempotency.ts';
import { enqueue } from '../../../core/outbox.ts';
import { serializable } from '../../../persistence/transaction.ts';
import { lockIdentities, staff } from '../../accounts/blocking-helpers.ts';
import { AccountError } from '../../accounts/errors.ts';
import type { Accounts } from '../../accounts/service.ts';
import { CartError, missing } from '../../cart/errors.ts';
import { restockReturn } from '../../inventory/return-stock.ts';
import { refundInclude, refundView } from '../../refunds/automatic.ts';
import type { AutomaticRefunds } from '../../refunds/automatic.ts';
import { allocateReturnRefund } from '../../refunds/return-allocation.ts';
import { hideReturnedReviews } from '../../reviews/returned.ts';
import type { z } from 'zod';
import type * as input from './validation.ts';
import { unclaimedUnit } from '../shared/claims.ts';

const sevenDays = 7 * 86400000;
const beforeShipment = (status: string) => status === 'PREPARING' || status === 'SEPARATED';
const conflict = (message: string) => new CartError(409, 'RETURN_STATE_CONFLICT', message);
export const caseInclude = {
  order: true,
  items: { include: { orderUnit: { include: { orderItem: true } } }, orderBy: { orderUnitId: 'asc' } },
  shipments: { orderBy: { createdAt: 'asc' } },
  evidence: { select: { id: true, mediaType: true, source: true } },
  refund: { include: refundInclude }
} satisfies Prisma.ReturnRequestInclude;
export type Case = Prisma.ReturnRequestGetPayload<{ include: typeof caseInclude }>;
type Command =
  | { type: 'decision'; data: z.infer<typeof input.decision> }
  | { type: 'posting'; data: z.infer<typeof input.posting> }
  | { type: 'receipt'; data: z.infer<typeof input.receipt> }
  | { type: 'authorization'; data: z.infer<typeof input.authorization> }
  | { type: 'extension'; data: z.infer<typeof input.extension> }
  | { type: 'rejected-shipment'; data: z.infer<typeof input.rejectedShipment> }
  | { type: 'rejected-delivery'; data: z.infer<typeof input.rejectedDelivery> }
  | { type: 'inspection-exception'; data: z.infer<typeof input.inspectionException> };

function view(row: Case): ReturnView {
  return {
    id: row.id, orderId: row.orderId, state: row.state, version: row.version, reason: row.reason,
    createdAt: row.createdAt.toISOString(), approvedAt: row.approvedAt?.toISOString() ?? null,
    postingDueAt: row.postingDueAt?.toISOString() ?? null, inspectedAt: row.inspectedAt?.toISOString() ?? null,
    items: row.items.map(item => ({ id: item.orderUnitId, orderItemId: item.orderUnit.orderItemId, inspection: item.inspection })),
    evidence: row.evidence,
    shipments: row.shipments.map(item => ({ id: item.id, kind: item.kind, trackingCode: item.trackingCode, postedAt: item.postedAt.toISOString(), deliveredAt: item.deliveredAt?.toISOString() ?? null })),
    refund: row.refund ? refundView(row.refund) : null
  };
}

export class Returns {
  readonly accounts: Accounts;
  readonly refunds: AutomaticRefunds;
  constructor(accounts: Accounts, refunds: AutomaticRefunds) { this.accounts = accounts; this.refunds = refunds; }

  async actor(tx: Prisma.TransactionClient, access: string, internal: boolean, admin = false) {
    return internal ? staff(this.accounts, tx, access, admin) : (await this.accounts.authorize(tx, access, true)).user;
  }

  async ownedCase(tx: Prisma.TransactionClient, id: string, actorId: string, internal: boolean) {
    const row = await tx.returnRequest.findFirst({ where: { id, ...(!internal ? { order: { userId: actorId } } : {}) }, include: caseInclude });
    if (!row) throw missing();
    return row;
  }

  async detail(access: string, id: string, internal = false) {
    return serializable(this.accounts.db, async tx => {
      const actor = await this.actor(tx, access, internal);
      const row = await this.ownedCase(tx, id, actor.id, internal);
      if (row.state !== 'AWAITING_POSTING' || !row.postingDueAt || row.postingDueAt > this.accounts.clock.now()) return view(row);
      await lockIdentities(tx, [actor.id, row.order.userId]);
      await this.actor(tx, access, internal);
      const fresh = await this.ownedCase(tx, id, actor.id, internal);
      if (fresh.state === 'AWAITING_POSTING' && fresh.postingDueAt && fresh.postingDueAt <= this.accounts.clock.now()) {
        await this.expire(tx, id, actor.id, row.orderId);
        return view(await this.ownedCase(tx, id, actor.id, internal));
      }
      return view(fresh);
    });
  }

  async open(access: string, orderId: string, data: z.infer<typeof input.request>, key: string) {
    const { db, clock } = this.accounts;
    const row = await serializable(db, async tx => {
      const first = await this.actor(tx, access, false);
      await lockIdentities(tx, [first.id]);
      const actor = await this.actor(tx, access, false);
      const identity = { actorScope: actor.id, operation: 'RETURN.OPEN', key };
      const requestHash = payloadHash({ orderId, ...data });
      const replay = await tx.idempotencyRecord.findUnique({ where: { actorScope_operation_key: identity } });
      if (replay) {
        if (replay.requestHash !== requestHash) throw conflict('Esta tentativa já foi usada com outros dados.');
        return tx.returnRequest.findUniqueOrThrow({ where: { id: replay.resultRef }, include: caseInclude });
      }
      const order = await tx.order.findFirst({ where: { id: orderId, userId: actor.id } });
      if (!order) throw missing();
      if (!beforeShipment(order.status) && order.status !== 'DELIVERED') throw conflict('A etapa do pedido não permite abrir esta devolução.');
      const now = clock.now();
      const expired = await tx.returnRequest.findMany({ where: { orderId, state: 'AWAITING_POSTING', postingDueAt: { lte: now } }, select: { id: true } });
      for (const entry of expired) await this.expire(tx, entry.id, actor.id, orderId);
      const selected: string[] = [];
      for (const item of data.items) {
        const available = { orderItemId: item.orderItemId, orderItem: { orderId }, ...unclaimedUnit } satisfies Prisma.OrderUnitWhereInput;
        const physical = !beforeShipment(order.status);
        const eligible = await tx.orderUnit.findMany({
          where: { ...available, ...(physical ? { deliveredAt: { gt: new Date(now.getTime() - sevenDays), lte: now } } : {}) },
          orderBy: { logicalIndex: 'asc' }, take: item.quantity, select: { id: true }
        });
        if (eligible.length < item.quantity) {
          if (physical && await tx.orderUnit.count({ where: available }) >= item.quantity) {
            throw new CartError(422, 'RETURN_OPENING_WINDOW', 'O prazo para solicitar a devolução destas unidades encerrou.');
          }
          throw conflict('A quantidade excede as unidades disponíveis para devolução.');
        }
        selected.push(...eligible.map(unit => unit.id));
      }
      const created = await tx.returnRequest.create({ data: {
        orderId, reason: data.reason, createdAt: now, items: { create: selected.map(orderUnitId => ({ orderUnitId })) }
      }, include: caseInclude });
      await this.record(tx, created.id, orderId, actor.id, 'OPENED');
      await tx.idempotencyRecord.create({ data: { ...identity, requestHash, resultRef: created.id, createdAt: now } });
      return created;
    });
    return view(row);
  }

  async change(access: string, id: string, command: Command, internal: boolean, key?: string) {
    if (!internal && command.type !== 'posting') throw new AccountError(403, 'STAFF_REQUIRED');
    const { db, clock } = this.accounts;
    const admin = ['authorization', 'extension', 'inspection-exception'].includes(command.type);
    const row = await serializable(db, async tx => {
      const first = await this.actor(tx, access, internal, admin);
      const target = await this.ownedCase(tx, id, first.id, internal);
      await lockIdentities(tx, [first.id, target.order.userId]);
      const actor = await this.actor(tx, access, internal, admin);
      const current = await this.ownedCase(tx, id, actor.id, internal);
      const identity = key ? { actorScope: actor.id, operation: 'RETURN.' + command.type, key } : null;
      const requestHash = identity ? payloadHash({ id, command: JSON.stringify(command) }) : '';
      if (identity) {
        const replay = await tx.idempotencyRecord.findUnique({ where: { actorScope_operation_key: identity } });
        if (replay) {
          if (replay.requestHash !== requestHash) throw conflict('Esta tentativa já foi usada com outros dados.');
          return current;
        }
      }
      const now = clock.now();
      if (current.version !== command.data.version) throw conflict('A devolução mudou. Atualize os dados.');
      if (current.state === 'AWAITING_POSTING' && current.postingDueAt && current.postingDueAt <= now
        && !['posting', 'extension'].includes(command.type)) throw conflict('O prazo de postagem encerrou.');
      const patch = await this.transition(tx, current, command, actor.id, internal, now);
      const changed = await tx.returnRequest.update({ where: { id }, data: { ...patch, version: { increment: 1 } }, include: caseInclude });
      await this.record(tx, id, current.orderId, actor.id, command.type.toUpperCase().replaceAll('-', '_'), 'reason' in command.data ? command.data.reason : undefined);
      if (identity) await tx.idempotencyRecord.create({ data: { ...identity, requestHash, resultRef: id, createdAt: now } });
      return changed;
    });
    if (command.type === 'authorization' && row.refundId && key) {
      const refund = await this.refunds.run(row.refundId, key, command.data.scenario, access, command.data.reason);
      return { ...view(row), refund };
    }
    return view(row);
  }

  private async transition(tx: Prisma.TransactionClient, row: Case, command: Command, actorId: string, internal: boolean, now: Date): Promise<Prisma.ReturnRequestUncheckedUpdateInput> {
    const id = row.id;
    const release = (rejectedOnly = false) => tx.returnItem.updateMany({ where: { returnId: id, ...(rejectedOnly ? { inspection: 'REJECTED' } : {}) }, data: { active: false } });
    switch (command.type) {
      case 'decision':
        if (row.state !== 'REQUESTED') break;
        if (command.data.decision === 'REJECT') { await release(); return { state: 'REJECTED' }; }
        if (row.items.some(item => item.orderUnit.commercialState !== 'KEPT')) break;
        if (beforeShipment(row.order.status)) return { state: 'AWAITING_REFUND', approvedAt: now };
        if (row.order.status === 'DELIVERED') return { state: 'AWAITING_POSTING', approvedAt: now, postingDueAt: new Date(now.getTime() + sevenDays) };
        break;
      case 'posting': {
        const { postedAt, trackingCode, interaction } = command.data;
        if (row.state !== 'AWAITING_POSTING' || !row.approvedAt || !row.postingDueAt) break;
        if (postedAt < row.approvedAt || postedAt >= row.postingDueAt || postedAt > now || !internal && now >= row.postingDueAt) {
          throw new CartError(422, 'RETURN_POSTING_WINDOW', 'Informe uma postagem efetiva dentro do prazo aprovado.');
        }
        if (internal ? !interaction || interaction.occurredAt < postedAt || interaction.occurredAt > now || interaction.occurredAt >= row.postingDueAt : Boolean(interaction)) {
          throw new CartError(422, 'RETURN_EXTERNAL_INTERACTION', 'Registre a interação externa efetiva no prazo, quando operada pela equipe.');
        }
        if (interaction) await tx.externalInteraction.create({ data: { ...interaction, returnId: id, actorId, createdAt: now } });
        await tx.shipment.create({ data: { orderId: row.orderId, returnId: id, kind: 'RETURN', trackingCode, postedAt, createdById: actorId, createdAt: now } });
        return { state: 'IN_TRANSIT' };
      }
      case 'receipt': {
        const shipment = row.shipments.find(item => item.kind === 'RETURN');
        const { receivedAt, units, evidenceIds } = command.data;
        if (row.state !== 'IN_TRANSIT' || !shipment || receivedAt < shipment.postedAt || receivedAt > now) break;
        if (units.length !== row.items.length || units.some(unit => !row.items.some(item => item.orderUnitId === unit.id))
          || evidenceIds.some(evidenceId => !row.evidence.some(evidence => evidence.id === evidenceId && evidence.source === 'STAFF'))) {
          throw new CartError(422, 'RETURN_INSPECTION_INPUT', 'Confira as unidades recebidas e as evidências deste atendimento.');
        }
        await tx.shipment.update({ where: { id: shipment.id }, data: { deliveredAt: receivedAt } });
        for (const unit of units) await tx.returnItem.update({ where: { returnId_orderUnitId: { returnId: id, orderUnitId: unit.id } }, data: { inspection: unit.result } });
        return { state: units.every(unit => unit.result === 'REJECTED') ? 'REJECTED_AWAITING_SHIPMENT' : 'AWAITING_REFUND', inspectedAt: now };
      }
      case 'authorization': {
        if (row.state !== 'AWAITING_REFUND') break;
        if (!row.inspectedAt && row.order.status === 'DELIVERED') return { state: 'AWAITING_POSTING', approvedAt: now, postingDueAt: new Date(now.getTime() + sevenDays) };
        const preShipment = !row.inspectedAt && beforeShipment(row.order.status);
        if (!preShipment && !row.inspectedAt) break;
        const accepted = row.items.filter(item => preShipment || item.inspection === 'FIT' || item.inspection === 'UNFIT');
        if (accepted.length !== command.data.unitIds.length || accepted.some(item => !command.data.unitIds.includes(item.orderUnitId) || item.orderUnit.commercialState !== 'KEPT')) break;
        const units = accepted.map(item => item.orderUnit);
        await tx.orderUnit.updateMany({ where: { id: { in: units.map(unit => unit.id) } }, data: { commercialState: 'RETURNED' } });
        await tx.returnItem.updateMany({ where: { returnId: id, orderUnitId: { in: units.map(unit => unit.id) } }, data: { active: false } });
        await restockReturn(tx, this.accounts.clock, id, actorId, accepted.filter(item => preShipment || item.inspection === 'FIT').map(item => item.orderUnit.currentOfferId));
        await hideReturnedReviews(tx, this.accounts.clock, row.orderId, actorId, units.map(unit => unit.orderItem.editionId));
        const refund = await allocateReturnRefund(tx, this.accounts.clock, row.orderId, id, units.map(unit => unit.netPaidCents));
        return { state: 'COMPLETED', refundAuthorizedAt: now, refundId: refund?.id ?? null };
      }
      case 'extension':
        if (!['AWAITING_POSTING', 'EXPIRED'].includes(row.state) || !row.postingDueAt || command.data.dueAt <= row.postingDueAt || command.data.dueAt <= now) break;
        if (row.state === 'EXPIRED') {
          const ids = row.items.map(item => item.orderUnitId);
          if (await tx.orderUnit.count({ where: { id: { in: ids }, ...unclaimedUnit } }) !== ids.length) break;
          await tx.returnItem.updateMany({ where: { returnId: id }, data: { active: true } });
        }
        return { state: 'AWAITING_POSTING', postingDueAt: command.data.dueAt };
      case 'rejected-shipment': {
        const { trackingCode, postedAt } = command.data;
        if (!row.inspectedAt || postedAt < row.inspectedAt || postedAt > now || !row.items.some(item => item.inspection === 'REJECTED')
          || row.shipments.some(item => item.kind === 'RETURN_REJECTED')) break;
        await tx.shipment.create({ data: { orderId: row.orderId, returnId: id, kind: 'RETURN_REJECTED', trackingCode, postedAt, createdById: actorId, createdAt: now } });
        return row.state === 'REJECTED_AWAITING_SHIPMENT' ? { state: 'REJECTED_IN_TRANSIT' } : {};
      }
      case 'rejected-delivery': {
        const shipment = row.shipments.find(item => item.kind === 'RETURN_REJECTED');
        const { deliveredAt } = command.data;
        if (!shipment || shipment.deliveredAt || deliveredAt < shipment.postedAt || deliveredAt > now) break;
        await tx.shipment.update({ where: { id: shipment.id }, data: { deliveredAt } });
        await release(true);
        return row.state === 'REJECTED_IN_TRANSIT' ? { state: 'REJECTED_DELIVERED' } : {};
      }
      case 'inspection-exception':
        if (!['REJECTED_AWAITING_SHIPMENT', 'AWAITING_REFUND'].includes(row.state)
          || !row.items.some(item => item.inspection === 'REJECTED') || row.shipments.some(item => item.kind === 'RETURN_REJECTED')) break;
        if (command.data.decision === 'KEEP_REJECTION') return {};
        await tx.returnItem.updateMany({ where: { returnId: id, inspection: 'REJECTED' }, data: { inspection: 'UNFIT' } });
        return { state: 'AWAITING_REFUND' };
    }
    throw conflict('A etapa ou as unidades da devolução não permitem esta operação.');
  }

  private async expire(tx: Prisma.TransactionClient, id: string, actorId: string, orderId: string) {
    await tx.returnRequest.update({ where: { id }, data: { state: 'EXPIRED', version: { increment: 1 } } });
    await tx.returnItem.updateMany({ where: { returnId: id }, data: { active: false } });
    await this.record(tx, id, orderId, actorId, 'EXPIRED');
  }

  private async record(tx: Prisma.TransactionClient, id: string, orderId: string, actorId: string, action: string, reason?: string) {
    const { clock } = this.accounts;
    await appendAudit(tx, { actorId, action: 'RETURN.' + action, targetType: 'RETURN', targetId: id,
      result: 'SUCCESS', reason: 'RETURN_COMMAND', changes: { orderId, ...(reason ? { reason } : {}) } }, clock);
    const request = await tx.returnRequest.findUniqueOrThrow({ where: { id }, select: { state: true, postingDueAt: true } });
    const notify = ['OPENED', 'DECISION', 'EXTENSION', 'INSPECTION_EXCEPTION', 'REJECTED_SHIPMENT', 'REJECTED_DELIVERY', 'EXPIRED'].includes(action)
      || action === 'RECEIPT' && request.state === 'REJECTED_AWAITING_SHIPMENT';
    if (!notify) return;
    const order = await tx.order.findUniqueOrThrow({ where: { id: orderId }, select: { userId: true } });
    await enqueue(tx, { type: 'RETURN.UPDATED', aggregateId: id, payload: { orderId, userId: order.userId,
      caseInfo: { id, action, state: request.state, deadline: request.postingDueAt?.toISOString() ?? null } } }, clock);
  }
}
