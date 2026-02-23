import { IsString, IsOptional, MaxLength, IsNumber, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ProcessRefundDto {
    @ApiPropertyOptional()
    @IsOptional()
    @IsNumber()
    @Min(1)
    amount?: number; // Optional partial refund amount

    @ApiPropertyOptional({ maxLength: 500 })
    @IsOptional()
    @IsString()
    @MaxLength(500)
    reason?: string;
}
