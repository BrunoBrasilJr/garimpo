import express from 'express';
import type { HealthResponse } from '@garimpo/contracts';
import { createAccountsRouter } from './modules/accounts/router.ts';
import type { AccountsOptions } from './modules/accounts/router.ts';
import { createMessagingRouter } from './modules/messaging/router.ts';
import type { MessagingOptions } from './modules/messaging/config.ts';

export function createApp(accounts?: AccountsOptions, messaging?: MessagingOptions) {
  const app = express();
  app.disable('x-powered-by');
  app.get('/health', (_request, response) => {
    const body: HealthResponse = { status: 'ok', service: 'garimpo-api' };
    response.json(body);
  });
  app.use('/api/v1', createMessagingRouter(messaging));
  app.use('/api/v1', createAccountsRouter(accounts));
  return app;
}
