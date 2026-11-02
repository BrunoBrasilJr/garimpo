import type { CatalogFilters, CatalogPage, MetadataType } from '@garimpo/contracts';
import type { Database, Prisma } from '../../persistence/client.ts';
import type { Clock } from '../../core/clock.ts';
import { appendAudit } from '../../core/audit.ts';
import { enqueue } from '../../core/outbox.ts';
import { idempotent } from '../../core/idempotency.ts';
import { serializable } from '../../persistence/transaction.ts';
import { Accounts } from '../accounts/service.ts';
import { AccountError } from '../accounts/errors.ts';
import { PublicImageStore } from '../media/store.ts';
import { CatalogError, missing, conflict, publication } from './errors.ts';
import { editionInclude, editionView, offerView, imageView } from './views.ts';
import type { EditionRecord } from './views.ts';
import type { CatalogQuery, EditionCreate, EditionPatch, OfferCreate, OfferPatch } from './validation.ts';
import { recordOpening } from '../inventory/ledger.ts';
import { requireUnbound, unavailableCommercialBindings } from './lifecycle.ts';
import type { CommercialBindings } from './lifecycle.ts';
import { availability, availabilityReturned } from '../engagement/availability.ts';

type Tx = Prisma.TransactionClient;
const includeOffer = { images: { orderBy: [{ position: 'asc' }, { id: 'asc' }] } } satisfies Prisma.OfferInclude;
const literalLike = (value: string) => value.replace(/[\\%_]/g, '\\$&');
export class Catalog {
  readonly db: Database;
  readonly clock: Clock;
  readonly accounts: Accounts;
  readonly images: PublicImageStore;
  readonly commercialBindings: CommercialBindings;
  constructor(accounts: Accounts, images = new PublicImageStore(), commercialBindings: CommercialBindings = unavailableCommercialBindings) {
    this.accounts = accounts; this.images = images; this.commercialBindings = commercialBindings;
    this.db = accounts.db; this.clock = accounts.clock;
  }

  async staff(tx: Tx | Database, access: string) {
    const { user } = await this.accounts.authorize(tx, access);
    if (user.context !== 'STAFF' || !['ADMIN', 'OPERATOR'].includes(user.role)) throw new AccountError(403, 'STAFF_REQUIRED');
    return user;
  }
  private async lockEdition(tx: Tx, id: string) {
    const rows = await tx.$queryRaw<{ id: string }[]>`SELECT id FROM "Edition" WHERE id = ${id}::uuid FOR UPDATE`;
    if (!rows.length) throw missing();
  }
  private async record(tx: Tx, actorId: string, action: string, type: string, id: string, changes: Prisma.InputJsonValue) {
    await appendAudit(tx, { actorId, action, targetType: type, targetId: id, result: 'SUCCESS', reason: 'CATALOG_COMMAND', changes }, this.clock);
    await enqueue(tx, { type: 'CATALOG.CHANGED', aggregateId: id, payload: { action, targetType: type, targetId: id } }, this.clock);
  }
  private validatePublication(edition: EditionRecord) {
    if (!edition.active) return;
    const fields = [];
    if (!edition.title.trim()) fields.push('title');
    if (!edition.format.trim()) fields.push('format');
    if (!edition.artists.length) fields.push('artistIds');
    if (!edition.genres.some(item => item.genreId === edition.primaryGenreId)) fields.push('primaryGenreId');
    if (!edition.images.length) fields.push('images');
    if (fields.length) throw publication(fields);
  }
  private validateOffer(offer: { kind: string; priceCents: number; discGrade: string | null; sleeveGrade: string | null; particulars: string | null; active: boolean; images: unknown[] }) {
    if (offer.kind === 'NEW' && (offer.discGrade || offer.sleeveGrade || offer.particulars)) throw new CatalogError(422, 'INVALID_INPUT', 'Conservação e particularidades pertencem ao usado.');
    if (!offer.active) return;
    const fields = [];
    if (offer.priceCents <= 0) fields.push('priceCents');
    if (offer.kind === 'USED') {
      if (!offer.discGrade) fields.push('discGrade');
      if (!offer.sleeveGrade) fields.push('sleeveGrade');
      if (!offer.particulars?.trim()) fields.push('particulars');
      if (!offer.images.length) fields.push('images');
    }
    if (fields.length) throw publication(fields);
  }

