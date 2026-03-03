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

    async create(dto: CreatePostDto) {
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

    @ReadOnly()
    async findPublished(query: QueryPostsDto) {
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

    @ReadOnly()
    async findBySlug(slug: string) {
        const post = await this.prismaRead.blogPost.findUnique({
            where: { slug },
            include: { category: true, tags: true },
        });
        if (!post) throw new NotFoundException('Post not found');
        return post;
    }
}
