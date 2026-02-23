import { IsString, MaxLength, IsOptional, IsDateString, IsArray, IsInt } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateMilestoneDto {
    @ApiProperty({ maxLength: 200 })
    @IsString()
    @MaxLength(200)
    name: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    description?: string;

    @ApiProperty()
    @IsDateString()
    startDate: string;

    @ApiProperty()
    @IsDateString()
    endDate: string;

    @ApiPropertyOptional({ type: [String] })
    @IsOptional()
    @IsArray()
    deliverables?: string[];

    @ApiPropertyOptional()
    @IsOptional()
    @IsInt()
    order?: number;
}