  async metadata(access: string, type: MetadataType) {
    await this.staff(this.db, access);
    const args = { orderBy: [{ name: 'asc' as const }, { id: 'asc' as const }] };
    return { items: type === 'artist' ? await this.db.artist.findMany(args) : type === 'genre' ? await this.db.genre.findMany(args) : await this.db.label.findMany(args) };
  }
  async changeMetadata(access: string, type: MetadataType, name?: string, id?: string) {
    return serializable(this.db, async tx => {
      const actor = await this.staff(tx, access);
      const data = { name: (name ?? '').normalize('NFKC').replace(/\s+/g, ' ').trim() };
      const where = { id: id ?? '' };
      const item = !id
        ? type === 'artist' ? await tx.artist.create({ data }) : type === 'genre' ? await tx.genre.create({ data }) : await tx.label.create({ data })
        : name !== undefined
          ? type === 'artist' ? await tx.artist.update({ where, data }) : type === 'genre' ? await tx.genre.update({ where, data }) : await tx.label.update({ where, data })
          : type === 'artist' ? await tx.artist.delete({ where }) : type === 'genre' ? await tx.genre.delete({ where }) : await tx.label.delete({ where });
      await this.record(tx, actor.id, !id ? 'CATALOG.METADATA_CREATED' : name === undefined ? 'CATALOG.METADATA_DELETED' : 'CATALOG.METADATA_UPDATED', 'CATALOG_METADATA', item.id, { type, name: item.name });
      return item;
    });
  }

