import { appendAudit } from '../../../core/audit.ts';
import { serializable } from '../../../persistence/transaction.ts';
import { lockIdentities } from '../../accounts/blocking-helpers.ts';
import { CartError, missing } from '../../cart/errors.ts';
import { prepareEvidence } from '../../media/private-evidence.ts';
import type { Returns } from '../returns/service.ts';

export async function addEvidence(service: Returns, access: string, internal: boolean, id: string, mediaType: string, input: unknown) {
  await service.detail(access, id, internal);
  const content = await prepareEvidence(input, mediaType);
  const { db, clock } = service.accounts;
  return serializable(db, async tx => {
    const first = await service.actor(tx, access, internal);
    const target = await service.ownedCase(tx, id, first.id, internal);
    await lockIdentities(tx, [first.id, target.order.userId]);
    const actor = await service.actor(tx, access, internal);
    await service.ownedCase(tx, id, actor.id, internal);
    const source = internal ? 'STAFF' : 'CUSTOMER';
    const count = await tx.evidence.count({ where: { returnId: id, source } });
    if (count >= 5) throw new CartError(409, 'EVIDENCE_LIMIT', 'O limite de cinco imagens desta origem foi atingido.');
    const row = await tx.evidence.create({
      data: { returnId: id, actorId: actor.id, source, position: count + 1, mediaType, content, createdAt: clock.now() },
      select: { id: true, source: true, mediaType: true }
    });
    await appendAudit(tx, { actorId: actor.id, action: 'RETURN.EVIDENCE_ADDED', targetType: 'RETURN', targetId: id,
      result: 'SUCCESS', reason: 'PRIVATE_EVIDENCE', changes: { evidenceId: row.id, source } }, clock);
    return row;
  });
}

export async function readEvidence(service: Returns, access: string, internal: boolean, id: string, evidenceId: string) {
  return serializable(service.accounts.db, async tx => {
    const actor = await service.actor(tx, access, internal);
    await service.ownedCase(tx, id, actor.id, internal);
    const row = await tx.evidence.findFirst({ where: { id: evidenceId, returnId: id }, select: { content: true, mediaType: true } });
    if (!row) throw missing();
    return row;
  });
}
