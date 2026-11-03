ALTER TABLE "PaymentCharge" ADD COLUMN "productCents" BIGINT NOT NULL DEFAULT 0,
  ADD COLUMN "shippingCents" INTEGER NOT NULL DEFAULT 0, ADD COLUMN "supersedesId" UUID UNIQUE REFERENCES "PaymentCharge"(id) ON DELETE RESTRICT;
UPDATE "PaymentCharge" c SET "productCents" = o."totalCents" - o."shippingCents", "shippingCents" = o."shippingCents" FROM "Order" o WHERE o.id=c."orderId";
ALTER TABLE "PaymentCharge" ADD CONSTRAINT charge_allocation CHECK ("productCents" >= 0 AND "shippingCents" >= 0 AND "productCents" + "shippingCents" = "amountCents");
CREATE TYPE "PaymentResult" AS ENUM ('PENDING','APPROVED','DECLINED');
CREATE TYPE "RefundStatus" AS ENUM ('PENDING','FAILED','SUCCEEDED');
CREATE TABLE "PaymentAttempt" (
  id UUID PRIMARY KEY, "userId" UUID NOT NULL REFERENCES "User"(id) ON DELETE RESTRICT,
  "checkoutId" UUID NOT NULL REFERENCES "Checkout"(id) ON DELETE RESTRICT,
  "orderId" UUID REFERENCES "Order"(id) ON DELETE RESTRICT, "chargeId" UUID REFERENCES "PaymentCharge"(id) ON DELETE RESTRICT,
  method "PaymentMethod" NOT NULL, scenario VARCHAR(30) NOT NULL, result "PaymentResult" NOT NULL DEFAULT 'PENDING',
  "amountCents" BIGINT NOT NULL CHECK ("amountCents" BETWEEN 1 AND 9007199254740991),
  "productCents" BIGINT NOT NULL CHECK ("productCents" >= 0), "shippingCents" INTEGER NOT NULL CHECK ("shippingCents" >= 0),
  context JSONB NOT NULL, "eventKey" VARCHAR(200) NOT NULL UNIQUE, "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "receivedAt" TIMESTAMPTZ(3), "appliedAt" TIMESTAMPTZ(3), outcome VARCHAR(40),
  CHECK ("productCents" + "shippingCents" = "amountCents"),
  CHECK ((method='CARD' AND "chargeId" IS NULL) OR (method IN ('PIX','BOLETO') AND "chargeId" IS NOT NULL AND "orderId" IS NOT NULL)),
  CHECK ((result='PENDING' AND "receivedAt" IS NULL AND "appliedAt" IS NULL AND outcome IS NULL) OR (result<>'PENDING' AND "receivedAt" IS NOT NULL)),
  CHECK (("appliedAt" IS NULL AND outcome IS NULL) OR ("appliedAt" IS NOT NULL AND outcome IS NOT NULL))
);
CREATE INDEX "PaymentAttempt_userId_createdAt_id_idx" ON "PaymentAttempt"("userId","createdAt",id);
CREATE INDEX "PaymentAttempt_chargeId_idx" ON "PaymentAttempt"("chargeId");
CREATE INDEX "PaymentAttempt_checkoutId_idx" ON "PaymentAttempt"("checkoutId");
CREATE INDEX "PaymentAttempt_result_appliedAt_idx" ON "PaymentAttempt"(result,"appliedAt");
CREATE UNIQUE INDEX payment_one_unfinished_card ON "PaymentAttempt"("checkoutId") WHERE method='CARD' AND "appliedAt" IS NULL;
CREATE UNIQUE INDEX payment_one_unfinished_charge ON "PaymentAttempt"("chargeId") WHERE "chargeId" IS NOT NULL AND "appliedAt" IS NULL;
CREATE TABLE "Refund" (
 id UUID PRIMARY KEY, "paymentAttemptId" UUID NOT NULL REFERENCES "PaymentAttempt"(id) ON DELETE RESTRICT,
 "orderId" UUID REFERENCES "Order"(id) ON DELETE RESTRICT, origin VARCHAR(40) NOT NULL, "originKey" VARCHAR(200) NOT NULL UNIQUE,
 status "RefundStatus" NOT NULL DEFAULT 'PENDING', "productCents" BIGINT NOT NULL CHECK ("productCents">=0), "shippingCents" INTEGER NOT NULL CHECK ("shippingCents">=0),
 "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "completedAt" TIMESTAMPTZ(3),
 CHECK ("productCents"+"shippingCents">0), CHECK ((status='SUCCEEDED')=("completedAt" IS NOT NULL))
);
CREATE INDEX "Refund_paymentAttemptId_idx" ON "Refund"("paymentAttemptId");
CREATE INDEX "Refund_orderId_idx" ON "Refund"("orderId");
CREATE INDEX "Refund_status_createdAt_id_idx" ON "Refund"(status,"createdAt",id);
CREATE TABLE "RefundAttempt" (
 id UUID PRIMARY KEY, "refundId" UUID NOT NULL REFERENCES "Refund"(id) ON DELETE RESTRICT,
 "attemptKey" VARCHAR(200) NOT NULL UNIQUE, "actorId" UUID REFERENCES "User"(id) ON DELETE RESTRICT,
 scenario VARCHAR(30) NOT NULL, result "RefundStatus" NOT NULL DEFAULT 'PENDING',
 "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "receivedAt" TIMESTAMPTZ(3), "appliedAt" TIMESTAMPTZ(3),
 CHECK ((result='PENDING' AND "receivedAt" IS NULL AND "appliedAt" IS NULL) OR (result<>'PENDING' AND "receivedAt" IS NOT NULL))
);
CREATE INDEX "RefundAttempt_refundId_idx" ON "RefundAttempt"("refundId");
CREATE UNIQUE INDEX refund_one_unapplied_attempt ON "RefundAttempt"("refundId") WHERE "appliedAt" IS NULL;
CREATE TABLE "FinancialEvent" (
 id UUID PRIMARY KEY, "orderId" UUID REFERENCES "Order"(id) ON DELETE RESTRICT,
 "paymentAttemptId" UUID NOT NULL REFERENCES "PaymentAttempt"(id) ON DELETE RESTRICT, "refundId" UUID REFERENCES "Refund"(id) ON DELETE RESTRICT,
 type VARCHAR(40) NOT NULL CHECK (type IN ('SALE','REFUND','LATE_REFUND')),
 "productCents" BIGINT NOT NULL CHECK ("productCents">=0), "shippingCents" INTEGER NOT NULL CHECK ("shippingCents">=0),
 "occurredAt" TIMESTAMPTZ(3) NOT NULL, "eventKey" VARCHAR(200) NOT NULL UNIQUE,
 CHECK ("productCents"+"shippingCents">0),
 CHECK ((type='SALE' AND "orderId" IS NOT NULL AND "refundId" IS NULL) OR (type<>'SALE' AND "refundId" IS NOT NULL))
);
CREATE INDEX "FinancialEvent_orderId_idx" ON "FinancialEvent"("orderId");
CREATE INDEX "FinancialEvent_paymentAttemptId_idx" ON "FinancialEvent"("paymentAttemptId");
CREATE INDEX "FinancialEvent_refundId_idx" ON "FinancialEvent"("refundId");
CREATE INDEX "FinancialEvent_occurredAt_type_idx" ON "FinancialEvent"("occurredAt",type);
CREATE UNIQUE INDEX financial_one_sale ON "FinancialEvent"("orderId") WHERE type='SALE';
CREATE FUNCTION immutable_financial_event() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'financial events are append only'; END $$;
CREATE TRIGGER immutable_financial_event BEFORE UPDATE OR DELETE ON "FinancialEvent" FOR EACH ROW EXECUTE FUNCTION immutable_financial_event();
CREATE FUNCTION protect_charge_history() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN
 IF TG_OP='DELETE' THEN RAISE EXCEPTION 'charge history is immutable'; END IF;
 IF ROW(NEW.id,NEW."orderId",NEW.method,NEW."amountCents",NEW."productCents",NEW."shippingCents",NEW."supersedesId",NEW."createdAt",NEW."expiresAt")
 IS DISTINCT FROM ROW(OLD.id,OLD."orderId",OLD.method,OLD."amountCents",OLD."productCents",OLD."shippingCents",OLD."supersedesId",OLD."createdAt",OLD."expiresAt") THEN RAISE EXCEPTION 'charge amounts and deadline are immutable'; END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER protect_charge_history BEFORE UPDATE OR DELETE ON "PaymentCharge" FOR EACH ROW EXECUTE FUNCTION protect_charge_history();
CREATE FUNCTION protect_payment_receipt() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN
 IF TG_OP='DELETE' THEN RAISE EXCEPTION 'payment history is immutable'; END IF;
 IF ROW(NEW.id,NEW."userId",NEW."checkoutId",NEW."chargeId",NEW.method,NEW.scenario,NEW."amountCents",NEW."productCents",NEW."shippingCents",NEW.context,NEW."eventKey",NEW."createdAt") IS DISTINCT FROM ROW(OLD.id,OLD."userId",OLD."checkoutId",OLD."chargeId",OLD.method,OLD.scenario,OLD."amountCents",OLD."productCents",OLD."shippingCents",OLD.context,OLD."eventKey",OLD."createdAt")
 OR (OLD.result<>'PENDING' AND ROW(NEW.result,NEW."receivedAt") IS DISTINCT FROM ROW(OLD.result,OLD."receivedAt"))
 OR (OLD."appliedAt" IS NOT NULL AND NEW IS DISTINCT FROM OLD) THEN RAISE EXCEPTION 'payment intent and terminal receipt are immutable'; END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER protect_payment_receipt BEFORE UPDATE OR DELETE ON "PaymentAttempt" FOR EACH ROW EXECUTE FUNCTION protect_payment_receipt();
