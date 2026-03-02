import { IsString, MaxLength, IsOptional, IsUUID } from 'class-validator';

export class CreateCategoryDto {
    @IsString()
    @MaxLength(100)
    name: string;

    @IsOptional()
    @IsString()
    slug?: string;

    @IsOptional()
    @IsString()
    description?: string;
}

import { PartialType } from '@nestjs/mapped-types';

export class UpdateCategoryDto extends PartialType(CreateCategoryDto) { }

export class CreateTagDto {
    @IsString()
    @MaxLength(50)
    name: string;
}

export class UpdateTagDto {
    @IsString()
    @MaxLength(50)
    name: string;
}


export class MergeTagsDto {
    @IsUUID('4')
    fromTagId: string;

    @IsUUID('4')
    toTagId: string;
}
