BEGIN;
CREATE TABLE "CancellationRequest" (
  id UUID PRIMARY KEY,
  "orderId" UUID NOT NULL REFERENCES "Order"(id) ON DELETE RESTRICT,
  "actorId" UUID NOT NULL REFERENCES "User"(id) ON DELETE RESTRICT,
  kind VARCHAR(20) NOT NULL CHECK (kind IN ('DIRECT', 'UNAVAILABLE')),
  reason VARCHAR(500) NOT NULL,
  "unitIds" UUID[] NOT NULL CHECK (cardinality("unitIds") > 0),
  "unavailableUnitIds" UUID[] NOT NULL,
  "orderVersion" INTEGER NOT NULL CHECK ("orderVersion" > 0),
  "orderStatus" "OrderStatus" NOT NULL,
  "refundId" UUID REFERENCES "Refund"(id) ON DELETE RESTRICT,
  "replacementChargeId" UUID REFERENCES "PaymentCharge"(id) ON DELETE RESTRICT,
  "createdAt" TIMESTAMPTZ(3) NOT NULL,
  CHECK ("unavailableUnitIds" <@ "unitIds"),
  CHECK ((kind = 'UNAVAILABLE') = (cardinality("unavailableUnitIds") > 0))
);
CREATE INDEX "CancellationRequest_orderId_createdAt_idx" ON "CancellationRequest"("orderId", "createdAt");
CREATE TRIGGER cancellation_history_append_only BEFORE UPDATE OR DELETE OR TRUNCATE ON "CancellationRequest" FOR EACH STATEMENT EXECUTE FUNCTION deny_order_history_mutation();

ALTER TABLE "RefundAttempt" ADD COLUMN reason VARCHAR(500);
CREATE FUNCTION protect_refund_retry_reason() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.reason IS DISTINCT FROM OLD.reason THEN RAISE EXCEPTION 'refund retry reason is immutable'; END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER protect_refund_retry_reason BEFORE UPDATE ON "RefundAttempt" FOR EACH ROW EXECUTE FUNCTION protect_refund_retry_reason();
COMMIT;
