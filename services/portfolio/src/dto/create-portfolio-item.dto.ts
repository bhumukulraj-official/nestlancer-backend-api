import { IsString, MaxLength, IsOptional, Matches, IsEnum, IsUUID, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export enum ContentFormat {
    MARKDOWN = 'MARKDOWN',
    HTML = 'HTML',
}

export class ClientDto {
    @IsString()
    @MaxLength(100)
    name: string;

    @IsOptional()
    @IsUUID()
    logoId?: string;
}

export class ProjectDetailsDto {
    @IsOptional()
    @IsString()
    @MaxLength(100)
    duration?: string;

    @IsOptional()
    @IsString()
    completedAt?: string;

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    technologies?: string[];
}

export class LinksDto {
    @IsOptional()
    @IsString()
    live?: string;

    @IsOptional()
    @IsString()
    github?: string;
}

export class SeoDto {
    @IsOptional()
    @IsString()
    @MaxLength(100)
    metaTitle?: string;

    @IsOptional()
    @IsString()
    @MaxLength(200)
    metaDescription?: string;

    @IsOptional()
    @IsUUID()
    ogImageId?: string;
}

export class CreatePortfolioItemDto {
    @IsString()
    @MaxLength(200)
    title: string;

    @IsOptional()
    @IsString()
    @Matches(/^[a-z0-9-]+$/)
    slug?: string;

    @IsString()
    @MaxLength(500)
    shortDescription: string;

    @IsString()
    @MaxLength(50000)
    fullDescription: string;

    @IsEnum(ContentFormat)
    contentFormat: ContentFormat;

    @IsOptional()
    @IsUUID()
    categoryId?: string;

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    tags?: string[];

    @IsOptional()
    @IsUUID()
    thumbnailId?: string;

    @IsOptional()
    @IsArray()
    @IsUUID(undefined, { each: true })
    imageIds?: string[];

    @IsOptional()
    @IsString()
    videoId?: string;

    @IsOptional()
    @ValidateNested()
    @Type(() => ClientDto)
    client?: ClientDto;

    @IsOptional()
    @ValidateNested()
    @Type(() => ProjectDetailsDto)
    projectDetails?: ProjectDetailsDto;

    @IsOptional()
    @ValidateNested()
    @Type(() => LinksDto)
    links?: LinksDto;

    @IsOptional()
    @ValidateNested()
    @Type(() => SeoDto)
    seo?: SeoDto;
}
