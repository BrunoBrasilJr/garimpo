/** Operational bootstrap only; business contracts belong to their own TASKs. */
export interface HealthResponse {
  status: 'ok';
  service: 'garimpo-api';
}
export type { ErrorEnvelope } from './errors.js';
