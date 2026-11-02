CREATE TYPE "ReviewVisibility" AS ENUM ('PUBLIC', 'HIDDEN');
CREATE TABLE "Review" (
  id UUID PRIMARY KEY, "userId" UUID NOT NULL REFERENCES "User"(id) ON DELETE RESTRICT,
  "editionId" UUID NOT NULL REFERENCES "Edition"(id) ON DELETE RESTRICT, "orderId" UUID NOT NULL,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5), comment VARCHAR(4000) NOT NULL CHECK (length(btrim(comment)) > 0),
  visibility "ReviewVisibility" NOT NULL DEFAULT 'PUBLIC', "awaitingModeration" BOOLEAN NOT NULL DEFAULT false,
  "hiddenReason" VARCHAR(500), version INTEGER NOT NULL DEFAULT 1 CHECK (version > 0),
  "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMPTZ(3) NOT NULL,
  CONSTRAINT "Review_moderation_state" CHECK ((visibility = 'HIDDEN' OR NOT "awaitingModeration") AND (visibility != 'HIDDEN' OR "hiddenReason" IS NOT NULL))
);
CREATE UNIQUE INDEX "Review_userId_editionId_orderId_key" ON "Review"("userId", "editionId", "orderId");
CREATE INDEX "Review_editionId_visibility_createdAt_id_idx" ON "Review"("editionId", visibility, "createdAt", id);
CREATE INDEX "Review_userId_createdAt_id_idx" ON "Review"("userId", "createdAt", id);
CREATE INDEX "Review_orderId_idx" ON "Review"("orderId");
CREATE TABLE "ReviewRevision" (
  id UUID PRIMARY KEY, "reviewId" UUID NOT NULL REFERENCES "Review"(id) ON DELETE RESTRICT,
  "actorId" UUID NOT NULL REFERENCES "User"(id) ON DELETE RESTRICT, version INTEGER NOT NULL CHECK (version > 0),
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5), comment VARCHAR(4000) NOT NULL CHECK (length(btrim(comment)) > 0),
  visibility "ReviewVisibility" NOT NULL, "awaitingModeration" BOOLEAN NOT NULL,
  action VARCHAR(30) NOT NULL, reason VARCHAR(500) NOT NULL,
  "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX "ReviewRevision_reviewId_version_key" ON "ReviewRevision"("reviewId", version);
CREATE INDEX "ReviewRevision_actorId_idx" ON "ReviewRevision"("actorId");
CREATE FUNCTION reject_review_revision_mutation() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN RAISE EXCEPTION 'Review revisions are immutable' USING ERRCODE = '23514'; END $$;
CREATE TRIGGER "ReviewRevision_immutable" BEFORE UPDATE OR DELETE ON "ReviewRevision" FOR EACH ROW EXECUTE FUNCTION reject_review_revision_mutation();
