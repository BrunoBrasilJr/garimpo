import { z } from 'zod';
import { GOLDMINE_GRADES } from '@garimpo/contracts';
import { CatalogError } from './errors.ts';

export const id = z.string().uuid();
const text = (max: number) => z.string().trim().min(1).max(max).refine(value => !value.includes('\0'), 'O texto contém um caractere inválido.');
const nullableText = (max: number) => text(max).nullable().optional();
const integer = z.number().int().min(0).max(2147483647);
const ids = z.array(id).min(1).max(100).refine(values => new Set(values).size === values.length, 'Não repita itens.');
export const metadataType = z.enum(['artist', 'genre', 'label']);
export const metadataInput = z.object({ name: text(200).transform(value => value.normalize('NFKC').replace(/\s+/g, ' ')).pipe(text(200)) }).strict();
export const metadataCreate = metadataInput.extend({ type: metadataType });
export const trackInput = z.object({ position: integer.min(1), title: text(300),
  durationSeconds: integer.nullable().optional(),
  audioUrl: z.string().url().max(2048).refine(value => { const url = new URL(value); return !value.includes('\0') && url.protocol === 'https:' && !url.username && !url.password; }, 'Use uma URL HTTPS sem credenciais.').nullable().optional(),
  artistIds: z.array(id).max(100).refine(values => new Set(values).size === values.length).default([])
}).strict();
const editionShape = { title: text(300), artistIds: ids, genreIds: ids, primaryGenreId: id,
  format: text(60), labelId: id.nullable().optional(), originalYear: integer.min(1).max(9999).nullable().optional(),
  editionYear: integer.min(1).max(9999).nullable().optional(), catalogNumber: nullableText(100),
  weightGrams: integer.min(1).nullable().optional(), pressingCountry: nullableText(100),
  collectorEdition: z.boolean().optional(), lowStockNewThreshold: integer.optional(), active: z.boolean().optional(),
  tracks: z.array(trackInput).max(1000).refine(values => new Set(values.map(item => item.position)).size === values.length, 'Não repita posições de faixa.').optional() };
export const editionCreate = z.object(editionShape).strict().refine(value => value.genreIds.includes(value.primaryGenreId), { path: ['primaryGenreId'], message: 'O gênero principal deve estar entre os gêneros da edição.' });
export const editionPatch = z.object(editionShape).partial().strict().refine(value => Object.keys(value).length > 0);
export const offerCreate = z.object({ kind: z.enum(['NEW', 'USED']), priceCents: integer.min(1),
  discGrade: z.enum(GOLDMINE_GRADES).nullable().optional(), sleeveGrade: z.enum(GOLDMINE_GRADES).nullable().optional(),
  particulars: nullableText(4000), stockOnHand: integer.default(0), active: z.boolean().default(false)
}).strict().superRefine((value, context) => {
  if (value.kind === 'USED' && value.stockOnHand > 1) context.addIssue({ code: 'custom', path: ['stockOnHand'], message: 'Um usado é um exemplar individual.' });
  if (value.kind === 'NEW' && (value.discGrade || value.sleeveGrade || value.particulars)) context.addIssue({ code: 'custom', message: 'Conservação e particularidades pertencem ao usado.' });
});
export const offerPatch = z.object({ version: integer.min(1), priceCents: integer.min(1).optional(),
  discGrade: z.enum(GOLDMINE_GRADES).nullable().optional(), sleeveGrade: z.enum(GOLDMINE_GRADES).nullable().optional(),
  particulars: nullableText(4000), active: z.boolean().optional()
}).strict().refine(value => Object.keys(value).some(key => key !== 'version'));
const queryInteger = z.coerce.number().int().min(0).max(2147483647);
export const catalogQuery = z.object({ q: text(200).optional(), artist: id.optional(), genre: id.optional(),
  decade: queryInteger.max(9990).refine(value => value % 10 === 0).optional(), minPrice: queryInteger.optional(), maxPrice: queryInteger.optional(),
  discCondition: z.enum(GOLDMINE_GRADES).optional(), sleeveCondition: z.enum(GOLDMINE_GRADES).optional(),
  available: z.enum(['true', 'false']).transform(value => value === 'true').optional(),
  page: queryInteger.min(1).max(100000).default(1), pageSize: queryInteger.min(1).max(100).default(20),
  active: z.enum(['true', 'false']).transform(value => value === 'true').optional()
}).strict().refine(value => value.minPrice === undefined || value.maxPrice === undefined || value.minPrice <= value.maxPrice, { path: ['maxPrice'], message: 'O preço máximo deve ser maior ou igual ao mínimo.' });
export const imageQuery = z.object({ description: text(500), position: queryInteger.min(1).max(10).optional() }).strict();
export const reasonInput = z.object({ reason: text(500) }).strict();
export type EditionCreate = z.infer<typeof editionCreate>;
export type EditionPatch = z.infer<typeof editionPatch>;
export type OfferCreate = z.infer<typeof offerCreate>;
export type OfferPatch = z.infer<typeof offerPatch>;
export type CatalogQuery = z.infer<typeof catalogQuery>;
export function parse<T>(schema: z.ZodType<T>, value: unknown): T {
  const result = schema.safeParse(value);
  if (result.success) return result.data;
  const fields: Record<string, string[]> = {};
  for (const issue of result.error.issues) (fields[issue.path.join('.') || 'form'] ??= []).push(issue.message);
  throw new CatalogError(422, 'INVALID_INPUT', 'Verifique os dados informados.', fields);
}
