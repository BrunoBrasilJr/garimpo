CREATE TYPE "AvailabilityKind" AS ENUM ('NEW', 'USED', 'ANY');
CREATE TYPE "AvailabilityStatus" AS ENUM ('ACTIVE', 'DELIVERED', 'CANCELLED');
CREATE TABLE "WishlistEntry" (
  id UUID PRIMARY KEY, "userId" UUID NOT NULL REFERENCES "User"(id) ON DELETE RESTRICT,
  "editionId" UUID NOT NULL REFERENCES "Edition"(id) ON DELETE RESTRICT,
  "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX "WishlistEntry_userId_editionId_key" ON "WishlistEntry"("userId", "editionId");
CREATE INDEX "WishlistEntry_editionId_idx" ON "WishlistEntry"("editionId");
CREATE INDEX "WishlistEntry_userId_createdAt_id_idx" ON "WishlistEntry"("userId", "createdAt", id);
CREATE TABLE "AvailabilityAlert" (
  id UUID PRIMARY KEY, "userId" UUID NOT NULL REFERENCES "User"(id) ON DELETE RESTRICT,
  "editionId" UUID NOT NULL REFERENCES "Edition"(id) ON DELETE RESTRICT,
  kind "AvailabilityKind" NOT NULL, status "AvailabilityStatus" NOT NULL DEFAULT 'ACTIVE',
  "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "closedAt" TIMESTAMPTZ(3),
  "triggerEventId" UUID REFERENCES "DomainEvent"(id) ON DELETE RESTRICT,
  CONSTRAINT "AvailabilityAlert_closed_state" CHECK ((status = 'ACTIVE') = ("closedAt" IS NULL))
);
CREATE UNIQUE INDEX "AvailabilityAlert_active_unique" ON "AvailabilityAlert"("userId", "editionId", kind) WHERE status = 'ACTIVE';
CREATE INDEX "AvailabilityAlert_userId_createdAt_id_idx" ON "AvailabilityAlert"("userId", "createdAt", id);
CREATE INDEX "AvailabilityAlert_editionId_status_kind_createdAt_idx" ON "AvailabilityAlert"("editionId", status, kind, "createdAt");
CREATE INDEX "AvailabilityAlert_triggerEventId_idx" ON "AvailabilityAlert"("triggerEventId");
ALTER TABLE "DemoMessage" ADD COLUMN "availabilityAlertId" UUID REFERENCES "AvailabilityAlert"(id) ON DELETE RESTRICT;
CREATE UNIQUE INDEX "DemoMessage_availabilityAlertId_key" ON "DemoMessage"("availabilityAlertId");