  private fields(input: EditionCreate | EditionPatch, previous?: EditionRecord) {
    return { title: input.title ?? previous?.title ?? '', format: input.format ?? previous?.format ?? '',
      primaryGenreId: input.primaryGenreId ?? previous?.primaryGenreId ?? '',
      labelId: input.labelId === undefined ? previous?.labelId ?? null : input.labelId,
      originalYear: input.originalYear === undefined ? previous?.originalYear ?? null : input.originalYear,
      editionYear: input.editionYear === undefined ? previous?.editionYear ?? null : input.editionYear,
      catalogNumber: input.catalogNumber === undefined ? previous?.catalogNumber ?? null : input.catalogNumber,
      weightGrams: input.weightGrams === undefined ? previous?.weightGrams ?? null : input.weightGrams,
      pressingCountry: input.pressingCountry === undefined ? previous?.pressingCountry ?? null : input.pressingCountry,
      collectorEdition: input.collectorEdition ?? previous?.collectorEdition ?? false,
      lowStockNewThreshold: input.lowStockNewThreshold ?? previous?.lowStockNewThreshold ?? 0,
      active: input.active ?? previous?.active ?? false };
  }
  private tracks(input: NonNullable<EditionCreate['tracks']>) {
    return input.map(track => ({ position: track.position, title: track.title,
      durationSeconds: track.durationSeconds ?? null, audioUrl: track.audioUrl ?? null,
      artists: { create: track.artistIds.map(artistId => ({ artistId })) } }));
  }
  async createEdition(access: string, input: EditionCreate) {
    return serializable(this.db, async tx => {
      const actor = await this.staff(tx, access);
      if (!input.genreIds.includes(input.primaryGenreId)) throw publication(['primaryGenreId']);
      const edition = await tx.edition.create({ data: { ...this.fields(input),
        artists: { create: input.artistIds.map(artistId => ({ artistId })) },
        genres: { create: input.genreIds.map(genreId => ({ genreId })) }, tracks: { create: this.tracks(input.tracks ?? []) }
      }, include: editionInclude });
      this.validatePublication(edition);
      await this.record(tx, actor.id, 'CATALOG.EDITION_CREATED', 'EDITION', edition.id, { title: edition.title, active: edition.active });
      return editionView(edition);
    });
  }
  async updateEdition(access: string, id: string, input: EditionPatch, reason?: string) {
    return serializable(this.db, async tx => {
      const actor = await this.staff(tx, access); await this.lockEdition(tx, id);
      const beforeAvailability = await availability(tx, id);
      const previous = await tx.edition.findUniqueOrThrow({ where: { id }, include: editionInclude });
      const fields = this.fields(input, previous), genres = input.genreIds ?? previous.genres.map(item => item.genreId);
      if (!genres.includes(fields.primaryGenreId)) throw publication(['primaryGenreId']);
      await tx.edition.update({ where: { id }, data: fields });
      if (input.artistIds) {
        await tx.editionArtist.deleteMany({ where: { editionId: id } });
        await tx.editionArtist.createMany({ data: input.artistIds.map(artistId => ({ editionId: id, artistId })) });
      }
      if (input.genreIds) {
        await tx.editionGenre.deleteMany({ where: { editionId: id } });
        await tx.editionGenre.createMany({ data: input.genreIds.map(genreId => ({ editionId: id, genreId })) });
      }
      if (input.tracks) {
        await tx.track.deleteMany({ where: { editionId: id } });
        for (const track of this.tracks(input.tracks)) await tx.track.create({ data: { editionId: id, ...track } });
      }
      const edition = await tx.edition.findUniqueOrThrow({ where: { id }, include: editionInclude });
      this.validatePublication(edition);
      await this.record(tx, actor.id, reason ? 'CATALOG.EDITION_INACTIVATED' : 'CATALOG.EDITION_UPDATED', 'EDITION', id,
        { fields: Object.keys(input), beforeActive: previous.active, afterActive: edition.active, ...(reason ? { reason } : {}) });
      await availabilityReturned(tx, id, beforeAvailability, this.clock);
      return editionView(edition);
    });
  }
  async createOffer(access: string, editionId: string, input: OfferCreate, key: string) {
    const actor = await this.staff(this.db, access);
    const command = await idempotent(this.db, { actorScope: actor.id, operation: 'CATALOG.OFFER_CREATE', key, payload: { editionId, ...input } }, async tx => {
      await this.staff(tx, access); await this.lockEdition(tx, editionId);
      const beforeAvailability = await availability(tx, editionId);
      const data = { editionId, kind: input.kind, priceCents: input.priceCents,
        stockOnHand: input.stockOnHand, active: input.active, discGrade: input.discGrade ?? null,
        sleeveGrade: input.sleeveGrade ?? null, particulars: input.particulars ?? null };
      this.validateOffer({ ...data, images: [] });
      if (data.kind === 'NEW' && data.active && !await tx.productImage.count({ where: { editionId } })) throw publication(['images']);
      const offer = await tx.offer.create({ data, include: includeOffer });
      await recordOpening(tx, offer, actor.id, this.clock);
      await this.record(tx, actor.id, 'CATALOG.OFFER_CREATED', 'OFFER', offer.id, { kind: offer.kind, priceCents: offer.priceCents, stockOnHand: offer.stockOnHand });
      await availabilityReturned(tx, editionId, beforeAvailability, this.clock);
      return offer.id;
    }, this.clock);
    const offer = await this.db.offer.findUnique({ where: { id: command.resultRef }, include: { ...includeOffer, edition: true } });
    if (!offer) throw missing();
    return offerView(offer, offer.edition.active);
  }
  async updateOffer(access: string, id: string, input: OfferPatch | { active: false }, reason?: string) {
    return serializable(this.db, async tx => {
      const actor = await this.staff(tx, access);
      const previous = await tx.offer.findUnique({ where: { id }, include: { ...includeOffer, edition: { include: { images: true } } } }); if (!previous) throw missing();
      await this.lockEdition(tx, previous.editionId);
      const beforeAvailability = await availability(tx, previous.editionId);
      const expected = 'version' in input ? input.version : previous.version;
      const patch: Partial<OfferPatch> = input;
      if (previous.version !== expected) throw conflict();
      const data = { priceCents: patch.priceCents ?? previous.priceCents,
        discGrade: patch.discGrade === undefined ? previous.discGrade : patch.discGrade,
        sleeveGrade: patch.sleeveGrade === undefined ? previous.sleeveGrade : patch.sleeveGrade,
        particulars: patch.particulars === undefined ? previous.particulars : patch.particulars,
        active: patch.active ?? previous.active, version: { increment: 1 } };
      this.validateOffer({ ...previous, ...data });
      if (previous.kind === 'NEW' && data.active && !previous.edition.images.length) throw publication(['images']);
      const offer = await tx.offer.update({ where: { id, version: expected }, data, include: { ...includeOffer, edition: true } });
      await this.record(tx, actor.id, reason ? 'CATALOG.OFFER_INACTIVATED' : 'CATALOG.OFFER_UPDATED', 'OFFER', id,
        { fields: Object.keys(input), beforePriceCents: previous.priceCents, afterPriceCents: offer.priceCents, beforeActive: previous.active, afterActive: offer.active, ...(reason ? { reason } : {}) });
      await availabilityReturned(tx, previous.editionId, beforeAvailability, this.clock);
      return offerView(offer, offer.edition.active);
    });
  }

