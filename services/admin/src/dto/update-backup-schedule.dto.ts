import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString, Max, Min } from 'class-validator';

/**
 * Configuration for updating the automated database backup schedule.
 */
export class UpdateBackupScheduleDto {
  @ApiProperty({
    example: '0 0 * * *',
    description: 'Standard cron expression for backup frequency',
  })
  @IsString()
  cronExpression: string;

  @ApiProperty({
    example: 30,
    description: 'Number of days to retain backup files before automatic deletion',
    minimum: 1,
    maximum: 90,
  })
  @IsInt()
  @Min(1)
  @Max(90)
  retentionDays: number;
}
