-- TASK-008: catalog/media only. Existing account/foundation tables are untouched.
BEGIN;
CREATE TYPE "OfferKind" AS ENUM ('NEW', 'USED');

CREATE TABLE "Artist" (
  id UUID PRIMARY KEY, name VARCHAR(200) NOT NULL UNIQUE CHECK (length(btrim(name)) > 0)
);
CREATE TABLE "Genre" (
  id UUID PRIMARY KEY, name VARCHAR(200) NOT NULL UNIQUE CHECK (length(btrim(name)) > 0)
);
CREATE TABLE "Label" (
  id UUID PRIMARY KEY, name VARCHAR(200) NOT NULL UNIQUE CHECK (length(btrim(name)) > 0)
);
CREATE UNIQUE INDEX "Artist_name_folded_key" ON "Artist" (lower(name));
CREATE UNIQUE INDEX "Genre_name_folded_key" ON "Genre" (lower(name));
CREATE UNIQUE INDEX "Label_name_folded_key" ON "Label" (lower(name));

CREATE TABLE "Edition" (
  id UUID PRIMARY KEY, title VARCHAR(300) NOT NULL CHECK (length(btrim(title)) > 0),
  "labelId" UUID REFERENCES "Label"(id) ON DELETE RESTRICT,
  "primaryGenreId" UUID NOT NULL REFERENCES "Genre"(id) ON DELETE RESTRICT,
  "originalYear" INTEGER CHECK ("originalYear" BETWEEN 1 AND 9999),
  "editionYear" INTEGER CHECK ("editionYear" BETWEEN 1 AND 9999),
  format VARCHAR(60) NOT NULL CHECK (length(btrim(format)) > 0),
  "catalogNumber" VARCHAR(100), "weightGrams" INTEGER CHECK ("weightGrams" > 0),
  "pressingCountry" VARCHAR(100), "collectorEdition" BOOLEAN NOT NULL DEFAULT false,
  "lowStockNewThreshold" INTEGER NOT NULL DEFAULT 0 CHECK ("lowStockNewThreshold" >= 0),
  active BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ(3) NOT NULL
);
CREATE INDEX "Edition_labelId_idx" ON "Edition"("labelId");
CREATE INDEX "Edition_primaryGenreId_idx" ON "Edition"("primaryGenreId");
CREATE INDEX "Edition_active_title_id_idx" ON "Edition"(active, title, id);
CREATE INDEX "Edition_active_editionYear_idx" ON "Edition"(active, "editionYear");

CREATE TABLE "EditionArtist" (
  "editionId" UUID NOT NULL REFERENCES "Edition"(id) ON DELETE CASCADE,
  "artistId" UUID NOT NULL REFERENCES "Artist"(id) ON DELETE RESTRICT,
  PRIMARY KEY ("editionId", "artistId")
);
CREATE INDEX "EditionArtist_artistId_idx" ON "EditionArtist"("artistId");
CREATE TABLE "EditionGenre" (
  "editionId" UUID NOT NULL REFERENCES "Edition"(id) ON DELETE CASCADE,
  "genreId" UUID NOT NULL REFERENCES "Genre"(id) ON DELETE RESTRICT,
  PRIMARY KEY ("editionId", "genreId")
);
CREATE INDEX "EditionGenre_genreId_idx" ON "EditionGenre"("genreId");
-- Membership is checked at commit, allowing a transaction to replace genre links.
ALTER TABLE "Edition" ADD CONSTRAINT "Edition_principal_membership_fkey"
  FOREIGN KEY (id, "primaryGenreId") REFERENCES "EditionGenre"("editionId", "genreId")
  DEFERRABLE INITIALLY DEFERRED;

CREATE TABLE "Track" (
  id UUID PRIMARY KEY, "editionId" UUID NOT NULL REFERENCES "Edition"(id) ON DELETE CASCADE,
  position INTEGER NOT NULL CHECK (position > 0), title VARCHAR(300) NOT NULL CHECK (length(btrim(title)) > 0),
  "durationSeconds" INTEGER CHECK ("durationSeconds" >= 0), "audioUrl" VARCHAR(2048),
  UNIQUE ("editionId", position)
);
CREATE TABLE "TrackArtist" (
  "trackId" UUID NOT NULL REFERENCES "Track"(id) ON DELETE CASCADE,
  "artistId" UUID NOT NULL REFERENCES "Artist"(id) ON DELETE RESTRICT,
  PRIMARY KEY ("trackId", "artistId")
);
CREATE INDEX "TrackArtist_artistId_idx" ON "TrackArtist"("artistId");

