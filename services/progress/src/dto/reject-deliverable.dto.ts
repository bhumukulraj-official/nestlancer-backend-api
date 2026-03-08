import { IsString, MaxLength, IsOptional, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Data Transfer Object for rejecting a deliverable submission.
 */
export class RejectDeliverableDto {
    @ApiProperty({ example: 'The branding colors do not match the style guide.', maxLength: 2000, description: 'The reason for rejection' })
    @IsString()
    @MaxLength(2000)
    reason: string;

    @ApiPropertyOptional({ type: [String], example: ['Update primary color to #FF5733', 'Fix alignment on header'], description: 'Specific changes requested' })
    @IsOptional()
    @IsArray()
    requestedChanges?: string[];
}

