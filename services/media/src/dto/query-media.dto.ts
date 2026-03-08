import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { FileType, MediaStatus } from '../interfaces/media.interface';
import { PaginationQueryDto } from '@nestlancer/common';

/**
 * Data Transfer Object for querying and filtering user media.
 */
export class QueryMediaDto extends PaginationQueryDto {
    @ApiPropertyOptional({ enum: FileType, description: 'Filter by file category' })
    @IsOptional()
    @IsEnum(FileType)
    fileType?: FileType;

    @ApiPropertyOptional({ enum: MediaStatus, description: 'Filter by processing status' })
    @IsOptional()
    @IsEnum(MediaStatus)
    status?: MediaStatus;
}
