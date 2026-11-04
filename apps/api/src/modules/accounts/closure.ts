import type { ClosureResult } from '@garimpo/contracts';
import type { Accounts } from './service.ts';
import { serializable } from '../../persistence/transaction.ts';
import { appendAudit } from '../../core/audit.ts';
import { cancelAccountCommitments } from '../orders/account-lifecycle.ts';
import { lockIdentities, receipt, revokeAccess } from './blocking-helpers.ts';
import * as input from './blocking-validation.ts';

export async function closeAccount(accounts: Accounts, access: string, body: unknown, key: string): Promise<ClosureResult> {
  input.parse(input.closure, body); key = input.parse(input.key, key);
  await serializable(accounts.db, async tx => {
    const first = (await accounts.authorize(tx, access, true)).user; await lockIdentities(tx, [first.id]);
    const user = (await accounts.authorize(tx, access, true)).user, record = await receipt(tx, user.id, 'ACCOUNT.CLOSE', key, { confirm: true });
    if (record.replayed) return;
    await cancelAccountCommitments(tx, accounts.clock, user.id, user, 'ACCOUNT_CLOSED');
    const now = accounts.clock.now(); await tx.user.update({ where: { id: user.id }, data: { closedAt: now } }); await revokeAccess(tx, user.id, now);
    await appendAudit(tx, { actorId: user.id, action: 'ACCOUNT.CLOSED', targetType: 'USER', targetId: user.id, result: 'SUCCESS', reason: 'VOLUNTARY_CLOSURE_CONFIRMED', changes: {} }, accounts.clock);
    await record.save(user.id, now);
  });
  return { closed: true, message: 'Conta encerrada. Pedidos pagos e histórico foram preservados. A reativação depende de confirmação por e-mail e da retenção dos dados.' };
}
