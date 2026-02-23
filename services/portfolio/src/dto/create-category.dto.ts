import { IsString, MaxLength, IsOptional, Matches, IsInt } from 'class-validator';

export class CreateCategoryDto {
    @IsString()
    @MaxLength(100)
    name: string;

    @IsOptional()
    @IsString()
    @Matches(/^[a-z0-9-]+$/)
    slug?: string;

    @IsOptional()
    @IsString()
    @MaxLength(500)
    description?: string;

    @IsOptional()
    @IsInt()
    order?: number;
}
