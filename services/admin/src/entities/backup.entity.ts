export class Backup {
  id: string;
  description?: string | null;
  type: 'FULL' | 'SCHEMA' | 'DATA';
  status: 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
  filePath?: string | null;
  fileSize?: bigint | null;
  checksum?: string | null;
  startedAt: Date;
  completedAt?: Date | null;
  initiatedBy: string;
  error?: string | null;
}
