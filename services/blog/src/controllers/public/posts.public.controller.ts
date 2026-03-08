import { Controller, Get, Post, Param, Query, Req, Res } from '@nestjs/common';
import { Public } from '@nestlancer/common';
import { Cacheable } from '@nestlancer/cache';
import { PostsService } from '../../services/posts.service';
import { PostSearchService } from '../../services/post-search.service';
import { PostViewsService } from '../../services/post-views.service';
import { QueryPostsDto } from '../../dto/query-posts.dto';
import { SearchPostsDto } from '../../dto/search-posts.dto';

@Controller()
export class PostsPublicController {
    constructor(
        private readonly postsService: PostsService,
        private readonly searchService: PostSearchService,
        private readonly viewsService: PostViewsService,
    ) { }

    @Public()
    @Get()
    @Cacheable({ ttl: 300 })
    list(@Query() query: QueryPostsDto) {
        return this.postsService.findPublished(query);
    }

    @Public()
    @Get('search')
    search(@Query() query: SearchPostsDto) {
        return this.searchService.search(query);
    }

    @Public()
    @Get('health')
    health() {
        return { status: 'ok', service: 'blog' };
    }

    @Public()
    @Get(':slug')
    @Cacheable({ ttl: 300 })
    async getDetail(@Param('slug') slug: string, @Req() req: any) {
        const post = await this.postsService.findBySlug(slug);

        // Track views
        const ip = req.ip || req.headers['x-forwarded-for']?.toString() || 'unknown';
        const ipHash = Buffer.from(ip).toString('base64');
        await this.viewsService.recordView(post.id, ipHash);

        return post;
    }

    @Public()
    @Get(':slug/related')
    async getRelated(@Param('slug') slug: string) {
        return { data: [] };
    }

    @Public()
    @Post(':slug/view')
    async recordViewExplicit(@Param('slug') slug: string, @Req() req: any) {
        const ip = req.ip || req.headers['x-forwarded-for']?.toString() || 'unknown';
        const ipHash = Buffer.from(ip).toString('base64');
        const post = await this.postsService.findBySlug(slug);
        if (post) {
            await this.viewsService.recordView(post.id, ipHash);
        }
        return { success: true };
    }

    @Public()
    @Get(':slug/comments')
    @Cacheable({ ttl: 60 })
    getPostComments(@Param('slug') slug: string, @Query('page') page: string = '1', @Query('limit') limit: string = '20') {
        // TODO: Implement public comment listing
        return { data: [], pagination: { page: parseInt(page, 10), limit: parseInt(limit, 10), total: 0, totalPages: 0 } };
    }
}
