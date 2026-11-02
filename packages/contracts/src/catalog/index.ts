export const GOLDMINE_GRADES = ['M', 'NM', 'VG+', 'VG', 'G+', 'G', 'F', 'P'] as const;
export type ConditionGradeCode = typeof GOLDMINE_GRADES[number];
export type OfferKind = 'NEW' | 'USED';
export type MetadataType = 'artist' | 'genre' | 'label';
export interface CatalogMetadata { id: string; name: string }
export interface CatalogImage {
  id: string; url: string; description: string; position: number; contentHash: string;
  mimeType: string; byteSize: number; width: number; height: number;
}
export interface CatalogTrack {
  id: string; position: number; title: string; durationSeconds: number | null;
  audioUrl: string | null; artists: CatalogMetadata[];
}
export interface CatalogOffer {
  id: string; editionId: string; kind: OfferKind; priceCents: number;
  discGrade: ConditionGradeCode | null; sleeveGrade: ConditionGradeCode | null;
  particulars: string | null; stockOnHand: number; active: boolean; available: boolean;
  version: number; images: CatalogImage[];
}
export interface CatalogEdition {
  id: string; title: string; label: CatalogMetadata | null; primaryGenre: CatalogMetadata;
  artists: CatalogMetadata[]; genres: CatalogMetadata[]; originalYear: number | null;
  editionYear: number | null; format: string; catalogNumber: string | null;
  weightGrams: number | null; pressingCountry: string | null; collectorEdition: boolean;
  lowStockNewThreshold: number; active: boolean; available: boolean;
  minPriceCents: number | null; tracks: CatalogTrack[]; offers: CatalogOffer[]; images: CatalogImage[];
}
export interface CatalogPage {
  items: CatalogEdition[]; page: number; pageSize: number; total: number; totalPages: number;
}
export interface CatalogFilters {
  artists: CatalogMetadata[]; genres: CatalogMetadata[]; formats: string[]; decades: number[];
  conditions: { code: ConditionGradeCode; label: string; rank: number }[];
}
