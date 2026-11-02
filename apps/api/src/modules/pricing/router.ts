import type { Router, Request } from 'express';
import { z } from 'zod';
import type { Pricing } from './service.ts';
import * as input from './validation.ts';
const id = z.string().uuid();
export function registerPricingRoutes(router: Router, service: () => Pricing, access: (request: Request) => string) {
  router.get('/admin/coupons', async (req, res) => { res.json(await service().coupons(access(req), input.parse(input.listQuery, req.query))); });
  router.post('/admin/coupons', async (req, res) => { res.status(201).json(await service().createCoupon(access(req), input.parse(input.couponCreate, req.body))); });
  router.patch('/admin/coupons/:id', async (req, res) => { res.json(await service().updateCoupon(access(req), input.parse(id, req.params.id), input.parse(input.couponPatch, req.body))); });
  router.get('/admin/promotions', async (req, res) => { res.json(await service().promotions(access(req), input.parse(input.listQuery, req.query))); });
  router.post('/admin/promotions', async (req, res) => { res.status(201).json(await service().createPromotion(access(req), input.parse(input.promotionCreate, req.body))); });
  router.patch('/admin/promotions/:id', async (req, res) => { res.json(await service().updatePromotion(access(req), input.parse(id, req.params.id), input.parse(input.promotionPatch, req.body))); });
}
