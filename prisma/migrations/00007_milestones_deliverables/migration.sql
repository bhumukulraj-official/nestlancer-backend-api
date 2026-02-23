-- =============================================================================
-- Migration: 00007_milestones_deliverables
-- Description: Creates milestones and deliverables tables.
-- =============================================================================

CREATE TYPE "MilestoneStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'REVIEW', 'COMPLETED', 'CANCELLED');
CREATE TYPE "DeliverableStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'READY_FOR_REVIEW', 'REVISION_REQUESTED', 'APPROVED', 'REJECTED');

CREATE TABLE "Milestone" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "projectId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "amount" INTEGER,
  "percentage" DOUBLE PRECISION,
  "dueDate" TIMESTAMP(3),
  "status" "MilestoneStatus" NOT NULL DEFAULT 'PENDING',
  "progress" INTEGER NOT NULL DEFAULT 0,
  "order" INTEGER NOT NULL DEFAULT 0,
  "startDate" TIMESTAMP(3),
  "endDate" TIMESTAMP(3),
  "completedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "Milestone_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Deliverable" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "milestoneId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "status" "DeliverableStatus" NOT NULL DEFAULT 'PENDING',
  "priority" TEXT,
  "tags" JSONB,
  "attachments" JSONB,
  "dueAt" TIMESTAMP(3),
  "approvedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "Deliverable_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Milestone_projectId_idx" ON "Milestone"("projectId");
CREATE INDEX "Milestone_status_idx" ON "Milestone"("status");
CREATE INDEX "Deliverable_milestoneId_idx" ON "Deliverable"("milestoneId");
CREATE INDEX "Deliverable_status_idx" ON "Deliverable"("status");

ALTER TABLE "Milestone" ADD CONSTRAINT "Milestone_projectId_fkey"
  FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Deliverable" ADD CONSTRAINT "Deliverable_milestoneId_fkey"
  FOREIGN KEY ("milestoneId") REFERENCES "Milestone"("id") ON DELETE CASCADE ON UPDATE CASCADE;