CREATE TABLE "ConditionGrade" (
  code VARCHAR(3) PRIMARY KEY, label VARCHAR(100) NOT NULL, rank INTEGER NOT NULL UNIQUE,
  CHECK (code IN ('M', 'NM', 'VG+', 'VG', 'G+', 'G', 'F', 'P')), CHECK (rank BETWEEN 1 AND 8)
);
INSERT INTO "ConditionGrade" (code, label, rank) VALUES
  ('M', 'Mint', 1), ('NM', 'Near Mint', 2), ('VG+', 'Very Good Plus', 3), ('VG', 'Very Good', 4),
  ('G+', 'Good Plus', 5), ('G', 'Good', 6), ('F', 'Fair', 7), ('P', 'Poor', 8);

CREATE TABLE "Offer" (
  id UUID PRIMARY KEY, "editionId" UUID NOT NULL REFERENCES "Edition"(id) ON DELETE RESTRICT,
  kind "OfferKind" NOT NULL, "priceCents" INTEGER NOT NULL CHECK ("priceCents" > 0),
  "discGrade" VARCHAR(3) REFERENCES "ConditionGrade"(code) ON DELETE RESTRICT,
  "sleeveGrade" VARCHAR(3) REFERENCES "ConditionGrade"(code) ON DELETE RESTRICT,
  particulars VARCHAR(4000), "stockOnHand" INTEGER NOT NULL DEFAULT 0 CHECK ("stockOnHand" >= 0),
  active BOOLEAN NOT NULL DEFAULT false, version INTEGER NOT NULL DEFAULT 1 CHECK (version > 0),
  "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ(3) NOT NULL,
  CHECK (kind <> 'USED' OR "stockOnHand" <= 1),
  CHECK (kind <> 'NEW' OR ("discGrade" IS NULL AND "sleeveGrade" IS NULL AND particulars IS NULL)),
  CHECK (kind <> 'USED' OR NOT active OR ("discGrade" IS NOT NULL AND "sleeveGrade" IS NOT NULL AND length(btrim(particulars)) > 0 AND particulars IS NOT NULL))
);
CREATE INDEX "Offer_editionId_kind_active_idx" ON "Offer"("editionId", kind, active);
CREATE INDEX "Offer_active_priceCents_idx" ON "Offer"(active, "priceCents");
CREATE INDEX "Offer_discGrade_idx" ON "Offer"("discGrade");
CREATE INDEX "Offer_sleeveGrade_idx" ON "Offer"("sleeveGrade");

CREATE TABLE "ProductImage" (
  id UUID PRIMARY KEY,
  "editionId" UUID REFERENCES "Edition"(id) ON DELETE CASCADE,
  "offerId" UUID REFERENCES "Offer"(id) ON DELETE CASCADE,
  "storageKey" VARCHAR(100) NOT NULL UNIQUE, description VARCHAR(500) NOT NULL CHECK (length(btrim(description)) > 0),
  position INTEGER NOT NULL, "contentHash" CHAR(64) NOT NULL CHECK ("contentHash" ~ '^[0-9a-f]{64}$'),
  "mimeType" VARCHAR(20) NOT NULL CHECK ("mimeType" IN ('image/jpeg', 'image/png', 'image/webp')),
  "byteSize" INTEGER NOT NULL CHECK ("byteSize" BETWEEN 1 AND 5000000),
  width INTEGER NOT NULL CHECK (width BETWEEN 1 AND 10000), height INTEGER NOT NULL CHECK (height BETWEEN 1 AND 10000),
  "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CHECK (num_nonnulls("editionId", "offerId") = 1),
  CHECK (position BETWEEN 1 AND CASE WHEN "editionId" IS NOT NULL THEN 10 ELSE 8 END),
  CHECK (width::bigint * height::bigint <= 40000000),
  UNIQUE ("editionId", position), UNIQUE ("offerId", position)
);
COMMIT;
