import { ContentFormat } from '../dto/create-portfolio-item.dto';

export enum PortfolioStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED',
}

export class PortfolioItem {
  id: string;
  title: string;
  slug: string;
  shortDescription: string;
  fullDescription: string;
  contentFormat: ContentFormat;
  categoryId?: string;
  thumbnailId?: string;
  videoUrl?: string;
  client?: any;
  projectDetails?: any;
  links?: any;
  seo?: any;
  status: PortfolioStatus;
  featured: boolean;
  order: number;
  likeCount: number;
  viewCount: number;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