  async upload(access: string, owner: 'edition' | 'offer', ownerId: string, bytes: Buffer, mime: string, description: string, position?: number) {
    await this.staff(this.db, access);
    if (owner === 'edition') { if (!await this.db.edition.findUnique({ where: { id: ownerId } })) throw missing(); }
    else {
      const offer = await this.db.offer.findUnique({ where: { id: ownerId } }); if (!offer) throw missing();
      if (offer.kind !== 'USED') throw new CatalogError(422, 'EDITION_IMAGE_REQUIRED', 'Novos usam as imagens da edição.');
    }
    // External I/O must remain outside retried transactions. Unreferenced immutable files await retention-aware collection.
    const stored = await this.images.put(bytes, mime);
    return serializable(this.db, async tx => {
      const actor = await this.staff(tx, access);
      const offer = owner === 'offer' ? await tx.offer.findUnique({ where: { id: ownerId } }) : null;
      if (owner === 'offer' && (!offer || offer.kind !== 'USED')) throw missing();
      await this.lockEdition(tx, owner === 'edition' ? ownerId : offer!.editionId);
      const where = owner === 'edition' ? { editionId: ownerId } : { offerId: ownerId };
      const existing = await tx.productImage.findMany({ where, select: { position: true } });
      const maximum = owner === 'edition' ? 10 : 8;
      if (existing.length >= maximum || (position !== undefined && position > maximum)) throw new CatalogError(409, 'IMAGE_LIMIT_EXCEEDED', `Limite de ${maximum} imagens atingido.`);
      const occupied = new Set(existing.map(image => image.position));
      const selected = position ?? Array.from({ length: maximum }, (_, index) => index + 1).find(value => !occupied.has(value));
      if (!selected || occupied.has(selected)) throw conflict();
      const image = await tx.productImage.create({ data: { ...where, ...stored, description, position: selected } });
      await this.record(tx, actor.id, 'CATALOG.IMAGE_CREATED', 'PRODUCT_IMAGE', image.id, { owner, ownerId, contentHash: stored.contentHash });
      return imageView(image);
    });
  }
  async deleteImage(access: string, id: string) {
    return serializable(this.db, async tx => {
      const actor = await this.staff(tx, access);
      const image = await tx.productImage.findUnique({ where: { id }, include: { offer: true } }); if (!image) throw missing();
      const editionId = image.editionId ?? image.offer!.editionId; await this.lockEdition(tx, editionId);
      const owner = image.editionId ? await tx.edition.findUniqueOrThrow({ where: { id: editionId } }) : image.offer!;
      const where = image.editionId ? { editionId } : { offerId: image.offerId! };
      if (owner.active && await tx.productImage.count({ where }) <= 1) throw new CatalogError(409, 'IMAGE_REQUIRED', 'Inative o item antes de remover sua última foto.');
      await tx.productImage.delete({ where: { id } });
      await this.record(tx, actor.id, 'CATALOG.IMAGE_DELETED', 'PRODUCT_IMAGE', id, { ownerId: image.editionId ?? image.offerId! });
    });
  }
  async remove(access: string, kind: 'edition' | 'offer', id: string) {
    return serializable(this.db, async tx => {
      const actor = await this.staff(tx, access);
      const offer = kind === 'offer' ? await tx.offer.findUnique({ where: { id } }) : null;
      if (kind === 'offer' && !offer) throw missing();
      await this.lockEdition(tx, kind === 'edition' ? id : offer!.editionId);
      const offerIds = kind === 'edition' ? (await tx.offer.findMany({ where: { editionId: id }, select: { id: true } })).map(item => item.id) : [id];
      await requireUnbound(this.commercialBindings, tx, kind === 'edition' ? id : offer!.editionId, offerIds);
      // Restrictive commercial FKs may abort these deletes; never cascade a commercial history.
      if (kind === 'edition') { await tx.offer.deleteMany({ where: { editionId: id } }); await tx.edition.delete({ where: { id } }); }
      else await tx.offer.delete({ where: { id } });
      await this.record(tx, actor.id, 'CATALOG.ITEM_DELETED', kind === 'edition' ? 'EDITION' : 'OFFER', id, {});
    });
  }

