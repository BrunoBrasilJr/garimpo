import type { Router, Request } from 'express';
import { z } from 'zod';
import { parse } from '../accounts/validation.ts';
import type { Accounts } from '../accounts/service.ts';
import { Engagement } from './service.ts';
const id = z.string().uuid();
const pagination = z.object({ page: z.coerce.number().int().min(1).max(100000).default(1), pageSize: z.coerce.number().int().min(1).max(100).default(20) }).strict();
export function registerEngagementRoutes(router: Router, accounts: () => Accounts, access: (request: Request) => string, mutation: (request: Request) => Promise<void>) {
  const service = () => new Engagement(accounts());
  router.get('/me/wishlist', async (req, res) => { const q = parse(pagination, req.query); res.json(await service().wishes(access(req), q.page, q.pageSize)); });
  router.put('/me/wishlist/:editionId', async (req, res) => { await mutation(req); parse(z.object({}).strict(), req.body ?? {}); res.json(await service().wish(access(req), parse(id, req.params.editionId))); });
  router.delete('/me/wishlist/:editionId', async (req, res) => { await mutation(req); await service().wish(access(req), parse(id, req.params.editionId), true); res.sendStatus(204); });
  router.get('/me/availability-alerts', async (req, res) => { const q = parse(pagination, req.query); res.json(await service().alerts(access(req), q.page, q.pageSize)); });
  router.post('/me/availability-alerts', async (req, res) => { await mutation(req); const value = parse(z.object({ editionId: id, kind: z.enum(['NEW', 'USED', 'ANY']) }).strict(), req.body); res.status(201).json(await service().subscribe(access(req), value.editionId, value.kind)); });
  router.delete('/me/availability-alerts/:id', async (req, res) => { await mutation(req); await service().cancel(access(req), parse(id, req.params.id)); res.sendStatus(204); });
}
