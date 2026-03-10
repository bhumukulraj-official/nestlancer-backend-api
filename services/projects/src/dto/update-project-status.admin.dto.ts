import { IsString, IsNotEmpty, IsBoolean, IsOptional, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Administrative DTO for overriding a project's operational status.
 */
export class UpdateProjectStatusAdminDto {
  @ApiProperty({
    description: 'New status for the project',
    example: 'PAUSED',
    enum: ['ACTIVE', 'PAUSED', 'CANCELLED', 'REVIEW', 'COMPLETED'],
  })
  @IsString()
  @IsNotEmpty()
  status: string;

  @ApiProperty({
    description: 'Internal administrative reason for the status change',
    example: 'Payment dispute initiated by client.',
    maxLength: 1000,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  reason: string;

  @ApiPropertyOptional({
    description: 'Whether to send a notification to the client about this status change',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  notifyClient?: boolean;
}
