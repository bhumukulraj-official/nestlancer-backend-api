import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

/**
 * Configuration for creating a manual database backup.
 */
export class CreateBackupDto {
  @ApiPropertyOptional({
    example: 'Pre-migration backup',
    description: 'Optional description for the backup',
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  description?: string;
}
