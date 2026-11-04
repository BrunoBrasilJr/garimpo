BEGIN;
CREATE TYPE "ExchangeState" AS ENUM (
  'REQUESTED','AWAITING_POSTING','IN_TRANSIT','WAITING_SUBSTITUTE','SHIPPED','DELIVERED',
  'REJECTED','REJECTED_AWAITING_SHIPMENT','REJECTED_IN_TRANSIT','REJECTED_DELIVERED','CANCELLED','EXPIRED','CONVERTED'
);
CREATE TYPE "SubstituteState" AS ENUM ('OFFERED','ACCEPTED','REJECTED','EXPIRED','RELEASED','SHIPPED');
CREATE TABLE "ExchangeRequest" (
  id UUID PRIMARY KEY,
  "orderId" UUID NOT NULL REFERENCES "Order"(id) ON DELETE RESTRICT,
  state "ExchangeState" NOT NULL DEFAULT 'REQUESTED',
  reason VARCHAR(500) NOT NULL CHECK (length(btrim(reason)) > 0),
  version INTEGER NOT NULL DEFAULT 1 CHECK (version > 0),
  "createdAt" TIMESTAMPTZ(3) NOT NULL,
  "approvedAt" TIMESTAMPTZ(3),
  "postingDueAt" TIMESTAMPTZ(3),
  "inspectedAt" TIMESTAMPTZ(3),
  "waitingDueAt" TIMESTAMPTZ(3),
  "convertedReturnId" UUID UNIQUE REFERENCES "ReturnRequest"(id) ON DELETE RESTRICT
);
CREATE INDEX "ExchangeRequest_orderId_createdAt_idx" ON "ExchangeRequest"("orderId","createdAt");
CREATE INDEX "ExchangeRequest_state_postingDueAt_idx" ON "ExchangeRequest"(state,"postingDueAt");
CREATE INDEX "ExchangeRequest_state_waitingDueAt_idx" ON "ExchangeRequest"(state,"waitingDueAt");
CREATE TABLE "ExchangeItem" (
  "exchangeId" UUID NOT NULL REFERENCES "ExchangeRequest"(id) ON DELETE RESTRICT,
  "orderUnitId" UUID NOT NULL REFERENCES "OrderUnit"(id) ON DELETE RESTRICT,
  "originalOfferId" UUID NOT NULL REFERENCES "Offer"(id) ON DELETE RESTRICT,
  active BOOLEAN NOT NULL DEFAULT true,
  inspection VARCHAR(24) CHECK (inspection IN ('FIT','UNFIT','REJECTED')),
  PRIMARY KEY ("exchangeId","orderUnitId")
);
CREATE INDEX "ExchangeItem_orderUnitId_idx" ON "ExchangeItem"("orderUnitId");
CREATE UNIQUE INDEX exchange_one_active_case_per_unit ON "ExchangeItem"("orderUnitId") WHERE active;
CREATE FUNCTION prevent_overlapping_aftersales() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF NOT NEW.active THEN RETURN NEW; END IF;
  UPDATE "OrderUnit" SET "commercialState"="commercialState" WHERE id=NEW."orderUnitId";
  IF TG_TABLE_NAME='ExchangeItem' AND EXISTS (SELECT 1 FROM "ReturnItem" WHERE "orderUnitId"=NEW."orderUnitId" AND active) OR
     TG_TABLE_NAME='ReturnItem' AND EXISTS (SELECT 1 FROM "ExchangeItem" WHERE "orderUnitId"=NEW."orderUnitId" AND active) THEN
    RAISE EXCEPTION 'order unit already belongs to an active after-sales case' USING ERRCODE='23514';
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER exchange_claim_guard BEFORE INSERT OR UPDATE OF active ON "ExchangeItem" FOR EACH ROW EXECUTE FUNCTION prevent_overlapping_aftersales();
CREATE TRIGGER return_claim_guard BEFORE INSERT OR UPDATE OF active ON "ReturnItem" FOR EACH ROW EXECUTE FUNCTION prevent_overlapping_aftersales();

