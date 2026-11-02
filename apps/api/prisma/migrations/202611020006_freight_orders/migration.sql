-- No operational freight seed. Ranges and rates must be explicitly configured by ADMIN.
CREATE TABLE "FreightRate" (
  id UUID PRIMARY KEY, region VARCHAR(100) NOT NULL CHECK (length(region) > 0), served BOOLEAN NOT NULL,
  "amountCents" INTEGER, "deliveryDays" INTEGER, version INTEGER NOT NULL DEFAULT 1 CHECK (version > 0),
  "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMPTZ(3) NOT NULL,
  CHECK ((served AND "amountCents" > 0 AND "deliveryDays" BETWEEN 0 AND 3650 AND "amountCents" IS NOT NULL AND "deliveryDays" IS NOT NULL)
    OR (NOT served AND "amountCents" IS NULL AND "deliveryDays" IS NULL))
);
CREATE INDEX "FreightRate_region_id_idx" ON "FreightRate"(region,id);
CREATE TABLE "CepRange" (
  id UUID PRIMARY KEY, "freightRateId" UUID NOT NULL REFERENCES "FreightRate"(id) ON DELETE RESTRICT,
  "startZip" CHAR(8) NOT NULL CHECK ("startZip" ~ '^[0-9]{8}$'),
  "endZip" CHAR(8) NOT NULL CHECK ("endZip" ~ '^[0-9]{8}$'),
  CHECK ("startZip" <= "endZip"),
  EXCLUDE USING gist (int4range("startZip"::integer,"endZip"::integer,'[]') WITH &&)
);
CREATE INDEX "CepRange_freightRateId_idx" ON "CepRange"("freightRateId");
CREATE INDEX "CepRange_startZip_endZip_idx" ON "CepRange"("startZip","endZip");
CREATE TYPE "PaymentMethod" AS ENUM ('PIX','BOLETO','CARD');
CREATE TYPE "OrderStatus" AS ENUM ('PENDING','PAID','PREPARING','SEPARATED','SHIPPED','DELIVERED','CANCELLED');
CREATE TYPE "ChargeStatus" AS ENUM ('ACTIVE','PAID','EXPIRED','CANCELLED','SUPERSEDED');
CREATE TYPE "OrderUnitState" AS ENUM ('KEPT','CANCELLED','RETURNED');
CREATE TABLE "Order" (
  id UUID PRIMARY KEY, "userId" UUID NOT NULL REFERENCES "User"(id) ON DELETE RESTRICT,
  "checkoutId" UUID NOT NULL UNIQUE REFERENCES "Checkout"(id) ON DELETE RESTRICT,
  status "OrderStatus" NOT NULL DEFAULT 'PENDING', method "PaymentMethod" NOT NULL, version INTEGER NOT NULL DEFAULT 1 CHECK (version > 0),
  snapshot JSONB NOT NULL, "addressSnapshot" JSONB NOT NULL, "freightSnapshot" JSONB NOT NULL,
  "subtotalCents" BIGINT NOT NULL CHECK ("subtotalCents" >= 0), "discountCents" BIGINT NOT NULL CHECK ("discountCents" >= 0 AND "discountCents" <= "subtotalCents"),
  "shippingCents" INTEGER NOT NULL CHECK ("shippingCents" > 0), "totalCents" BIGINT NOT NULL CHECK ("totalCents" = "subtotalCents" - "discountCents" + "shippingCents" AND "totalCents" <= 9007199254740991),
  "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "expiresAt" TIMESTAMPTZ(3), "paidAt" TIMESTAMPTZ(3),
  CHECK ((method = 'PIX' AND "expiresAt" IS NOT NULL AND "expiresAt" = "createdAt" + INTERVAL '30 minutes')
    OR (method = 'BOLETO' AND "expiresAt" IS NOT NULL AND "expiresAt" = "createdAt" + INTERVAL '48 hours')
    OR (method = 'CARD' AND "expiresAt" IS NULL AND status <> 'PENDING'))
);
CREATE INDEX "Order_userId_status_expiresAt_idx" ON "Order"("userId",status,"expiresAt");
CREATE INDEX "Order_status_expiresAt_id_idx" ON "Order"(status,"expiresAt",id);
CREATE TABLE "OrderItem" (
  id UUID PRIMARY KEY, "orderId" UUID NOT NULL REFERENCES "Order"(id) ON DELETE RESTRICT,
  "offerId" UUID NOT NULL REFERENCES "Offer"(id) ON DELETE RESTRICT,
  "editionId" UUID NOT NULL REFERENCES "Edition"(id) ON DELETE RESTRICT,
  quantity INTEGER NOT NULL CHECK (quantity BETWEEN 1 AND 1000), "productSnapshot" JSONB NOT NULL,
  UNIQUE("orderId","offerId")
);
CREATE INDEX "OrderItem_offerId_idx" ON "OrderItem"("offerId");
CREATE INDEX "OrderItem_editionId_idx" ON "OrderItem"("editionId");
CREATE TABLE "OrderUnit" (
  id UUID PRIMARY KEY, "orderItemId" UUID NOT NULL REFERENCES "OrderItem"(id) ON DELETE RESTRICT,
  "logicalIndex" INTEGER NOT NULL CHECK ("logicalIndex" BETWEEN 0 AND 999), "netPaidCents" INTEGER NOT NULL CHECK ("netPaidCents" >= 0),
  "priceSnapshot" JSONB NOT NULL, "commercialState" "OrderUnitState" NOT NULL DEFAULT 'KEPT',
  "currentOfferId" UUID NOT NULL REFERENCES "Offer"(id) ON DELETE RESTRICT, "deliveredAt" TIMESTAMPTZ(3),
  UNIQUE("orderItemId","logicalIndex")
);
CREATE INDEX "OrderUnit_currentOfferId_idx" ON "OrderUnit"("currentOfferId");
CREATE TABLE "PaymentCharge" (
  id UUID PRIMARY KEY, "orderId" UUID NOT NULL REFERENCES "Order"(id) ON DELETE RESTRICT,
  method "PaymentMethod" NOT NULL CHECK (method IN ('PIX','BOLETO')), "amountCents" BIGINT NOT NULL CHECK ("amountCents" BETWEEN 1 AND 9007199254740991),
  status "ChargeStatus" NOT NULL DEFAULT 'ACTIVE', "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "expiresAt" TIMESTAMPTZ(3) NOT NULL CHECK ("expiresAt" > "createdAt")
);
CREATE INDEX "PaymentCharge_orderId_idx" ON "PaymentCharge"("orderId");
CREATE INDEX "PaymentCharge_status_expiresAt_idx" ON "PaymentCharge"(status,"expiresAt");
CREATE UNIQUE INDEX "PaymentCharge_one_active_order" ON "PaymentCharge"("orderId") WHERE status = 'ACTIVE';
ALTER TABLE "Checkout" ADD COLUMN "freightSnapshot" JSONB, ADD COLUMN "freightRevision" CHAR(64);
ALTER TABLE "Reservation" ADD COLUMN "orderItemId" UUID UNIQUE REFERENCES "OrderItem"(id) ON DELETE RESTRICT;
ALTER TABLE "CouponUsage" ADD COLUMN "orderId" UUID UNIQUE REFERENCES "Order"(id) ON DELETE RESTRICT;
CREATE FUNCTION protect_order_snapshot() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN
  IF TG_OP = 'DELETE' THEN RAISE EXCEPTION 'order history is immutable'; END IF;
  IF ROW(NEW."userId",NEW."checkoutId",NEW.method,NEW.snapshot,NEW."addressSnapshot",NEW."freightSnapshot",NEW."subtotalCents",NEW."discountCents",NEW."shippingCents",NEW."totalCents",NEW."createdAt",NEW."expiresAt")
    IS DISTINCT FROM ROW(OLD."userId",OLD."checkoutId",OLD.method,OLD.snapshot,OLD."addressSnapshot",OLD."freightSnapshot",OLD."subtotalCents",OLD."discountCents",OLD."shippingCents",OLD."totalCents",OLD."createdAt",OLD."expiresAt")
  THEN RAISE EXCEPTION 'order snapshot and original deadline are immutable'; END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER protect_order_snapshot BEFORE UPDATE OR DELETE ON "Order" FOR EACH ROW EXECUTE FUNCTION protect_order_snapshot();
CREATE FUNCTION protect_order_item() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'order item snapshot is immutable'; END $$;
CREATE TRIGGER protect_order_item BEFORE UPDATE OR DELETE ON "OrderItem" FOR EACH ROW EXECUTE FUNCTION protect_order_item();
CREATE FUNCTION protect_order_unit_price() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN
  IF TG_OP = 'DELETE' THEN RAISE EXCEPTION 'commercial unit history is immutable'; END IF;
  IF ROW(NEW.id,NEW."orderItemId",NEW."logicalIndex",NEW."netPaidCents",NEW."priceSnapshot") IS DISTINCT FROM ROW(OLD.id,OLD."orderItemId",OLD."logicalIndex",OLD."netPaidCents",OLD."priceSnapshot")
  THEN RAISE EXCEPTION 'commercial unit price is immutable'; END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER protect_order_unit_price BEFORE UPDATE OR DELETE ON "OrderUnit" FOR EACH ROW EXECUTE FUNCTION protect_order_unit_price();
