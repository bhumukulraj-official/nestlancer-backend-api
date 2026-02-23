-- =============================================================================
-- Migration: 00002_user_preferences
-- Description: Creates user_preferences table.
-- =============================================================================

CREATE TABLE "UserPreference" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "userId" TEXT NOT NULL,
  "notificationSettings" JSONB,
  "marketingSettings" JSONB,
  "privacySettings" JSONB,
  "theme" TEXT NOT NULL DEFAULT 'system',
  "timezone" TEXT NOT NULL DEFAULT 'UTC',
  "language" TEXT NOT NULL DEFAULT 'en',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "UserPreference_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "UserPreference_userId_key" ON "UserPreference"("userId");

ALTER TABLE "UserPreference" ADD CONSTRAINT "UserPreference_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