CREATE TABLE "SubstituteOffer" (
  id UUID PRIMARY KEY,
  "exchangeId" UUID NOT NULL,
  "orderUnitId" UUID NOT NULL,
  "offerId" UUID NOT NULL REFERENCES "Offer"(id) ON DELETE RESTRICT,
  "equivalenceReason" VARCHAR(500) NOT NULL,
  state "SubstituteState" NOT NULL DEFAULT 'OFFERED',
  "createdAt" TIMESTAMPTZ(3) NOT NULL,
  "expiresAt" TIMESTAMPTZ(3) NOT NULL CHECK ("expiresAt" = "createdAt" + INTERVAL '48 hours'),
  "respondedAt" TIMESTAMPTZ(3),
  FOREIGN KEY ("exchangeId","orderUnitId") REFERENCES "ExchangeItem"("exchangeId","orderUnitId") ON DELETE RESTRICT
);
CREATE INDEX "SubstituteOffer_exchangeId_orderUnitId_idx" ON "SubstituteOffer"("exchangeId","orderUnitId");
CREATE INDEX "SubstituteOffer_state_expiresAt_idx" ON "SubstituteOffer"(state,"expiresAt");
CREATE UNIQUE INDEX one_live_substitute_per_unit ON "SubstituteOffer"("exchangeId","orderUnitId") WHERE state IN ('OFFERED','ACCEPTED');

ALTER TABLE "Reservation" ALTER COLUMN "checkoutItemId" DROP NOT NULL;
ALTER TABLE "Reservation" ADD COLUMN "substituteId" UUID UNIQUE REFERENCES "SubstituteOffer"(id) ON DELETE RESTRICT;
ALTER TABLE "Reservation" ADD CONSTRAINT reservation_source CHECK (
  ("checkoutItemId" IS NOT NULL AND "substituteId" IS NULL)
  OR ("substituteId" IS NOT NULL AND "checkoutItemId" IS NULL AND "orderItemId" IS NULL AND quantity=1)
);
ALTER TABLE "Shipment" ADD COLUMN "exchangeId" UUID REFERENCES "ExchangeRequest"(id) ON DELETE RESTRICT;
ALTER TABLE "Shipment" DROP CONSTRAINT "Shipment_kind_check";
ALTER TABLE "Shipment" ADD CONSTRAINT "Shipment_kind_check" CHECK (
  (kind='ORIGINAL' AND "returnId" IS NULL AND "exchangeId" IS NULL)
  OR (kind IN ('RETURN','RETURN_REJECTED') AND "returnId" IS NOT NULL AND "exchangeId" IS NULL)
  OR (kind IN ('EXCHANGE_RETURN','EXCHANGE_REPLACEMENT','EXCHANGE_REJECTED') AND "exchangeId" IS NOT NULL AND "returnId" IS NULL)
);
CREATE UNIQUE INDEX "Shipment_exchangeId_kind_key" ON "Shipment"("exchangeId",kind);
CREATE FUNCTION protect_exchange_shipment_link() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF NEW."exchangeId" IS DISTINCT FROM OLD."exchangeId" THEN RAISE EXCEPTION 'shipment exchange link is immutable'; END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER protect_exchange_shipment_link BEFORE UPDATE ON "Shipment" FOR EACH ROW EXECUTE FUNCTION protect_exchange_shipment_link();

ALTER TABLE "Evidence" ALTER COLUMN "returnId" DROP NOT NULL;
ALTER TABLE "Evidence" ADD COLUMN "exchangeId" UUID REFERENCES "ExchangeRequest"(id) ON DELETE RESTRICT;
ALTER TABLE "Evidence" ADD CONSTRAINT evidence_one_case CHECK (num_nonnulls("returnId","exchangeId")=1);
CREATE UNIQUE INDEX "Evidence_exchangeId_source_position_key" ON "Evidence"("exchangeId",source,position);
ALTER TABLE "ExternalInteraction" ALTER COLUMN "returnId" DROP NOT NULL;
ALTER TABLE "ExternalInteraction" ADD COLUMN "exchangeId" UUID REFERENCES "ExchangeRequest"(id) ON DELETE RESTRICT;
ALTER TABLE "ExternalInteraction" ADD CONSTRAINT interaction_one_case CHECK (num_nonnulls("returnId","exchangeId")=1);
CREATE INDEX "ExternalInteraction_exchangeId_idx" ON "ExternalInteraction"("exchangeId");
COMMIT;
