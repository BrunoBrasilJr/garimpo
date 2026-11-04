import express from 'express';
import type { Request, Router } from 'express';
import { z } from 'zod';
import { CartError } from '../../cart/errors.ts';
import * as validate from '../../orders/history-validation.ts';
import type { ExchangeCommand } from './model.ts';
import type { Exchanges } from './service.ts';
import * as input from './validation.ts';

export function registerExchangeRoutes(router: Router, service: Exchanges | null, credentials: (req: Request) => { access: string; internal: boolean }) {
  const empty = z.object({}).strict();
  const json = express.json({ limit: '1mb', strict: true });
  const id = (req: Request) => validate.parse(validate.id, req.params.id);
  const key = (req: Request) => validate.parse(validate.key, req.get('idempotency-key'));
  router.post('/orders/:id/exchanges', json, async (req, res) => {
    validate.parse(empty, req.query);
    res.status(201).json(await service!.open(credentials(req).access, id(req), validate.parse(input.request, req.body), key(req)));
  });
  router.get(['/me/exchanges/:id', '/admin/exchanges/:id'], async (req, res) => {
    validate.parse(empty, req.query);
    const { access, internal } = credentials(req);
    res.json(await service!.detail(access, id(req), internal));
  });
  const routes = [
    ['/admin/exchanges/:id/decision', 'decision', input.decision],
    ['/exchanges/:id/posting', 'posting', input.posting],
    ['/admin/exchanges/:id/receipt', 'receipt', input.inspection],
    ['/admin/exchanges/:id/substitute-offers', 'offer', input.offer],
    ['/exchanges/:id/substitute-offers/:substituteId/response', 'response', input.response],
    ['/admin/exchanges/:id/shipment', 'shipment', input.shipment],
    ['/admin/exchanges/:id/delivery', 'delivery', input.delivery],
    ['/admin/exchanges/:id/cancel', 'cancel', input.close],
    ['/exchanges/:id/convert-to-return', 'convert', input.close]
  ] as const;
  for (const [path, type, schema] of routes) {
    router.post(path, json, async (req, res) => {
      validate.parse(empty, req.query);
      const parsed = schema.safeParse(req.body);
      if (!parsed.success) throw new CartError(422, 'INVALID_EXCHANGE_INPUT', 'Confira os dados da troca.');
      const substitute = 'substituteId' in req.params ? { substituteId: validate.parse(validate.id, req.params.substituteId) } : {};
      const command = { type, data: parsed.data, ...substitute } as ExchangeCommand;
      const { access, internal } = credentials(req);
      res.json(await service!.change(access, id(req), command, internal, type === 'cancel' ? key(req) : undefined));
    });
  }
}
