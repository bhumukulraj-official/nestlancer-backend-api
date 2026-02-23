import { IsOptional, IsUUID, IsInt, Min, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class QueryMessagesDto {
    @ApiPropertyOptional()
    @IsOptional()
    @IsUUID()
    projectId?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsUUID()
    replyToId?: string; // To fetch threads

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    search?: string;

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
    limit?: number = 50;
}
