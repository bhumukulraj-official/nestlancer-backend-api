import { IsString, IsOptional, MaxLength, IsNumber, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Data Transfer Object for processing a refund.
 */
export class ProcessRefundDto {
    @ApiPropertyOptional({ example: 100, description: 'Optional partial refund amount. If omitted, full refund is processed.' })
    @IsOptional()
    @IsNumber()
    @Min(1)
    amount?: number; // Optional partial refund amount

    @ApiPropertyOptional({ example: 'Project cancelled', maxLength: 500, description: 'Reason for the refund' })
    @IsOptional()
    @IsString()
    @MaxLength(500)
    reason?: string;
}
