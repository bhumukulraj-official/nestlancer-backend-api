import { IsOptional, IsString, ValidateNested, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

/**
 * Criteria for targeting a notification segment.
 */
export class SegmentCriteriaDto {
    @ApiPropertyOptional({ example: 'FREELANCER', description: 'Target users by their role' })
    @IsOptional()
    @IsString()
    role?: string;

    @ApiPropertyOptional({ description: 'Target users based on registration or activity date' })
    @IsOptional()
    @IsObject()
    dateRange?: { start?: string; end?: string };

    @ApiPropertyOptional({ description: 'Target users by specific activity patterns' })
    @IsOptional()
    @IsString()
    activity?: string;
}

/**
 * Data Transfer Object for sending notifications to a targeted segment.
 */
export class SegmentNotificationDto {
    @ApiProperty({ description: 'Segmentation rules' })
    @ValidateNested()
    @Type(() => SegmentCriteriaDto)
    criteria: SegmentCriteriaDto;

    @ApiProperty({ description: 'The notification content and metadata' })
    @IsObject()
    notificationPayload: any;
}
