import type { Prisma } from '../../persistence/client.ts';
import { AccountError } from './errors.ts';
/** Caller already holds/revalidates the authenticated active customer identity. */
export async function requireFirstOrderEmail(tx: Prisma.TransactionClient, user: { id: string; emailVerifiedAt: Date | null }) {
  if (!user.emailVerifiedAt && await tx.order.count({ where: { userId: user.id } }) === 0) throw new AccountError(403, 'EMAIL_CONFIRMATION_REQUIRED');
}
