-- =============================================================================
-- Migration: 00006_projects
-- Description: Creates projects table with status enum.
-- =============================================================================

CREATE TYPE "ProjectStatus" AS ENUM (
  'CREATED', 'PENDING_PAYMENT', 'IN_PROGRESS', 'REVIEW',
  'COMPLETED', 'ARCHIVED', 'CANCELLED', 'REVISION_REQUESTED', 'ON_HOLD'
);

CREATE TABLE "Project" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "quoteId" TEXT NOT NULL,
  "clientId" TEXT NOT NULL,
  "adminId" TEXT,
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "status" "ProjectStatus" NOT NULL DEFAULT 'CREATED',
  "overallProgress" INTEGER NOT NULL DEFAULT 0,
  "startDate" TIMESTAMP(3),
  "targetEndDate" TIMESTAMP(3),
  "completedAt" TIMESTAMP(3),
  "deletedAt" TIMESTAMP(3),
  "tags" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Project_quoteId_key" ON "Project"("quoteId");
CREATE INDEX "Project_clientId_idx" ON "Project"("clientId");
CREATE INDEX "Project_adminId_idx" ON "Project"("adminId");
CREATE INDEX "Project_status_idx" ON "Project"("status");

ALTER TABLE "Project" ADD CONSTRAINT "Project_quoteId_fkey"
  FOREIGN KEY ("quoteId") REFERENCES "Quote"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Project" ADD CONSTRAINT "Project_clientId_fkey"
  FOREIGN KEY ("clientId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Project" ADD CONSTRAINT "Project_adminId_fkey"
  FOREIGN KEY ("adminId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Add back-reference from Quote to Project
ALTER TABLE "Quote" ADD CONSTRAINT "Quote_projectId_fkey"
  FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;
