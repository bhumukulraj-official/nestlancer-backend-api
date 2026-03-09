import { Controller, Get, Post, Param, Query, Req, Res } from '@nestjs/common';
import { Public } from '@nestlancer/common';
import { Cacheable } from '@nestlancer/cache';
import { PostsService } from '../../services/posts.service';
import { PostSearchService } from '../../services/post-search.service';
import { PostViewsService } from '../../services/post-views.service';
import { PrismaReadService } from '@nestlancer/database';
import { QueryPostsDto } from '../../dto/query-posts.dto';
import { SearchPostsDto } from '../../dto/search-posts.dto';

import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';

/**
 * Controller for public access to blog posts.
 * Provides endpoints for listing, searching, and viewing published blog content.
 * 
 * @category Blog
 */
@ApiTags('Blog - Public Posts')
@Controller('posts')
export class PostsPublicController {
    constructor(
        private readonly postsService: PostsService,
        private readonly searchService: PostSearchService,
        private readonly viewsService: PostViewsService,
        private readonly prismaRead: PrismaReadService,
    ) { }

    /**
     * Retrieves a paginated list of published blog posts based on filter criteria.
     * 
     * @param query Filtering and pagination parameters including category, tag, and author
     * @returns A promise resolving to a paginated set of blog posts
     */
    @Public()
    @Get()
    @ApiOperation({ summary: 'List published posts', description: 'Retrieve a paginated list of blog posts that are currently published and visible to the public.' })
    @Cacheable({ ttl: 300 })
    async list(@Query() query: QueryPostsDto): Promise<any> {
        return this.postsService.findPublished(query);
    }

    /**
     * Performs a full-text search across all published blog posts.
     * 
     * @param query Search parameters including the query string
     * @returns A promise resolving to matching blog post results
     */
    @Public()
    @Get('search')
    @ApiOperation({ summary: 'Search blog posts', description: 'Perform a full-text search across published blog posts titles and content.' })
    async search(@Query() query: SearchPostsDto): Promise<any> {
        return this.searchService.search(query);
    }

    /**
     * Verifies the connectivity and operational status of the blog microservice.
     * 
     * @returns A promise resolving to the technical health state
     */
    @Public()
    @Get('health')
    @ApiOperation({ summary: 'Service health check', description: 'Verify that the blog microservice is online and operational.' })
    async health(): Promise<any> {
        return { status: 'ok', service: 'blog' };
    }

    /**
     * Retrieves comprehensive metadata and content for a specific blog post by slug.
     * Includes automated view tracking for the request context.
     * 
     * @param slug The unique URL-friendly slug identifier of the post
     * @param req The incoming request for IP-based view attribution
     * @returns A promise resolving to the full post object
     */
    @Public()
    @Get(':slug')
    @ApiOperation({ summary: 'Get post detail', description: 'Fetch the full content, author info, and metadata of a specific blog post.' })
    @Cacheable({ ttl: 300 })
    async getDetail(@Param('slug') slug: string, @Req() req: any): Promise<any> {
        const post = await this.postsService.findBySlug(slug);

        // Track views
        const ip = req.ip || req.headers['x-forwarded-for']?.toString() || 'unknown';
        const ipHash = Buffer.from(ip).toString('base64');
        await this.viewsService.recordView(post.id, ipHash);

        return post;
    }

    /**
     * Retrieves a collection of blog posts related to the reference post.
     * 
     * @param slug The slug of the source post for finding relations
     * @returns A promise resolving to a list of related content suggestions
     */
    @Public()
    @Get(':slug/related')
    @ApiOperation({ summary: 'Get related posts', description: 'Retrieve a collection of blog posts that are semantically or taxonomically similar to the given post.' })
    async getRelated(@Param('slug') slug: string, @Query('limit') limit?: string): Promise<any> {
        const post = await this.prismaRead.blogPost.findUnique({
            where: { slug, status: 'PUBLISHED' },
            select: { id: true, categoryId: true, tags: { select: { id: true } } },
        });
        if (!post) return { data: [] };
        const take = Math.min(10, Math.max(1, parseInt(limit || '5', 10)));
        const tagIds = post.tags?.map((t: any) => t.id) ?? [];
        const related = await this.prismaRead.blogPost.findMany({
            where: {
                id: { not: post.id },
                status: 'PUBLISHED',
                publishedAt: { not: null },
                OR: [
                    { categoryId: post.categoryId },
                    ...(tagIds.length > 0 ? [{ tags: { some: { id: { in: tagIds } } } }] : []),
                ],
            },
            orderBy: { publishedAt: 'desc' },
            take,
            select: { id: true, title: true, slug: true, excerpt: true, publishedAt: true, featuredImageId: true },
        });
        return { data: related };
    }

    /**
     * Manually triggers a view increment event for a specific blog post.
     * 
     * @param slug The unique slug of the post viewed
     * @param req The incoming request for IP-based view attribution
     * @returns A promise resolving to a success indicator
     */
    @Public()
    @Post(':slug/view')
    @ApiOperation({ summary: 'Record post view', description: 'Explicitly record a reader view event for a specific blog post.' })
    async recordViewExplicit(@Param('slug') slug: string, @Req() req: any): Promise<any> {
        const ip = req.ip || req.headers['x-forwarded-for']?.toString() || 'unknown';
        const ipHash = Buffer.from(ip).toString('base64');
        const post = await this.postsService.findBySlug(slug);
        if (post) {
            await this.viewsService.recordView(post.id, ipHash);
        }
        return { success: true };
    }

    /**
     * Retrieves the public comment thread for a specific blog post with pagination.
     * 
     * @param slug The post identifier
     * @param page Target page number
     * @param limit Number of items per result set
     * @returns A promise resolving to the public comment thread
     */
    @Public()
    @Get(':slug/comments')
    @ApiOperation({ summary: 'Get post comments', description: 'Retrieve the public, approved comment thread for a specific blog post.' })
    @Cacheable({ ttl: 60 })
    async getPostComments(@Param('slug') slug: string, @Query('page') page: string = '1', @Query('limit') limit: string = '20'): Promise<any> {
        const pageNum = parseInt(page, 10);
        const limitNum = parseInt(limit, 10);
        const skip = (pageNum - 1) * limitNum;

        const post = await this.prismaRead.blogPost.findUnique({ where: { slug }, select: { id: true } });
        if (!post) {
            return { data: [], pagination: { page: pageNum, limit: limitNum, total: 0, totalPages: 0 } };
        }

        const [comments, total] = await Promise.all([
            this.prismaRead.blogComment.findMany({
                where: { postId: post.id, status: 'APPROVED' },
                skip,
                take: limitNum,
                orderBy: { createdAt: 'desc' },
                include: { author: { select: { id: true, firstName: true, lastName: true, avatar: true } } }
            }),
            this.prismaRead.blogComment.count({ where: { postId: post.id, status: 'APPROVED' } })
        ]);

        return {
            data: comments,
            pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) }
        };
    }
}

