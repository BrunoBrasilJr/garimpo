import type { AccountView, AddressInput } from './index.js';
import type { OrderSummary } from '../orders/index.js';
export interface CustomerRecord extends AccountView { closedAt: string | null; createdAt: string; revision: string }
export interface CustomerPage { items: CustomerRecord[]; total: number; page: number; pageSize: number; totalPages: number }
export interface CustomerDetail extends CustomerRecord { addresses: (Omit<AddressInput, 'complement'> & { id: string; complement: string | null })[]; orders: OrderSummary[]; orderCount: number }
export interface CustomerRestriction { revision: string; reason: string }
export interface CustomerCorrection { revision: string; name?: string; email?: string }
export interface ClosureResult { closed: true; message: string }
