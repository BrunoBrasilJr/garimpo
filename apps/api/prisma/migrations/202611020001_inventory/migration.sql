-- TASK-009: append-only application ledger; original account rows are untouched.
BEGIN;
CREATE TABLE "StockMovement" (
  id UUID PRIMARY KEY,
  "offerId" UUID NOT NULL REFERENCES "Offer"(id) ON DELETE RESTRICT,
  "deltaOnHand" INTEGER NOT NULL,
  "offerVersion" INTEGER NOT NULL CHECK ("offerVersion" > 0),
  "balanceBefore" INTEGER NOT NULL CHECK ("balanceBefore" >= 0),
  "balanceAfter" INTEGER NOT NULL CHECK ("balanceAfter" >= 0),
  reason VARCHAR(500) NOT NULL CHECK (length(btrim(reason)) > 0),
  "originKey" VARCHAR(200) NOT NULL UNIQUE,
  "actorId" UUID REFERENCES "User"(id) ON DELETE RESTRICT,
  "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CHECK ("deltaOnHand" <> 0),
  CHECK ("balanceAfter" - "balanceBefore" = "deltaOnHand"),
  UNIQUE ("offerId", "offerVersion")
);
CREATE INDEX "StockMovement_offerId_createdAt_id_idx" ON "StockMovement"("offerId", "createdAt", id);
CREATE INDEX "StockMovement_actorId_idx" ON "StockMovement"("actorId");
-- Existing positive balances acquire a single explicit opening entry, never an invented sale.
INSERT INTO "StockMovement" (id, "offerId", "offerVersion", "deltaOnHand", "balanceBefore", "balanceAfter", reason, "originKey", "createdAt")
  SELECT gen_random_uuid(), id, version, "stockOnHand", 0, "stockOnHand", 'Saldo inicial consolidado', 'OPENING:' || id::text, "createdAt"
  FROM "Offer" WHERE "stockOnHand" > 0;
COMMIT;
