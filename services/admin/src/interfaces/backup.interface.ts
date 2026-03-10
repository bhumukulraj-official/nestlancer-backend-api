import { Backup } from '../entities/backup.entity';

export interface BackupConfig {
  bucketName: string;
  retentionDays: number;
  pgDumpPath?: string;
}

export interface RestoreResult {
  success: boolean;
  durationMs: number;
  preBackupId?: string;
  error?: string;
}
