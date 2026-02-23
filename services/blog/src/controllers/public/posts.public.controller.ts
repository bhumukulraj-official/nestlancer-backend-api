import { Controller, Get, Param, Query, Req, Res } from '@nestjs/common';
import { Public } from '@nestlancer/auth-lib';
import { Cacheable } from '@nestlancer/cache';
import { PostsService } from '../../services/posts.service';
import { PostSearchService } from '../../services/post-search.service';
import { PostViewsService } from '../../services/post-views.service';
import { QueryPostsDto } from '../../dto/query-posts.dto';
import { SearchPostsDto } from '../../dto/search-posts.dto';
import { Request } from 'express';

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
    @Get(':slug')
    @Cacheable({ ttl: 300 })
    async getDetail(@Param('slug') slug: string, @Req() req: Request) {
        const post = await this.postsService.findBySlug(slug);

        // Track views
        const ip = req.ip || req.headers['x-forwarded-for']?.toString() || 'unknown';
        const ipHash = Buffer.from(ip).toString('base64');
        await this.viewsService.recordView(post.id, ipHash);

        return post;
    }
}
