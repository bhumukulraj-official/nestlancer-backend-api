import { IsOptional, IsString, IsUUID, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { PaginationQueryDto } from '@nestlancer/common';

export class QueryPortfolioDto extends PaginationQueryDto {
    @IsOptional()
    @IsUUID('4')
    categoryId?: string;

    @IsOptional()
    @IsString()
    tag?: string;

    @IsOptional()
    @IsBoolean()
    @Type(() => Boolean)
    featured?: boolean;
}
