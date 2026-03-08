import { IsString, MaxLength, IsOptional, Matches, IsEnum, IsUUID, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Format options for the portfolio item content.
 */
export enum ContentFormat {
    MARKDOWN = 'MARKDOWN',
    HTML = 'HTML',
}

/**
 * Details about the client for the portfolio project.
 */
export class ClientDto {
    @ApiProperty({ example: 'Acme Corp', description: 'Name of the client' })
    @IsString()
    @MaxLength(100)
    name: string;

    @ApiPropertyOptional({ example: '123e4567-e89b-12d3-a456-426614174001', description: 'Media ID for the client logo' })
    @IsOptional()
    @IsUUID()
    logoId?: string;
}

/**
 * Technical details regarding the project implementation.
 */
export class ProjectDetailsDto {
    @ApiPropertyOptional({ example: '3 months', description: 'Duration of the project' })
    @IsOptional()
    @IsString()
    @MaxLength(100)
    duration?: string;

    @ApiPropertyOptional({ example: '2023-12-01', description: 'Completion date (human-readable or ISO)' })
    @IsOptional()
    @IsString()
    完成At?: string;

    @ApiPropertyOptional({ example: ['React', 'Node.js'], description: 'Technologies used in the project' })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    technologies?: string[];
}

/**
 * External links associated with the portfolio item.
 */
export class LinksDto {
    @ApiPropertyOptional({ example: 'https://acme.com', description: 'Live project URL' })
    @IsOptional()
    @IsString()
    live?: string;

    @ApiPropertyOptional({ example: 'https://github.com/acme/project', description: 'Source code repository URL' })
    @IsOptional()
    @IsString()
    github?: string;
}

/**
 * SEO metadata for the portfolio item page.
 */
export class SeoDto {
    @ApiPropertyOptional({ example: 'Portfolio | Acme Project', description: 'Meta title tag' })
    @IsOptional()
    @IsString()
    @MaxLength(100)
    metaTitle?: string;

    @ApiPropertyOptional({ example: 'Detailed view of the Acme project...', description: 'Meta description tag' })
    @IsOptional()
    @IsString()
    @MaxLength(200)
    metaDescription?: string;

    @ApiPropertyOptional({ example: '123e4567-e89b-12d3-a456-426614174002', description: 'Media ID for Open Graph image' })
    @IsOptional()
    @IsUUID()
    ogImageId?: string;
}

/**
 * Data Transfer Object for creating a new portfolio item.
 */
export class CreatePortfolioItemDto {
    @ApiProperty({ example: 'Modern E-commerce Platform', description: 'The title of the portfolio item' })
    @IsString()
    @MaxLength(200)
    title: string;

    @ApiPropertyOptional({ example: 'modern-ecommerce-platform', description: 'URL-friendly slug (auto-generated if not provided)' })
    @IsOptional()
    @IsString()
    @Matches(/^[a-z0-9-]+$/)
    slug?: string;

    @ApiProperty({ example: 'A brief overview of the project', description: 'A short summary for list views' })
    @IsString()
    @MaxLength(500)
    shortDescription: string;

    @ApiProperty({ example: 'Detailed description with markdown...', description: 'Full project details' })
    @IsString()
    @MaxLength(50000)
    fullDescription: string;

    @ApiProperty({ enum: ContentFormat, example: ContentFormat.MARKDOWN, description: 'The format of the full description' })
    @IsEnum(ContentFormat)
    contentFormat: ContentFormat;

    @ApiPropertyOptional({ example: '123e4567-e89b-12d3-a456-426614174003', description: 'Category ID' })
    @IsOptional()
    @IsUUID()
    categoryId?: string;

    @ApiPropertyOptional({ example: ['React', 'NestJS'], description: 'List of tags' })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    tags?: string[];

    @ApiPropertyOptional({ example: '123e4567-e89b-12d3-a456-426614174004', description: 'Main thumbnail image ID' })
    @IsOptional()
    @IsUUID()
    thumbnailId?: string;

    @ApiPropertyOptional({ example: ['123', '456'], description: 'Additional gallery image IDs' })
    @IsOptional()
    @IsArray()
    @IsUUID(undefined, { each: true })
    imageIds?: string[];

    @ApiPropertyOptional({ example: '123e4567-e89b-12d3-a456-426614174005', description: 'Video media ID' })
    @IsOptional()
    @IsString()
    videoId?: string;

    @ApiPropertyOptional({ type: () => ClientDto, description: 'Client details' })
    @IsOptional()
    @ValidateNested()
    @Type(() => ClientDto)
    client?: ClientDto;

    @ApiPropertyOptional({ type: () => ProjectDetailsDto, description: 'Technical project details' })
    @IsOptional()
    @ValidateNested()
    @Type(() => ProjectDetailsDto)
    projectDetails?: ProjectDetailsDto;

    @ApiPropertyOptional({ type: () => LinksDto, description: 'External links' })
    @IsOptional()
    @ValidateNested()
    @Type(() => LinksDto)
    links?: LinksDto;

    @ApiPropertyOptional({ type: () => SeoDto, description: 'SEO metadata' })
    @IsOptional()
    @ValidateNested()
    @Type(() => SeoDto)
    seo?: SeoDto;
}
