import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaWriteService, PrismaReadService, ReadOnly } from '@nestlancer/database';
import { CreatePostDto } from '../dto/create-post.dto';
import { UpdatePostDto } from '../dto/update-post.dto';
import { QueryPostsDto } from '../dto/query-posts.dto';
import { BlogStatus } from '../entities/post.entity';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PostsService {
    constructor(
        private readonly prismaWrite: PrismaWriteService,
        private readonly prismaRead: PrismaReadService,
        private readonly configService: ConfigService,
    ) { }

    /**
     * Creates a new blog post entry in the database.
     * Calculates reading time based on word count and configured WPM.
     * 
     * @param dto Data Transfer Object containing post details
     * @returns A promise resolving to the created blog post record
     */
    async create(dto: CreatePostDto): Promise<any> {
        const slug = dto.slug || Math.random().toString(36).substring(2, 15);
        const readingWpm = this.configService.get<number>('blog.readingWpm', 200);
        const wordCount = dto.content.split(/\s+/).length;
        const readingTime = Math.ceil(wordCount / readingWpm);

        const { categoryId, tags, series, ...rest } = dto;

        return this.prismaWrite.blogPost.create({
            data: {
                ...(rest as any),
                slug,
                categoryId: categoryId as string,
                authorId: rest.authorId as string,
                readingTime,
                status: BlogStatus.DRAFT,
                tags: tags ? {
                    connectOrCreate: tags.map(tag => ({
                        where: { name: tag.toLowerCase() },
                        create: { name: tag.toLowerCase(), slug: tag.toLowerCase() }
                    }))
                } : undefined,
            },
        });
    }

    /**
     * Retrieves a paginated list of published blog posts based on filter criteria.
     * 
     * @param query Filtering and pagination parameters
     * @returns A promise resolving to a paginated set of blog posts
     */
    @ReadOnly()
    async findPublished(query: QueryPostsDto): Promise<any> {
        const { page = 1, limit = 10, categoryId, tag, authorId, search } = query;
        const skip = (page - 1) * limit;

        const where: any = { status: BlogStatus.PUBLISHED };
        if (categoryId) where.categoryId = categoryId;
        if (authorId) where.authorId = authorId;
        if (tag) where.tags = { some: { name: tag.toLowerCase() } };
        if (search) {
            where.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { content: { contains: search, mode: 'insensitive' } },
            ];
        }

        const [items, totalItems] = await Promise.all([
            this.prismaRead.blogPost.findMany({
                where,
                skip,
                take: Number(limit),
                orderBy: { publishedAt: 'desc' },
                include: { category: true, tags: true },
            }),
            this.prismaRead.blogPost.count({ where }),
        ]);

        return {
            items,
            totalItems,
            page: Number(page),
            limit: Number(limit),
            totalPages: Math.ceil(totalItems / limit),
        };
    }

    /**
     * Retrieves a single blog post by its unique slug.
     * 
     * @param slug The unique URL-friendly identifier of the post
     * @throws NotFoundException if the post does not exist
     * @returns A promise resolving to the found blog post
     */
    @ReadOnly()
    async findBySlug(slug: string): Promise<any> {
        const post = await this.prismaRead.blogPost.findUnique({
            where: { slug },
            include: { category: true, tags: true },
        });
        if (!post) throw new NotFoundException('Post not found');
        return post;
    }
}

