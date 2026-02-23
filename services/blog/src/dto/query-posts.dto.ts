import { IsOptional, IsString, IsUUID } from 'class-validator';
import { PaginationQueryDto } from '@nestlancer/common';

export class QueryPostsDto extends PaginationQueryDto {
    @IsOptional()
    @IsUUID('4')
    categoryId?: string;

    @IsOptional()
    @IsString()
    tag?: string;

    @IsOptional()
    @IsUUID('4')
    authorId?: string;

    @IsOptional()
    @IsString()
    search?: string;
}
