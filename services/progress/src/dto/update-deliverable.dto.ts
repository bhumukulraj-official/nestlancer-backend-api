import { IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Data Transfer Object for updating an existing deliverable's description.
 */
export class UpdateDeliverableDto {
    @ApiPropertyOptional({ example: 'Revised draft with updated branding...', maxLength: 1000, description: 'Updated description or notes' })
    @IsOptional()
    @IsString()
    @MaxLength(1000)
    description?: string;
}

