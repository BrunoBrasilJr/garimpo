import type { Router, Request } from 'express';
import { z } from 'zod';
import type { Catalog } from '../catalog/service.ts';
import { parse, id } from '../catalog/validation.ts';
import { Inventory } from './service.ts';

export function registerInventoryRoutes(router: Router, catalog: () => Catalog, access: (request: Request) => string) {
  const service = () => new Inventory(catalog());
  const whole = z.number().int().min(0).max(2147483647);
  router.get('/admin/stock', async (request, response) => {
    const query = parse(z.object({ editionId: id.optional(), page: z.coerce.number().int().min(1).max(100000).default(1),
      pageSize: z.coerce.number().int().min(1).max(100).default(20), lowStock: z.enum(['true', 'false']).transform(value => value === 'true').optional(),
      includeInactive: z.enum(['true', 'false']).transform(value => value === 'true').optional() }).strict(), request.query);
    response.json(await service().list(access(request), query));
  });
  router.post('/admin/offers/:id/stock-adjustments', async (request, response) => {
    const value = parse(z.object({ delta: z.number().int().min(-2147483647).max(2147483647).refine(value => value !== 0),
      reason: z.string().trim().min(1).max(500).refine(value => !value.includes('\0')) }).strict(), request.body);
    const key = parse(z.string().min(1).max(128), request.get('idempotency-key'));
    response.status(201).json(await service().adjust(access(request), parse(id, request.params.id), value.delta, value.reason, key));
  });
  router.patch('/admin/editions/:id/low-stock', async (request, response) => {
    const value = parse(z.object({ lowStockNewThreshold: whole }).strict(), request.body);
    response.json(await service().threshold(access(request), parse(id, request.params.id), value.lowStockNewThreshold));
  });
}
