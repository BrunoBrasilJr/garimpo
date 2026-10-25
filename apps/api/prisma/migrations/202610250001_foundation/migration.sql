-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "AccountContext" AS ENUM ('CUSTOMER', 'STAFF');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN', 'OPERATOR');

-- CreateEnum
CREATE TYPE "EmailPurpose" AS ENUM ('VERIFY', 'CHANGE', 'REACTIVATE');

-- CreateEnum
CREATE TYPE "MessageStatus" AS ENUM ('PENDING', 'FAILED', 'DELIVERED');

-- CreateTable
CREATE TABLE "User" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "emailNormalized" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "context" "AccountContext" NOT NULL,
    "role" "Role" NOT NULL,
    "emailVerifiedAt" TIMESTAMPTZ(3),
    "blockedAt" TIMESTAMPTZ(3),
    "closedAt" TIMESTAMPTZ(3),
    "inactiveAt" TIMESTAMPTZ(3),
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "credentialHash" CHAR(64) NOT NULL,
    "refreshHash" CHAR(64) NOT NULL,
    "expiresAt" TIMESTAMPTZ(3) NOT NULL,
    "refreshExpiresAt" TIMESTAMPTZ(3) NOT NULL,
    "revokedAt" TIMESTAMPTZ(3),
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PasswordReset" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "tokenHash" CHAR(64) NOT NULL,
    "expiresAt" TIMESTAMPTZ(3) NOT NULL,
    "usedAt" TIMESTAMPTZ(3),
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PasswordReset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmailToken" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "purpose" "EmailPurpose" NOT NULL,
    "pendingEmail" TEXT,
    "tokenHash" CHAR(64) NOT NULL,
    "expiresAt" TIMESTAMPTZ(3) NOT NULL,
    "usedAt" TIMESTAMPTZ(3),
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmailToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" UUID NOT NULL,
    "actorId" UUID,
    "action" TEXT NOT NULL,
    "targetType" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "result" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "redactedChanges" JSONB NOT NULL,
    "correlationId" UUID NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DomainEvent" (
    "id" UUID NOT NULL,
    "type" TEXT NOT NULL,
    "aggregateId" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "processedAt" TIMESTAMPTZ(3),
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "lastErrorCode" TEXT,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DomainEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DemoMessage" (
    "id" UUID NOT NULL,
    "userId" UUID,
    "eventId" UUID,
    "tokenRef" UUID,
    "type" TEXT NOT NULL,
    "restrictedBody" TEXT NOT NULL,
    "dedupKey" TEXT NOT NULL,
    "status" "MessageStatus" NOT NULL DEFAULT 'PENDING',
    "deliveredAt" TIMESTAMPTZ(3),
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DemoMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IdempotencyRecord" (
    "id" UUID NOT NULL,
    "actorScope" VARCHAR(200) NOT NULL,
    "operation" VARCHAR(100) NOT NULL,
    "key" VARCHAR(128) NOT NULL,
    "requestHash" CHAR(64) NOT NULL,
    "resultRef" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IdempotencyRecord_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_emailNormalized_key" ON "User"("emailNormalized");

-- CreateIndex
CREATE UNIQUE INDEX "Session_credentialHash_key" ON "Session"("credentialHash");

-- CreateIndex
CREATE UNIQUE INDEX "Session_refreshHash_key" ON "Session"("refreshHash");

-- CreateIndex
CREATE INDEX "Session_userId_expiresAt_idx" ON "Session"("userId", "expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "PasswordReset_tokenHash_key" ON "PasswordReset"("tokenHash");

-- CreateIndex
CREATE INDEX "PasswordReset_userId_expiresAt_idx" ON "PasswordReset"("userId", "expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "EmailToken_tokenHash_key" ON "EmailToken"("tokenHash");

-- CreateIndex
CREATE INDEX "EmailToken_userId_purpose_expiresAt_idx" ON "EmailToken"("userId", "purpose", "expiresAt");

-- CreateIndex
CREATE INDEX "AuditLog_actorId_createdAt_idx" ON "AuditLog"("actorId", "createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_targetType_targetId_createdAt_idx" ON "AuditLog"("targetType", "targetId", "createdAt");

-- CreateIndex
CREATE INDEX "DomainEvent_processedAt_createdAt_id_idx" ON "DomainEvent"("processedAt", "createdAt", "id");

-- CreateIndex
CREATE UNIQUE INDEX "DemoMessage_dedupKey_key" ON "DemoMessage"("dedupKey");

-- CreateIndex
CREATE INDEX "DemoMessage_userId_idx" ON "DemoMessage"("userId");

-- CreateIndex
CREATE INDEX "DemoMessage_eventId_idx" ON "DemoMessage"("eventId");

-- CreateIndex
CREATE INDEX "DemoMessage_status_createdAt_idx" ON "DemoMessage"("status", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "IdempotencyRecord_actorScope_operation_key_key" ON "IdempotencyRecord"("actorScope", "operation", "key");

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PasswordReset" ADD CONSTRAINT "PasswordReset_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmailToken" ADD CONSTRAINT "EmailToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DemoMessage" ADD CONSTRAINT "DemoMessage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DemoMessage" ADD CONSTRAINT "DemoMessage_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "DomainEvent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;


-- Foundation invariants not expressible in the Prisma schema.
ALTER TABLE "User" ADD CONSTRAINT "User_context_role_check" CHECK (
  (context = 'CUSTOMER' AND role = 'USER') OR
  (context = 'STAFF' AND role IN ('ADMIN', 'OPERATOR'))
);
ALTER TABLE "Session" ADD CONSTRAINT "Session_hashes_check"
  CHECK ("credentialHash" ~ '^[0-9a-f]{64}$' AND "refreshHash" ~ '^[0-9a-f]{64}$');
ALTER TABLE "PasswordReset" ADD CONSTRAINT "PasswordReset_hash_check"
  CHECK ("tokenHash" ~ '^[0-9a-f]{64}$');
ALTER TABLE "EmailToken" ADD CONSTRAINT "EmailToken_hash_check"
  CHECK ("tokenHash" ~ '^[0-9a-f]{64}$');
ALTER TABLE "IdempotencyRecord" ADD CONSTRAINT "IdempotencyRecord_hash_check"
  CHECK ("requestHash" ~ '^[0-9a-f]{64}$');
ALTER TABLE "DomainEvent" ADD CONSTRAINT "DomainEvent_attempts_check" CHECK (attempts >= 0);
ALTER TABLE "DemoMessage" ADD CONSTRAINT "DemoMessage_attempts_check" CHECK (attempts >= 0);

CREATE FUNCTION deny_audit_mutation() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  RAISE EXCEPTION 'AuditLog is append-only' USING ERRCODE = '55000';
END;
$$;
CREATE TRIGGER audit_append_only BEFORE UPDATE OR DELETE OR TRUNCATE ON "AuditLog"
  FOR EACH STATEMENT EXECUTE FUNCTION deny_audit_mutation();
