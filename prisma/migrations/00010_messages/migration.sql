-- =============================================================================
-- Migration: 00010_messages
-- Description: Creates messages table for project messaging.
-- =============================================================================

CREATE TYPE "MessageType" AS ENUM ('TEXT', 'FILE', 'SYSTEM', 'NOTIFICATION');

CREATE TABLE "Message" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "projectId" TEXT NOT NULL,
  "senderId" TEXT NOT NULL,
  "content" TEXT,
  "replyToId" TEXT,
  "type" "MessageType" NOT NULL DEFAULT 'TEXT',
  "readBy" JSONB,
  "reactions" JSONB,
  "editedAt" TIMESTAMP(3),
  "deletedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Message_projectId_idx" ON "Message"("projectId");
CREATE INDEX "Message_createdAt_idx" ON "Message"("createdAt");

ALTER TABLE "Message" ADD CONSTRAINT "Message_projectId_fkey"
  FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Message" ADD CONSTRAINT "Message_senderId_fkey"
  FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Message" ADD CONSTRAINT "Message_replyToId_fkey"
  FOREIGN KEY ("replyToId") REFERENCES "Message"("id") ON DELETE SET NULL ON UPDATE CASCADE;
