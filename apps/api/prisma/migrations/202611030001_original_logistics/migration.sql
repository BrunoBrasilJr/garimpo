CREATE TABLE "OrderStatusEvent" (
 id UUID PRIMARY KEY, "orderId" UUID NOT NULL REFERENCES "Order"(id) ON DELETE RESTRICT,
 version INTEGER NOT NULL CHECK (version>0), "fromStatus" "OrderStatus", "toStatus" "OrderStatus" NOT NULL,
 "actorId" UUID REFERENCES "User"(id) ON DELETE RESTRICT, "actorRole" "Role", reason VARCHAR(500) NOT NULL CHECK (length(reason)>0),
 "occurredAt" TIMESTAMPTZ(3) NOT NULL, "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 UNIQUE("orderId",version), CHECK ("fromStatus" IS NULL OR "fromStatus"<>"toStatus"), CHECK (("actorId" IS NULL)=("actorRole" IS NULL))
);
CREATE INDEX "OrderStatusEvent_actorId_idx" ON "OrderStatusEvent"("actorId");
CREATE INDEX "OrderStatusEvent_orderId_occurredAt_id_idx" ON "OrderStatusEvent"("orderId","occurredAt",id);
-- Only facts already stored by the previous increment. No invented shipment, staff actor or delivery time.
INSERT INTO "OrderStatusEvent"(id,"orderId",version,"toStatus",reason,"occurredAt")
 SELECT gen_random_uuid(),id,1,CASE WHEN method='CARD' THEN 'PAID'::"OrderStatus" ELSE 'PENDING'::"OrderStatus" END,'MIGRATED_STORED_CREATION',"createdAt" FROM "Order";
INSERT INTO "OrderStatusEvent"(id,"orderId",version,"fromStatus","toStatus",reason,"occurredAt")
 SELECT gen_random_uuid(),id,2,'PENDING','PAID','MIGRATED_STORED_PAYMENT',"paidAt" FROM "Order" WHERE method<>'CARD' AND "paidAt" IS NOT NULL;
INSERT INTO "OrderStatusEvent"(id,"orderId",version,"fromStatus","toStatus",reason,"occurredAt")
 SELECT gen_random_uuid(),o.id,o.version,'PENDING','CANCELLED','MIGRATED_STORED_EXPIRY',min(a."createdAt")
 FROM "Order" o JOIN "AuditLog" a ON a."targetId"=o.id::text AND a."targetType"='ORDER' AND a.action='ORDER.EXPIRED' AND a.result='SUCCESS'
 WHERE o.status='CANCELLED' AND o."paidAt" IS NULL AND o.version>1 GROUP BY o.id,o.version;
CREATE FUNCTION deny_order_history_mutation() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'order status history is append only' USING ERRCODE='55000'; END $$;
CREATE TRIGGER order_history_append_only BEFORE UPDATE OR DELETE OR TRUNCATE ON "OrderStatusEvent" FOR EACH STATEMENT EXECUTE FUNCTION deny_order_history_mutation();
CREATE TABLE "Shipment" (
 id UUID PRIMARY KEY, "orderId" UUID NOT NULL REFERENCES "Order"(id) ON DELETE RESTRICT,
 kind VARCHAR(30) NOT NULL DEFAULT 'ORIGINAL' CHECK (kind='ORIGINAL'), "trackingCode" VARCHAR(120) NOT NULL CHECK (length(btrim("trackingCode"))>0),
 "postedAt" TIMESTAMPTZ(3) NOT NULL, "deliveredAt" TIMESTAMPTZ(3) CHECK ("deliveredAt" IS NULL OR "deliveredAt">="postedAt"),
 "createdById" UUID NOT NULL REFERENCES "User"(id) ON DELETE RESTRICT, "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX "Shipment_orderId_idx" ON "Shipment"("orderId");
CREATE INDEX "Shipment_createdById_idx" ON "Shipment"("createdById");
CREATE UNIQUE INDEX shipment_one_original_order ON "Shipment"("orderId") WHERE kind='ORIGINAL';
CREATE FUNCTION protect_original_shipment() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN
 IF TG_OP='DELETE' THEN RAISE EXCEPTION 'shipment history is immutable'; END IF;
 IF ROW(NEW.id,NEW."orderId",NEW.kind,NEW."trackingCode",NEW."postedAt",NEW."createdById",NEW."createdAt") IS DISTINCT FROM ROW(OLD.id,OLD."orderId",OLD.kind,OLD."trackingCode",OLD."postedAt",OLD."createdById",OLD."createdAt") OR (OLD."deliveredAt" IS NOT NULL AND NEW."deliveredAt" IS DISTINCT FROM OLD."deliveredAt") THEN RAISE EXCEPTION 'original shipment facts are immutable'; END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER protect_original_shipment BEFORE UPDATE OR DELETE ON "Shipment" FOR EACH ROW EXECUTE FUNCTION protect_original_shipment();
CREATE TRIGGER shipment_no_truncate BEFORE TRUNCATE ON "Shipment" FOR EACH STATEMENT EXECUTE FUNCTION deny_order_history_mutation();
