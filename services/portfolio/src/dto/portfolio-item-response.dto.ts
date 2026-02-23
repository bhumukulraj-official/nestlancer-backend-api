import { CategoryResponseDto } from './category-response.dto';

export class PortfolioItemResponseDto {
    id: string;
    title: string;
    slug: string;
    shortDescription: string;
    fullDescription: string;
    contentFormat: string;
    category?: CategoryResponseDto;
    tags: string[];
    thumbnailId?: string;
    thumbnailUrl?: string; // from media service ideally, or resolved
    imageIds: string[];
    videoUrl?: string;
    client?: any;
    projectDetails?: any;
    links?: any;
    seo?: any;
    status: string;
    featured: boolean;
    order: number;
    likeCount: number;
    viewCount: number;
    publishedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}
