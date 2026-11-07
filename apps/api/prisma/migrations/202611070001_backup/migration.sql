CREATE TABLE "BackupRun" (
  id UUID PRIMARY KEY,
  status VARCHAR(12) NOT NULL CHECK (status IN ('RUNNING','SUCCEEDED','FAILED')),
  "createdAt" TIMESTAMPTZ(3) NOT NULL,
  "completedAt" TIMESTAMPTZ(3),
  "manifestHash" VARCHAR(64),
  "errorCode" VARCHAR(50),
  CHECK ((status='RUNNING')=("completedAt" IS NULL)),
  CHECK ((status='SUCCEEDED')=("manifestHash" IS NOT NULL))
);
CREATE INDEX "BackupRun_createdAt_idx" ON "BackupRun"("createdAt");
