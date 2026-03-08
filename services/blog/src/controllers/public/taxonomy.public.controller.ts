import { Controller, Get, Param, Query } from '@nestjs/common';
import { Public } from '@nestlancer/common';
import { Cacheable } from '@nestlancer/cache';
import { CategoriesService, TagsService, AuthorsService } from '../../services/taxonomy.service';

@Controller('categories')
export class BlogCategoriesPublicController {
    constructor(private readonly categoriesService: CategoriesService) { }

    @Public()
    @Get()
    @Cacheable({ ttl: 3600 })
    findAll() {
        return this.categoriesService.findAll();
    }

    @Public()
    @Get(':slug')
    @Cacheable({ ttl: 300 })
    getBySlug(@Param('slug') slug: string) {
        // TODO: Implement category detail
        return { slug, name: slug, description: '', postCount: 0 };
    }

    @Public()
    @Get(':slug/posts')
    @Cacheable({ ttl: 300 })
    getPostsByCategory(@Param('slug') slug: string, @Query('page') page: string = '1', @Query('limit') limit: string = '20') {
        // TODO: Filter posts by category
        return { data: [], pagination: { page: parseInt(page, 10), limit: parseInt(limit, 10), total: 0, totalPages: 0 } };
    }
}

@Controller('tags')
export class BlogTagsPublicController {
    constructor(private readonly tagsService: TagsService) { }

    @Public()
    @Get()
    @Cacheable({ ttl: 3600 })
    findAll() {
        return this.tagsService.findAll();
    }

    @Public()
    @Get(':slug')
    @Cacheable({ ttl: 300 })
    getBySlug(@Param('slug') slug: string) {
        // TODO: Implement tag detail
        return { slug, name: slug, postCount: 0 };
    }

    @Public()
    @Get(':slug/posts')
    @Cacheable({ ttl: 300 })
    getPostsByTag(@Param('slug') slug: string, @Query('page') page: string = '1', @Query('limit') limit: string = '20') {
        // TODO: Filter posts by tag
        return { data: [], pagination: { page: parseInt(page, 10), limit: parseInt(limit, 10), total: 0, totalPages: 0 } };
    }
}

@Controller('authors')
export class AuthorsPublicController {
    constructor(private readonly authorsService: AuthorsService) { }

    @Public()
    @Get()
    @Cacheable({ ttl: 3600 })
    findAll() {
        return this.authorsService.findAll();
    }

    @Public()
    @Get(':id')
    async getAuthorById(@Param('id') id: string) {
        return { status: 'success', data: { id, posts: [] } };
    }
}

