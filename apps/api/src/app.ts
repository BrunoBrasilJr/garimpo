import express from 'express';
import type { HealthResponse } from '@garimpo/contracts';

export function createApp() {
  const app = express();
  app.disable('x-powered-by');
  app.get('/health', (_request, response) => {
    const body: HealthResponse = { status: 'ok', service: 'garimpo-api' };
    response.json(body);
  });
  return app;
}
