import { IsOptional, IsEnum, IsUUID, IsInt, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ProgressEntryType } from '../interfaces/progress.interface';

export class QueryProgressDto {
    @ApiPropertyOptional()
    @IsOptional()
    @IsEnum(ProgressEntryType)
    type?: ProgressEntryType;

    @ApiPropertyOptional()
    @IsOptional()
    @IsUUID()
    projectId?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page?: number = 1;

    @ApiPropertyOptional()
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    limit?: number = 20;
}
