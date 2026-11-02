export class CatalogError extends Error {
  readonly status: number;
  readonly code: string;
  readonly fieldErrors: Record<string, string[]>;
  constructor(status: number, code: string, message: string, fieldErrors: Record<string, string[]> = {}) {
    super(message);
    this.status = status; this.code = code; this.fieldErrors = fieldErrors;
  }
}
export const missing = () => new CatalogError(404, 'CATALOG_NOT_FOUND', 'Este item não está disponível para consulta.');
export const conflict = () => new CatalogError(409, 'CATALOG_CONFLICT', 'O item mudou ou possui vínculos. Atualize os dados e tente novamente.');
export const publication = (fields: string[]) => new CatalogError(422, 'PUBLICATION_INCOMPLETE', 'Complete os dados e as fotos antes de publicar.',
  Object.fromEntries(fields.map(field => [field, ['Obrigatório para publicação.']])));
