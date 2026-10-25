import { Accounts } from '../accounts/service.ts';
import { createDatabase } from '../../persistence/client.ts';
import type { AccountsOptions } from '../accounts/router.ts';
import { AccessMessages } from './service.ts';
import { MessageProtection } from './protection.ts';

export interface MessagingOptions extends AccountsOptions {
  mode?: string; encryptionKey?: string; technicalSecret?: string;
  limits?: { account: number; ip: number };
}
export function configuredMessages(options: MessagingOptions = {}): AccessMessages | undefined {
  if (process.env.NODE_ENV === 'production' || (options.mode ?? process.env.GARIMPO_MESSAGE_MODE) !== 'local-test') return undefined;
  const encryptionKey = options.encryptionKey ?? process.env.GARIMPO_MESSAGE_ENCRYPTION_KEY;
  const technicalSecret = options.technicalSecret ?? process.env.GARIMPO_MESSAGE_TECHNICAL_SECRET;
  const db = options.db ?? (process.env.DATABASE_URL ? createDatabase(process.env.DATABASE_URL) : undefined);
  if (!db || !encryptionKey || !technicalSecret) return undefined;
  return new AccessMessages(new Accounts(db, options.clock), new MessageProtection(encryptionKey, technicalSecret),
    options.webOrigin ?? process.env.WEB_ORIGIN ?? 'https://localhost:5173', options.limits ?? {
      account: Number(process.env.ACCESS_REQUEST_ACCOUNT_LIMIT ?? 5), ip: Number(process.env.ACCESS_REQUEST_IP_LIMIT ?? 20)
    });
}
