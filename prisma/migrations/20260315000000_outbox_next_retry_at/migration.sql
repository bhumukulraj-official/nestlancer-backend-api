-- AlterTable: add nextRetryAt to Outbox for exponential backoff (eligible when null or <= now)
ALTER TABLE "Outbox" ADD COLUMN "nextRetryAt" TIMESTAMP(3);

-- CreateIndex: support polling by status and nextRetryAt
CREATE INDEX "Outbox_status_nextRetryAt_idx" ON "Outbox"("status", "nextRetryAt");
