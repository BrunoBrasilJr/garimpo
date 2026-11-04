BEGIN;
CREATE TYPE "ReturnState" AS ENUM (
  'REQUESTED', 'AWAITING_POSTING', 'IN_TRANSIT', 'AWAITING_REFUND', 'REJECTED',
  'REJECTED_AWAITING_SHIPMENT', 'REJECTED_IN_TRANSIT', 'REJECTED_DELIVERED', 'COMPLETED', 'EXPIRED'
);
CREATE TABLE "ReturnRequest" (
  id UUID PRIMARY KEY,
  "orderId" UUID NOT NULL REFERENCES "Order"(id) ON DELETE RESTRICT,
  state "ReturnState" NOT NULL DEFAULT 'REQUESTED',
  reason VARCHAR(500) NOT NULL CHECK (length(btrim(reason)) > 0),
  version INTEGER NOT NULL DEFAULT 1 CHECK (version > 0),
  "createdAt" TIMESTAMPTZ(3) NOT NULL,
  "approvedAt" TIMESTAMPTZ(3),
  "postingDueAt" TIMESTAMPTZ(3),
  "inspectedAt" TIMESTAMPTZ(3),
  "refundAuthorizedAt" TIMESTAMPTZ(3),
  "refundId" UUID UNIQUE REFERENCES "Refund"(id) ON DELETE RESTRICT
);
CREATE INDEX "ReturnRequest_orderId_createdAt_idx" ON "ReturnRequest"("orderId", "createdAt");
CREATE INDEX "ReturnRequest_state_postingDueAt_idx" ON "ReturnRequest"(state, "postingDueAt");
CREATE TABLE "ReturnItem" (
  "returnId" UUID NOT NULL REFERENCES "ReturnRequest"(id) ON DELETE RESTRICT,
  "orderUnitId" UUID NOT NULL REFERENCES "OrderUnit"(id) ON DELETE RESTRICT,
  active BOOLEAN NOT NULL DEFAULT true,
  inspection VARCHAR(24) CHECK (inspection IN ('FIT', 'UNFIT', 'REJECTED')),
  PRIMARY KEY ("returnId", "orderUnitId")
);
CREATE INDEX "ReturnItem_orderUnitId_idx" ON "ReturnItem"("orderUnitId");
CREATE UNIQUE INDEX return_one_active_case_per_unit ON "ReturnItem"("orderUnitId") WHERE active;

ALTER TABLE "Shipment" ADD COLUMN "returnId" UUID REFERENCES "ReturnRequest"(id) ON DELETE RESTRICT;
ALTER TABLE "Shipment" DROP CONSTRAINT "Shipment_kind_check";
ALTER TABLE "Shipment" ADD CONSTRAINT "Shipment_kind_check"
  CHECK ((kind = 'ORIGINAL' AND "returnId" IS NULL) OR (kind IN ('RETURN', 'RETURN_REJECTED') AND "returnId" IS NOT NULL));
CREATE UNIQUE INDEX "Shipment_returnId_kind_key" ON "Shipment"("returnId", kind);
CREATE FUNCTION protect_return_shipment_link() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF NEW."returnId" IS DISTINCT FROM OLD."returnId" THEN RAISE EXCEPTION 'shipment return link is immutable'; END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER protect_return_shipment_link BEFORE UPDATE ON "Shipment" FOR EACH ROW EXECUTE FUNCTION protect_return_shipment_link();

CREATE TABLE "Evidence" (
  id UUID PRIMARY KEY,
  "returnId" UUID NOT NULL REFERENCES "ReturnRequest"(id) ON DELETE RESTRICT,
  "actorId" UUID NOT NULL REFERENCES "User"(id) ON DELETE RESTRICT,
  source VARCHAR(12) NOT NULL CHECK (source IN ('CUSTOMER', 'STAFF')),
  position INTEGER NOT NULL CHECK (position BETWEEN 1 AND 5),
  "mediaType" VARCHAR(30) NOT NULL CHECK ("mediaType" IN ('image/jpeg', 'image/png', 'image/webp')),
  content BYTEA NOT NULL CHECK (octet_length(content) BETWEEN 1 AND 5000000),
  "createdAt" TIMESTAMPTZ(3) NOT NULL,
  UNIQUE ("returnId", source, position)
);
CREATE TRIGGER evidence_append_only BEFORE UPDATE OR DELETE OR TRUNCATE ON "Evidence" FOR EACH STATEMENT EXECUTE FUNCTION deny_order_history_mutation();

CREATE TABLE "ExternalInteraction" (
  id UUID PRIMARY KEY,
  "returnId" UUID NOT NULL REFERENCES "ReturnRequest"(id) ON DELETE RESTRICT,
  "actorId" UUID NOT NULL REFERENCES "User"(id) ON DELETE RESTRICT,
  channel VARCHAR(30) NOT NULL,
  reference VARCHAR(500) NOT NULL,
  "occurredAt" TIMESTAMPTZ(3) NOT NULL,
  "createdAt" TIMESTAMPTZ(3) NOT NULL
);
CREATE INDEX "ExternalInteraction_returnId_idx" ON "ExternalInteraction"("returnId");
CREATE TRIGGER external_interaction_append_only BEFORE UPDATE OR DELETE OR TRUNCATE ON "ExternalInteraction" FOR EACH STATEMENT EXECUTE FUNCTION deny_order_history_mutation();
COMMIT;
