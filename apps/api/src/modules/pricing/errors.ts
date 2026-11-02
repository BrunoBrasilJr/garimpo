export class PricingError extends Error {
  readonly status: number;
  readonly code: string;
  readonly fieldErrors: Record<string, string[]> = {};
  constructor(status: number, code: string, message: string) { super(message); this.status = status; this.code = code; }
}
