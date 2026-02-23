import { IsString, MaxLength, IsOptional, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RejectDeliverableDto {
    @ApiProperty({ maxLength: 2000 })
    @IsString()
    @MaxLength(2000)
    reason: string;

    @ApiPropertyOptional({ type: [String] })
    @IsOptional()
    @IsArray()
    requestedChanges?: string[];
}
