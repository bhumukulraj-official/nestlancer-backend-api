import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  MaxLength,
  IsOptional,
  Matches,
  IsEnum,
  IsUUID,
  IsArray,
  ValidateNested,
  IsBoolean,
  IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';

/**
 * Supported formats for blog post content.
 */
export enum ContentFormat {
  /** Standard Markdown text */
  MARKDOWN = 'MARKDOWN',
  /** Rich-text HTML content */
  HTML = 'HTML',
}

/**
 * Data needed to associate a post with a structured series.
 */
export class SeriesDto {
  @ApiProperty({
    example: 'NestJS Masterclass',
    description: 'The display name of the blog series',
  })
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: 1, description: 'Position order of the post within the series' })
  @IsOptional()
  @IsNumber()
  order?: number;
}

/**
 * Data Transfer Object for creating a new blog post entry.
 */
export class CreatePostDto {
  @ApiProperty({
    example: 'Building Scalable Microservices',
    description: 'The primary title of the blog post. Used for SEO and display.',
  })
  @IsString()
  @MaxLength(200)
  title: string;

  @ApiPropertyOptional({
    example: 'building-scalable-microservices',
    description: 'URL-friendly slug. If not provided, it will be auto-generated from the title.',
  })
  @IsOptional()
  @IsString()
  @Matches(/^[a-z0-9-]+$/)
  slug?: string;

  @ApiProperty({
    example: 'A deep dive into microservices architecture...',
    description: 'A concise summary of the post content designed for search results and previews.',
  })
  @IsString()
  @MaxLength(500)
  excerpt: string;

  @ApiProperty({
    example: '# My Post Content...',
    description: 'The full substantive body text of the blog post.',
  })
  @IsString()
  @MaxLength(100000)
  content: string;

  @ApiProperty({
    enum: ContentFormat,
    example: ContentFormat.MARKDOWN,
    description: 'The syntax format used for the content body',
  })
  @IsEnum(ContentFormat)
  contentFormat: ContentFormat;

  @ApiPropertyOptional({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'The unique identifier of the uploaded featured media asset',
  })
  @IsOptional()
  @IsUUID()
  featuredImageId?: string;

  @ApiPropertyOptional({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'The unique identifier of the primary category for this post',
  })
  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @ApiPropertyOptional({
    example: ['typescript', 'node'],
    description: 'A collection of tags for granular content discoverability',
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description:
      'The unique identifier of the author. Defaults to the current user if not specified.',
  })
  @IsOptional()
  @IsUUID()
  authorId?: string;

  @ApiPropertyOptional({
    description: 'Custom SEO metadata including meta-titles, keywords, and description.',
  })
  @IsOptional()
  seo?: any;

  @ApiPropertyOptional({
    type: () => SeriesDto,
    description: 'Optional configuration for grouping this post into a series.',
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => SeriesDto)
  series?: SeriesDto;

  @ApiPropertyOptional({
    example: true,
    description: 'Flag to determine if user comments are permitted on this specific post',
  })
  @IsOptional()
  @IsBoolean()
  commentsEnabled?: boolean;
}
