CREATE TYPE "CheckoutStatus" AS ENUM ('ACTIVE','CANCELLED','EXPIRED','CONVERTED');
CREATE TYPE "ReservationStatus" AS ENUM ('ACTIVE','CONSUMED','RELEASED','EXPIRED');
CREATE TYPE "CouponUsageStatus" AS ENUM ('RESERVED','CONSUMED','RELEASED');
CREATE TABLE "Cart" (
  id UUID PRIMARY KEY, "userId" UUID NOT NULL UNIQUE REFERENCES "User"(id) ON DELETE RESTRICT,
  version INTEGER NOT NULL DEFAULT 1 CHECK (version > 0),
  "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMPTZ(3) NOT NULL
);
CREATE TABLE "CartItem" (
  id UUID PRIMARY KEY, "cartId" UUID NOT NULL REFERENCES "Cart"(id) ON DELETE RESTRICT,
  "offerId" UUID NOT NULL REFERENCES "Offer"(id) ON DELETE RESTRICT,
  quantity INTEGER NOT NULL CHECK (quantity BETWEEN 1 AND 1000),
  "lastSeenPriceCents" INTEGER NOT NULL CHECK ("lastSeenPriceCents" >= 0), UNIQUE("cartId","offerId")
);
CREATE INDEX "CartItem_offerId_idx" ON "CartItem"("offerId");
CREATE TABLE "Checkout" (
  id UUID PRIMARY KEY, "userId" UUID NOT NULL REFERENCES "User"(id) ON DELETE RESTRICT,
  "cartId" UUID NOT NULL REFERENCES "Cart"(id) ON DELETE RESTRICT,
  "cartVersion" INTEGER NOT NULL CHECK ("cartVersion" > 0), status "CheckoutStatus" NOT NULL DEFAULT 'ACTIVE',
  version INTEGER NOT NULL DEFAULT 1 CHECK (version > 0), "couponCode" VARCHAR(40),
  "requestKey" VARCHAR(128) NOT NULL CHECK (length("requestKey") > 0), "requestHash" CHAR(64) NOT NULL,
  "pricingRevision" CHAR(64) NOT NULL, "quoteSnapshot" JSONB NOT NULL,
  "addressId" UUID REFERENCES "Address"(id) ON DELETE RESTRICT,
  "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "expiresAt" TIMESTAMPTZ(3) NOT NULL,
  "closedAt" TIMESTAMPTZ(3), CHECK ("expiresAt" = "createdAt" + INTERVAL '15 minutes'),
  CHECK ((status = 'ACTIVE') = ("closedAt" IS NULL)), UNIQUE("userId","requestKey")
);
CREATE UNIQUE INDEX "Checkout_one_active_user" ON "Checkout"("userId") WHERE status = 'ACTIVE';
CREATE INDEX "Checkout_userId_status_expiresAt_idx" ON "Checkout"("userId",status,"expiresAt");
CREATE INDEX "Checkout_status_expiresAt_id_idx" ON "Checkout"(status,"expiresAt",id);
CREATE INDEX "Checkout_cartId_idx" ON "Checkout"("cartId");
CREATE INDEX "Checkout_addressId_idx" ON "Checkout"("addressId");
CREATE TABLE "CheckoutItem" (
  id UUID PRIMARY KEY, "checkoutId" UUID NOT NULL REFERENCES "Checkout"(id) ON DELETE RESTRICT,
  "offerId" UUID NOT NULL REFERENCES "Offer"(id) ON DELETE RESTRICT,
  quantity INTEGER NOT NULL CHECK (quantity BETWEEN 1 AND 1000), snapshot JSONB NOT NULL,
  UNIQUE("checkoutId","offerId")
);
CREATE INDEX "CheckoutItem_offerId_idx" ON "CheckoutItem"("offerId");
CREATE TABLE "Reservation" (
  id UUID PRIMARY KEY, "offerId" UUID NOT NULL REFERENCES "Offer"(id) ON DELETE RESTRICT,
  "checkoutItemId" UUID NOT NULL UNIQUE REFERENCES "CheckoutItem"(id) ON DELETE RESTRICT,
  quantity INTEGER NOT NULL CHECK (quantity BETWEEN 1 AND 1000), status "ReservationStatus" NOT NULL DEFAULT 'ACTIVE',
  "expiresAt" TIMESTAMPTZ(3) NOT NULL, "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "releasedAt" TIMESTAMPTZ(3), CHECK ((status = 'ACTIVE') = ("releasedAt" IS NULL))
);
CREATE INDEX "Reservation_offerId_status_expiresAt_idx" ON "Reservation"("offerId",status,"expiresAt");
CREATE INDEX "Reservation_status_expiresAt_id_idx" ON "Reservation"(status,"expiresAt",id);
CREATE TABLE "CouponUsage" (
  id UUID PRIMARY KEY, "couponId" UUID NOT NULL REFERENCES "Coupon"(id) ON DELETE RESTRICT,
  "userId" UUID NOT NULL REFERENCES "User"(id) ON DELETE RESTRICT,
  "checkoutId" UUID NOT NULL UNIQUE REFERENCES "Checkout"(id) ON DELETE RESTRICT,
  status "CouponUsageStatus" NOT NULL DEFAULT 'RESERVED', "expiresAt" TIMESTAMPTZ(3) NOT NULL,
  "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "releasedAt" TIMESTAMPTZ(3),
  CHECK ((status = 'RELEASED') = ("releasedAt" IS NOT NULL))
);
CREATE INDEX "CouponUsage_couponId_status_expiresAt_idx" ON "CouponUsage"("couponId",status,"expiresAt");
CREATE INDEX "CouponUsage_userId_couponId_status_expiresAt_idx" ON "CouponUsage"("userId","couponId",status,"expiresAt");

CREATE FUNCTION protect_checkout_snapshot() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN
  IF TG_OP = 'DELETE' THEN RAISE EXCEPTION 'checkout history is immutable'; END IF;
  IF ROW(NEW."userId",NEW."cartId",NEW."cartVersion",NEW."couponCode",NEW."requestKey",NEW."requestHash",NEW."pricingRevision",NEW."quoteSnapshot",NEW."createdAt",NEW."expiresAt")
     IS DISTINCT FROM ROW(OLD."userId",OLD."cartId",OLD."cartVersion",OLD."couponCode",OLD."requestKey",OLD."requestHash",OLD."pricingRevision",OLD."quoteSnapshot",OLD."createdAt",OLD."expiresAt")
  THEN RAISE EXCEPTION 'checkout snapshot and deadline are immutable'; END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER protect_checkout_snapshot BEFORE UPDATE OR DELETE ON "Checkout" FOR EACH ROW EXECUTE FUNCTION protect_checkout_snapshot();
CREATE FUNCTION protect_checkout_items() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'checkout items are immutable'; END $$;
CREATE TRIGGER protect_checkout_items BEFORE UPDATE OR DELETE ON "CheckoutItem" FOR EACH ROW EXECUTE FUNCTION protect_checkout_items();
