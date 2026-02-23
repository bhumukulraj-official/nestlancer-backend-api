-- =============================================================================
-- Migration: 00005_quotes
-- Description: Creates quotes table with status enum.
-- =============================================================================

CREATE TYPE "QuoteStatus" AS ENUM (
  'DRAFT', 'PENDING', 'SENT', 'VIEWED', 'ACCEPTED',
  'DECLINED', 'EXPIRED', 'CHANGES_REQUESTED', 'REVISED'
);

CREATE TABLE "Quote" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "requestId" TEXT NOT NULL,
  "projectId" TEXT,
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "totalAmount" INTEGER NOT NULL,
  "currency" TEXT NOT NULL DEFAULT 'INR',
  "validUntil" TIMESTAMP(3) NOT NULL,
  "status" "QuoteStatus" NOT NULL DEFAULT 'DRAFT',
  "terms" TEXT,
  "notes" TEXT,
  "paymentBreakdown" JSONB,
  "timeline" JSONB,
  "scope" JSONB,
  "technicalDetails" JSONB,
  "acceptedAt" TIMESTAMP(3),
  "declinedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "Quote_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Quote_requestId_key" ON "Quote"("requestId");
CREATE UNIQUE INDEX "Quote_projectId_key" ON "Quote"("projectId");
CREATE INDEX "Quote_status_idx" ON "Quote"("status");

ALTER TABLE "Quote" ADD CONSTRAINT "Quote_requestId_fkey"
  FOREIGN KEY ("requestId") REFERENCES "ProjectRequest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
