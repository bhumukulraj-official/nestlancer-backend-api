export class BackupSchedule {
  id: string;
  cronExpression: string;
  retention: number; // in days
  enabled: boolean;
  lastRunAt?: Date | null;
  nextRunAt?: Date | null;
  updatedAt: Date;
}
