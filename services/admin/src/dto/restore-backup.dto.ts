import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsUUID } from 'class-validator';

/**
 * Data required to initiate a database restoration from a backup.
 */
export class RestoreBackupDto {
  @ApiProperty({
    example: 'uuid-123',
    description: 'The unique identifier of the backup to restore',
  })
  @IsUUID()
  backupId: string;

  @ApiProperty({
    example: true,
    description: 'Safety confirmation required to proceed with restoration',
  })
  @IsBoolean()
  confirmRestore: boolean; // must be true
}
