import { IsString, IsOptional, IsUUID, MinLength } from 'class-validator';

export class SearchPortfolioDto {
    @IsString()
    @MinLength(2)
    q: string;

    @IsOptional()
    @IsUUID('4')
    categoryId?: string;
}
