-- =============================================================================
-- Migration: 00013_portfolio
-- Description: Creates portfolio_items table.
-- =============================================================================

CREATE TYPE "PortfolioStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

CREATE TABLE "PortfolioItem" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "title" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "shortDescription" TEXT,
  "longDescription" TEXT,
  "category" TEXT NOT NULL,
  "tags" JSONB,
  "status" "PortfolioStatus" NOT NULL DEFAULT 'DRAFT',
  "featured" BOOLEAN NOT NULL DEFAULT false,
  "displayOrder" INTEGER NOT NULL DEFAULT 0,
  "coverImageUrl" TEXT,
  "images" JSONB,
  "clientName" TEXT,
  "clientTestimonial" TEXT,
  "projectUrl" TEXT,
  "startDate" TIMESTAMP(3),
  "endDate" TIMESTAMP(3),
  "technologies" JSONB,
  "results" JSONB,
  "seoTitle" TEXT,
  "seoDescription" TEXT,
  "publishedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "PortfolioItem_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "PortfolioItem_slug_key" ON "PortfolioItem"("slug");
CREATE INDEX "PortfolioItem_status_idx" ON "PortfolioItem"("status");
CREATE INDEX "PortfolioItem_category_idx" ON "PortfolioItem"("category");
