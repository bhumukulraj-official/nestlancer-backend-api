import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CategoryResponseDto } from './category-response.dto';

/**
 * Data Transfer Object for portfolio item response.
 */
export class PortfolioItemResponseDto {
    @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000', description: 'Unique portfolio item ID' })
    id: string;

    @ApiProperty({ example: 'Modern E-commerce Platform', description: 'Project title' })
    title: string;

    @ApiProperty({ example: 'modern-ecommerce-platform', description: 'URL-friendly slug' })
    slug: string;

    @ApiProperty({ example: 'A brief overview of the project', description: 'Short summary' })
    shortDescription: string;

    @ApiProperty({ example: 'Detailed description with markdown...', description: 'Full project content' })
    fullDescription: string;

    @ApiProperty({ example: 'MARKDOWN', description: 'Format of the full description (MARKDOWN, HTML)' })
    contentFormat: string;

    @ApiPropertyOptional({ type: () => CategoryResponseDto, description: 'Associated category' })
    category?: CategoryResponseDto;

    @ApiProperty({ example: ['React', 'NestJS'], description: 'List of tags' })
    tags: string[];

    @ApiPropertyOptional({ example: '123e4567-e89b-12d3-a456-426614174001', description: 'Media ID for thumbnail' })
    thumbnailId?: string;

    @ApiPropertyOptional({ example: 'https://cdn.example.com/image.jpg', description: 'Resolved thumbnail URL' })
    thumbnailUrl?: string;

    @ApiProperty({ example: ['123', '456'], description: 'List of additional image IDs' })
    imageIds: string[];

    @ApiPropertyOptional({ example: 'https://youtube.com/watch?v=...', description: 'URL to video content' })
    videoUrl?: string;

    @ApiPropertyOptional({ description: 'Client information' })
    client?: any;

    @ApiPropertyOptional({ description: 'Technical project details' })
    projectDetails?: any;

    @ApiPropertyOptional({ description: 'External links' })
    links?: any;

    @ApiPropertyOptional({ description: 'SEO metadata' })
    seo?: any;

    @ApiProperty({ example: 'PUBLISHED', description: 'Visibility status' })
    status: string;

    @ApiProperty({ example: true, description: 'Whether highlighted on profile' })
    featured: boolean;

    @ApiProperty({ example: 1, description: 'Display order' })
    order: number;

    @ApiProperty({ example: 124, description: 'Total likes' })
    likeCount: number;

    @ApiProperty({ example: 5000, description: 'Total views' })
    viewCount: number;

    @ApiPropertyOptional({ example: '2024-03-08T12:00:00Z', description: 'Timestamp when published' })
    publishedAt?: Date;

    @ApiProperty({ example: '2024-03-08T12:00:00Z', description: 'Timestamp of creation' })
    createdAt: Date;

    @ApiProperty({ example: '2024-03-08T12:00:00Z', description: 'Timestamp of last update' })
    updatedAt: Date;
}
