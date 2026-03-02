import { IsEnum, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { FileType, MediaStatus } from '../interfaces/media.interface';
import { PaginationQueryDto } from '@nestlancer/common';

export class QueryMediaDto extends PaginationQueryDto {
    @IsOptional()
    @IsEnum(FileType)
    fileType?: FileType;

    @IsOptional()
    @IsEnum(MediaStatus)
    status?: MediaStatus;
}
