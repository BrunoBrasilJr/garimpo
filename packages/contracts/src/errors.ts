export interface ErrorEnvelope {
  code: string;
  message: string;
  fieldErrors: Record<string, string[]>;
  correlationId: string;
}
