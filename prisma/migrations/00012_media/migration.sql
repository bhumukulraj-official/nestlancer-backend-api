-- =============================================================================
-- Migration: 00012_media
-- Description: Creates media table for file uploads.
-- =============================================================================

CREATE TYPE "MediaStatus" AS ENUM ('UPLOADING', 'PROCESSING', 'READY', 'FAILED', 'DELETED');

CREATE TABLE "Media" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "uploaderId" TEXT NOT NULL,
  "filename" TEXT NOT NULL,
  "mimeType" TEXT NOT NULL,
  "size" INTEGER NOT NULL,
  "key" TEXT NOT NULL,
  "url" TEXT,
  "bucket" TEXT NOT NULL,
  "context" TEXT NOT NULL,
  "contextType" TEXT,
  "contextId" TEXT,
  "status" "MediaStatus" NOT NULL DEFAULT 'UPLOADING',
  "metadata" JSONB,
  "blurhash" TEXT,
  "width" INTEGER,
  "height" INTEGER,
  "duration" INTEGER,
  "checksum" TEXT,
  "deletedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "Media_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Media_key_key" ON "Media"("key");
CREATE INDEX "Media_uploaderId_idx" ON "Media"("uploaderId");
CREATE INDEX "Media_contextType_contextId_idx" ON "Media"("contextType", "contextId");
CREATE INDEX "Media_status_idx" ON "Media"("status");

ALTER TABLE "Media" ADD CONSTRAINT "Media_uploaderId_fkey"
  FOREIGN KEY ("uploaderId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
