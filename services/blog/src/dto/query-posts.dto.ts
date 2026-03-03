import { IsOptional, IsString, IsUUID } from 'class-validator';
import { PaginationQueryDto } from '@nestlancer/common';

export class QueryPostsDto extends PaginationQueryDto {
    @IsOptional()
    @IsUUID()
    categoryId?: string;

    @IsOptional()
    @IsString()
    tag?: string;

    @IsOptional()
    @IsUUID()
    authorId?: string;

    @IsOptional()
    @IsString()
    search?: string;
}
