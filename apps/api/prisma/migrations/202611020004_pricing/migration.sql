CREATE TYPE "DiscountType" AS ENUM ('PERCENT', 'FIXED');
CREATE TABLE "Promotion" (
  id UUID PRIMARY KEY, name VARCHAR(200) NOT NULL CHECK (length(btrim(name)) > 0), type "DiscountType" NOT NULL,
  amount INTEGER NOT NULL CHECK (amount > 0), "startsAt" TIMESTAMPTZ(3) NOT NULL, "endsAt" TIMESTAMPTZ(3) NOT NULL,
  active BOOLEAN NOT NULL DEFAULT true, version INTEGER NOT NULL DEFAULT 1 CHECK (version > 0),
  "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMPTZ(3) NOT NULL,
  CHECK ("endsAt" > "startsAt"), CHECK (type != 'PERCENT' OR amount <= 10000)
);
CREATE INDEX "Promotion_active_startsAt_endsAt_idx" ON "Promotion"(active, "startsAt", "endsAt");
CREATE TABLE "PromotionOffer" (
  "promotionId" UUID NOT NULL REFERENCES "Promotion"(id) ON DELETE RESTRICT,
  "offerId" UUID NOT NULL REFERENCES "Offer"(id) ON DELETE RESTRICT,
  PRIMARY KEY ("promotionId", "offerId")
);
CREATE INDEX "PromotionOffer_offerId_idx" ON "PromotionOffer"("offerId");
CREATE TABLE "Coupon" (
  id UUID PRIMARY KEY, code VARCHAR(40) NOT NULL UNIQUE CHECK (code ~ '^[A-Z0-9_-]{3,40}$'), type "DiscountType" NOT NULL,
  amount INTEGER NOT NULL CHECK (amount > 0), "minimumEligibleCents" INTEGER NOT NULL DEFAULT 0 CHECK ("minimumEligibleCents" >= 0),
  "allowPromotional" BOOLEAN NOT NULL DEFAULT false, "totalLimit" INTEGER CHECK ("totalLimit" > 0), "perUserLimit" INTEGER CHECK ("perUserLimit" > 0),
  "startsAt" TIMESTAMPTZ(3) NOT NULL, "endsAt" TIMESTAMPTZ(3) NOT NULL, active BOOLEAN NOT NULL DEFAULT true,
  version INTEGER NOT NULL DEFAULT 1 CHECK (version > 0), "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMPTZ(3) NOT NULL,
  CHECK ("endsAt" > "startsAt"), CHECK (type != 'PERCENT' OR amount <= 10000)
);
CREATE INDEX "Coupon_active_startsAt_endsAt_idx" ON "Coupon"(active, "startsAt", "endsAt");
CREATE TABLE "CouponTarget" (
  id UUID PRIMARY KEY, "couponId" UUID NOT NULL REFERENCES "Coupon"(id) ON DELETE RESTRICT,
  "offerId" UUID REFERENCES "Offer"(id) ON DELETE RESTRICT,
  "editionId" UUID REFERENCES "Edition"(id) ON DELETE RESTRICT, "genreId" UUID REFERENCES "Genre"(id) ON DELETE RESTRICT,
  CHECK (num_nonnulls("offerId", "editionId", "genreId") = 1)
);
CREATE UNIQUE INDEX "CouponTarget_couponId_offerId_key" ON "CouponTarget"("couponId", "offerId");
CREATE UNIQUE INDEX "CouponTarget_couponId_editionId_key" ON "CouponTarget"("couponId", "editionId");
CREATE UNIQUE INDEX "CouponTarget_couponId_genreId_key" ON "CouponTarget"("couponId", "genreId");
CREATE INDEX "CouponTarget_offerId_idx" ON "CouponTarget"("offerId");
CREATE INDEX "CouponTarget_editionId_idx" ON "CouponTarget"("editionId");
CREATE INDEX "CouponTarget_genreId_idx" ON "CouponTarget"("genreId");
