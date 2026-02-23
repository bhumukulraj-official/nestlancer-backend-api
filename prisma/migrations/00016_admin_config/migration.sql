-- =============================================================================
-- Migration: 00016_admin_config
-- Description: Creates system_config and feature_flags tables.
-- =============================================================================

CREATE TABLE "SystemConfig" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "key" TEXT NOT NULL,
  "value" JSONB NOT NULL,
  "description" TEXT,
  "updatedById" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "SystemConfig_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "FeatureFlag" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "flag" TEXT NOT NULL,
  "enabled" BOOLEAN NOT NULL DEFAULT false,
  "description" TEXT,
  "rolloutPercentage" INTEGER NOT NULL DEFAULT 0,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "FeatureFlag_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "SystemConfig_key_key" ON "SystemConfig"("key");
CREATE INDEX "SystemConfig_key_idx" ON "SystemConfig"("key");
CREATE UNIQUE INDEX "FeatureFlag_flag_key" ON "FeatureFlag"("flag");
CREATE INDEX "FeatureFlag_flag_idx" ON "FeatureFlag"("flag");

ALTER TABLE "SystemConfig" ADD CONSTRAINT "SystemConfig_updatedById_fkey"
  FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
