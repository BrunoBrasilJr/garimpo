import express from 'express';
import type { HealthResponse } from '@garimpo/contracts';
import { createAccountsRouter } from './modules/accounts/router.ts';
import type { AccountsOptions } from './modules/accounts/router.ts';
import { createMessagingRouter } from './modules/messaging/router.ts';
import type { MessagingOptions } from './modules/messaging/config.ts';
import { createCatalogRouter } from './modules/catalog/router.ts';
import type { CatalogOptions } from './modules/catalog/router.ts';
import { createReviewsRouter } from './modules/reviews/router.ts';
import type { ReviewOptions } from './modules/reviews/router.ts';
import { createCartRouter } from './modules/cart/router.ts';
import type { CheckoutOptions } from './modules/cart/router.ts';

export function createApp(accounts?: AccountsOptions, messaging?: MessagingOptions, catalog?: CatalogOptions, reviews?: ReviewOptions, checkout?: CheckoutOptions) {
  const app = express();
  app.disable('x-powered-by');
  app.get('/health', (_request, response) => {
    const body: HealthResponse = { status: 'ok', service: 'garimpo-api' };
    response.json(body);
  });
  app.use('/api/v1', createCartRouter({ ...accounts, ...checkout }));
  app.use('/api/v1', createReviewsRouter({ ...accounts, ...reviews }));
  app.use('/api/v1', createCatalogRouter({ ...accounts, ...catalog }));
  app.use('/api/v1', createMessagingRouter(messaging));
  app.use('/api/v1', createAccountsRouter(accounts));
  return app;
}
