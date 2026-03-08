import { IsOptional, IsEnum, IsUUID, IsInt, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { PaymentStatus } from '../interfaces/payments.interface';

/**
 * Data Transfer Object for querying payments with filtering and pagination.
 */
export class QueryPaymentsDto {
    @ApiPropertyOptional({ enum: PaymentStatus, description: 'Filter payments by status' })
    @IsOptional()
    @IsEnum(PaymentStatus)
    status?: PaymentStatus;

    @ApiPropertyOptional({ description: 'Filter payments by project ID' })
    @IsOptional()
    @IsUUID()
    projectId?: string;

    @ApiPropertyOptional({ example: 1, description: 'Page number for pagination' })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page?: number = 1;

    @ApiPropertyOptional({ example: 20, description: 'Number of items per page' })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    limit?: number = 20;
}
