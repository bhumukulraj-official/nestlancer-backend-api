-- =============================================================================
-- Migration: 00004_project_requests
-- Description: Creates project_requests table with status enum.
-- =============================================================================

CREATE TYPE "RequestStatus" AS ENUM (
  'DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'QUOTED', 'ACCEPTED',
  'REJECTED', 'CONVERTED_TO_PROJECT', 'CHANGES_REQUESTED', 'CANCELLED'
);

CREATE TABLE "ProjectRequest" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "userId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "budgetMin" INTEGER,
  "budgetMax" INTEGER,
  "currency" TEXT NOT NULL DEFAULT 'INR',
  "timeframe" TEXT,
  "status" "RequestStatus" NOT NULL DEFAULT 'DRAFT',
  "deletedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "ProjectRequest_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "ProjectRequest_userId_idx" ON "ProjectRequest"("userId");
CREATE INDEX "ProjectRequest_status_idx" ON "ProjectRequest"("status");

ALTER TABLE "ProjectRequest" ADD CONSTRAINT "ProjectRequest_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
