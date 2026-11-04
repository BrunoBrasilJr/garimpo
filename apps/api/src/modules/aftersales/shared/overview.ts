import type { AftersalesOverview } from '@garimpo/contracts';
import { serializable } from '../../../persistence/transaction.ts';
import { staff } from '../../accounts/blocking-helpers.ts';
import type { Accounts } from '../../accounts/service.ts';
import { missing } from '../../cart/errors.ts';

export async function aftersalesOverview(accounts: Accounts, access: string, orderId: string, internal: boolean): Promise<AftersalesOverview> {
  return serializable(accounts.db, async tx => {
    const actor = internal ? await staff(accounts, tx, access) : (await accounts.authorize(tx, access, true)).user;
    const order = await tx.order.findFirst({ where: { id: orderId, ...(!internal ? { userId: actor.id } : {}) }, select: {
      items: { select: { id: true, offerId: true, editionId: true, units: { orderBy: { logicalIndex: 'asc' }, select: {
        id: true, commercialState: true, deliveredAt: true,
        returnItems: { where: { active: true }, select: { returnId: true } },
        exchangeItems: { where: { active: true }, select: { exchangeId: true } }
      } } } },
      returns: { orderBy: { createdAt: 'desc' }, select: { id: true, state: true, createdAt: true } },
      exchanges: { orderBy: { createdAt: 'desc' }, select: { id: true, state: true, createdAt: true } }
    } });
    if (!order) throw missing();
    return {
      orderId,
      groups: order.items.map(item => ({ orderItemId: item.id, offerId: item.offerId, editionId: item.editionId,
        units: item.units.map(unit => ({
          id: unit.id, available: unit.commercialState === 'KEPT' && !unit.returnItems.length && !unit.exchangeItems.length,
          deliveredAt: unit.deliveredAt?.toISOString() ?? null
        })) })),
      returns: order.returns.map(row => ({ ...row, createdAt: row.createdAt.toISOString() })),
      exchanges: order.exchanges.map(row => ({ ...row, createdAt: row.createdAt.toISOString() }))
    };
  });
}
