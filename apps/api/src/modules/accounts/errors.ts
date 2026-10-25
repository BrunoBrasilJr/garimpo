export class AccountError extends Error {
  readonly status: number;
  readonly code: string;
  readonly fieldErrors: Record<string, string[]>;
  constructor(status: number, code: string, fieldErrors: Record<string, string[]> = {}) {
    const messages: Record<number, string> = {
      401: 'Credenciais inválidas ou sessão expirada.', 403: 'Operação não permitida.',
      404: 'Recurso não encontrado.', 409: 'A operação conflita com o estado atual.',
      422: 'Verifique os dados informados.', 429: 'Limite de tentativas atingido. Tente novamente mais tarde.',
      503: 'Serviço temporariamente indisponível.'
    };
    super(messages[status] ?? 'Não foi possível concluir a operação.');
    this.status = status; this.code = code; this.fieldErrors = fieldErrors;
  }
}
