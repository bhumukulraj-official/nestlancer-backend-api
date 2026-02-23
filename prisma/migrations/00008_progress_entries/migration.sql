-- =============================================================================
-- Migration: 00008_progress_entries
-- Description: Creates progress_entries table for project timeline tracking.
-- =============================================================================

CREATE TABLE "ProgressEntry" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "projectId" TEXT NOT NULL,
  "milestoneId" TEXT,
  "deliverableId" TEXT,
  "type" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "actorId" TEXT,
  "details" JSONB,
  "visibility" TEXT NOT NULL DEFAULT 'client',
  "clientNotified" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "ProgressEntry_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "ProgressEntry_projectId_idx" ON "ProgressEntry"("projectId");

ALTER TABLE "ProgressEntry" ADD CONSTRAINT "ProgressEntry_projectId_fkey"
  FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ProgressEntry" ADD CONSTRAINT "ProgressEntry_milestoneId_fkey"
  FOREIGN KEY ("milestoneId") REFERENCES "Milestone"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ProgressEntry" ADD CONSTRAINT "ProgressEntry_deliverableId_fkey"
  FOREIGN KEY ("deliverableId") REFERENCES "Deliverable"("id") ON DELETE SET NULL ON UPDATE CASCADE;
