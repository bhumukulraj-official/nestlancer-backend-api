-- CreateTable
CREATE TABLE "Backup" (
    "id" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL DEFAULT 'FULL',
    "status" TEXT NOT NULL DEFAULT 'IN_PROGRESS',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "initiatedBy" TEXT NOT NULL,
    "s3Key" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Backup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BackupSchedule" (
    "id" TEXT NOT NULL,
    "cronExpression" TEXT NOT NULL DEFAULT '0 0 * * *',
    "retentionDays" INTEGER NOT NULL DEFAULT 30,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BackupSchedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ImpersonationSession" (
    "id" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,
    "targetUserId" TEXT NOT NULL,
    "reason" TEXT,
    "ticketId" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ImpersonationSession_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Backup_initiatedBy_idx" ON "Backup"("initiatedBy");
CREATE INDEX "Backup_status_idx" ON "Backup"("status");
CREATE INDEX "Backup_startedAt_idx" ON "Backup"("startedAt");

-- CreateIndex
CREATE INDEX "ImpersonationSession_adminId_idx" ON "ImpersonationSession"("adminId");
CREATE INDEX "ImpersonationSession_targetUserId_idx" ON "ImpersonationSession"("targetUserId");
CREATE INDEX "ImpersonationSession_endedAt_idx" ON "ImpersonationSession"("endedAt");

-- AddForeignKey
ALTER TABLE "Backup" ADD CONSTRAINT "Backup_initiatedBy_fkey" FOREIGN KEY ("initiatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ImpersonationSession" ADD CONSTRAINT "ImpersonationSession_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ImpersonationSession" ADD CONSTRAINT "ImpersonationSession_targetUserId_fkey" FOREIGN KEY ("targetUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
