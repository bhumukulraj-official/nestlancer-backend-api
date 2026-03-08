import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Details of a system database backup archive.
 */
export class BackupResponseDto {
    @ApiProperty({ description: 'Unique identifier for the backup archive', example: '550e8400-e29b-41d4-a716-446655440000' })
    id: string;

    @ApiPropertyOptional({ description: 'User-provided context or reasoning for the backup', example: 'Pre-deployment snapshot' })
    description?: string | null;

    @ApiPropertyOptional({ description: 'Archive file size in bytes', example: '10485760', type: 'string' })
    size?: bigint | null;

    @ApiProperty({ description: 'Current processing or storage state of the backup', example: 'completed' })
    status: string;

    @ApiProperty({ description: 'The originating mechanism of the backup (e.g., manual, scheduled)', example: 'manual' })
    type: string;

    @ApiPropertyOptional({ description: 'Secure temporary URL for archive retrieval', example: 'https://storage.provider.com/backups/xxx.gz' })
    downloadUrl?: string;

    @ApiProperty({ description: 'ISO 8601 timestamp of archive finalization', example: '2023-01-01T00:00:00.000Z' })
    createdAt: Date;
}

