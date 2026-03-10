import { ContentFormat } from '../dto/create-post.dto';

export enum BlogStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED',
}

export class Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  contentFormat: ContentFormat;
  featuredImageId?: string;
  categoryId?: string;
  authorId?: string;
  seo?: any;
  series?: any;
  readingTime: number;
  likeCount: number;
  commentCount: number;
  viewCount: number;
  commentsEnabled: boolean;
  status: BlogStatus;
  publishedAt?: Date;
  scheduledAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