  async detail(id: string, access?: string) {
    if (access !== undefined) await this.staff(this.db, access);
    const edition = await this.db.edition.findFirst({ where: { id, ...(access === undefined ? { active: true } : {}) }, include: editionInclude });
    if (!edition) throw missing();
    return editionView(edition, access === undefined ? edition.offers.filter(offer => offer.active) : edition.offers);
  }
  async list(query: CatalogQuery, access?: string): Promise<CatalogPage> {
    const administrative = access !== undefined;
    if (!administrative && query.active !== undefined) throw new CatalogError(422, 'INVALID_INPUT', 'O filtro de inativos é administrativo.');
    return serializable(this.db, async tx => {
      if (administrative) await this.staff(tx, access);
      const offer: Prisma.OfferWhereInput = { ...(administrative ? {} : { active: true }),
        ...(query.minPrice !== undefined || query.maxPrice !== undefined ? { priceCents: { ...(query.minPrice === undefined ? {} : { gte: query.minPrice }), ...(query.maxPrice === undefined ? {} : { lte: query.maxPrice }) } } : {}),
        ...(query.discCondition ? { kind: 'USED', discGrade: query.discCondition } : {}), ...(query.sleeveCondition ? { kind: 'USED', sleeveGrade: query.sleeveCondition } : {}) };
      const hasOfferFilter = query.minPrice !== undefined || query.maxPrice !== undefined || query.discCondition !== undefined || query.sleeveCondition !== undefined;
      const and: Prisma.EditionWhereInput[] = [];
      if (hasOfferFilter) and.push({ offers: { some: offer } });
      if (query.available === true) and.push({ active: true, offers: { some: { ...offer, active: true, stockOnHand: { gt: 0 } } } });
      if (query.available === false) and.push({ OR: [{ active: false }, { offers: { none: { ...offer, active: true, stockOnHand: { gt: 0 } } } }] });
      const where: Prisma.EditionWhereInput = { ...(administrative ? query.active === undefined ? {} : { active: query.active } : { active: true }), AND: and,
        ...(query.genre ? { genres: { some: { genreId: query.genre } } } : {}),
        ...(query.decade === undefined ? {} : { editionYear: { gte: query.decade, lte: query.decade + 9 } }),
        ...(query.artist ? { OR: [{ artists: { some: { artistId: query.artist } } }, { tracks: { some: { artists: { some: { artistId: query.artist } } } } }] } : {}) };
      if (query.q) {
        const contains = { contains: literalLike(query.q), mode: 'insensitive' as const };
        and.push({ OR: [{ title: contains }, { artists: { some: { artist: { name: contains } } } },
          { tracks: { some: { OR: [{ title: contains }, { artists: { some: { artist: { name: contains } } } }] } } }] });
      }
      const total = await tx.edition.count({ where });
      const rows = await tx.edition.findMany({ where, include: editionInclude, orderBy: [{ title: 'asc' }, { id: 'asc' }], skip: (query.page - 1) * query.pageSize, take: query.pageSize });
      const items = rows.map(edition => editionView(edition, edition.offers.filter(item =>
        (administrative || item.active) && (query.minPrice === undefined || item.priceCents >= query.minPrice) && (query.maxPrice === undefined || item.priceCents <= query.maxPrice)
        && (!query.discCondition || item.kind === 'USED' && item.discGrade === query.discCondition) && (!query.sleeveCondition || item.kind === 'USED' && item.sleeveGrade === query.sleeveCondition)
        && (query.available === undefined || (edition.active && item.active && item.stockOnHand > 0) === query.available))));
      return { items, page: query.page, pageSize: query.pageSize, total, totalPages: Math.ceil(total / query.pageSize) };
    });
  }
  async filters(): Promise<CatalogFilters> {
    const [artists, genres, editions, grades] = await Promise.all([
      this.db.artist.findMany({ where: { OR: [{ editions: { some: { edition: { active: true } } } }, { tracks: { some: { track: { edition: { active: true } } } } }] }, orderBy: [{ name: 'asc' }, { id: 'asc' }] }),
      this.db.genre.findMany({ where: { editions: { some: { edition: { active: true } } } }, orderBy: [{ name: 'asc' }, { id: 'asc' }] }),
      this.db.edition.findMany({ where: { active: true }, select: { editionYear: true, format: true } }), this.db.conditionGrade.findMany({ orderBy: { rank: 'asc' } })
    ]);
    return { artists, genres, formats: [...new Set(editions.map(edition => edition.format))].sort(),
      decades: [...new Set(editions.flatMap(edition => edition.editionYear === null ? [] : [Math.floor(edition.editionYear / 10) * 10]))].sort((a, b) => b - a),
      conditions: grades as CatalogFilters['conditions'] };
  }
}
