import { Controller, Get, Param, Query } from '@nestjs/common';
import { Public } from '@nestlancer/common';
import { Cacheable } from '@nestlancer/cache';
import { CategoriesService, TagsService, AuthorsService } from '../../services/taxonomy.service';

import { ApiTags, ApiOperation } from '@nestjs/swagger';

/**
 * Controller for public access to blog categories.
 * Provides endpoints for listing and retrieving specific categories.
 * 
 * @category Blog
 */
@ApiTags('Blog - Public Categories')
@Controller('categories')
export class BlogCategoriesPublicController {
    constructor(private readonly categoriesService: CategoriesService) { }

    /**
     * Retrieves all active blog categories.
     * 
     * @returns A promise resolving to an array of blog category metadata
     */
    @Public()
    @Get()
    @ApiOperation({ summary: 'List categories', description: 'Fetch all available blog categories for navigation and filtering.' })
    @Cacheable({ ttl: 3600 })
    async findAll(): Promise<any> {
        return this.categoriesService.findAll();
    }

    /**
     * Retrieves details for a specific category by its slug.
     * 
     * @param slug The unique URL-friendly identifier of the category
     * @returns A promise resolving to a detailed category object
     */
    @Public()
    @Get(':slug')
    @ApiOperation({ summary: 'Get category detail', description: 'Retrieve metadata and metadata for a specific blog category.' })
    @Cacheable({ ttl: 300 })
    async getBySlug(@Param('slug') slug: string): Promise<any> {
        // TODO: Implement category detail
        return { slug, name: slug, description: '', postCount: 0 };
    }

    /**
     * Retrieves all posts belonging to a specific category.
     * 
     * @param slug The unique URL-friendly identifier of the category
     * @param page Page number for pagination
     * @param limit Number of items per page
     * @returns A promise resolving to a paginated list of blog posts in this category
     */
    @Public()
    @Get(':slug/posts')
    @ApiOperation({ summary: 'Get posts by category', description: 'Fetch a paginated list of published blog posts associated with a specific category.' })
    @Cacheable({ ttl: 300 })
    async getPostsByCategory(@Param('slug') slug: string, @Query('page') page: string = '1', @Query('limit') limit: string = '20'): Promise<any> {
        // TODO: Filter posts by category
        return { data: [], pagination: { page: parseInt(page, 10), limit: parseInt(limit, 10), total: 0, totalPages: 0 } };
    }
}

/**
 * Controller for public access to blog tags.
 * Provides endpoints for listing and retrieving specific tags.
 * 
 * @category Blog
 */
@ApiTags('Blog - Public Tags')
@Controller('tags')
export class BlogTagsPublicController {
    constructor(private readonly tagsService: TagsService) { }

    /**
     * Retrieves all active blog tags.
     * 
     * @returns A promise resolving to an array of blog tag metadata
     */
    @Public()
    @Get()
    @ApiOperation({ summary: 'List tags', description: 'Fetch all available blog tags used for content discovery.' })
    @Cacheable({ ttl: 3600 })
    async findAll(): Promise<any> {
        return this.tagsService.findAll();
    }

    /**
     * Retrieves details for a specific tag by its slug.
     * 
     * @param slug The unique name or slug of the tag
     * @returns A promise resolving to a detailed tag object
     */
    @Public()
    @Get(':slug')
    @ApiOperation({ summary: 'Get tag detail', description: 'Retrieve metadata and metadata for a specific blog tag.' })
    @Cacheable({ ttl: 300 })
    async getBySlug(@Param('slug') slug: string): Promise<any> {
        // TODO: Implement tag detail
        return { slug, name: slug, postCount: 0 };
    }

    /**
     * Retrieves all posts associated with a specific tag.
     * 
     * @param slug The unique name or slug of the tag
     * @param page Page number for pagination
     * @param limit Number of items per page
     * @returns A promise resolving to a paginated list of blog posts with this tag
     */
    @Public()
    @Get(':slug/posts')
    @ApiOperation({ summary: 'Get posts by tag', description: 'Fetch a paginated list of published blog posts that share a specific tag.' })
    @Cacheable({ ttl: 300 })
    async getPostsByTag(@Param('slug') slug: string, @Query('page') page: string = '1', @Query('limit') limit: string = '20'): Promise<any> {
        // TODO: Filter posts by tag
        return { data: [], pagination: { page: parseInt(page, 10), limit: parseInt(limit, 10), total: 0, totalPages: 0 } };
    }
}

/**
 * Controller for public access to blog authors.
 * Provides endpoints for listing and retrieving author information.
 * 
 * @category Blog
 */
@ApiTags('Blog - Public Authors')
@Controller('authors')
export class AuthorsPublicController {
    constructor(private readonly authorsService: AuthorsService) { }

    /**
     * Retrieves a list of all active blog authors.
     * 
     * @returns A promise resolving to an array of blog author metadata
     */
    @Public()
    @Get()
    @ApiOperation({ summary: 'List authors', description: 'Fetch all available blog authors and their basic profile information.' })
    @Cacheable({ ttl: 3600 })
    async findAll(): Promise<any> {
        return this.authorsService.findAll();
    }

    /**
     * Retrieves details for a specific author by their unique ID.
     * 
     * @param id The unique identifier of the author
     * @returns A promise resolving to a detailed author object and their posts
     */
    @Public()
    @Get(':id')
    @ApiOperation({ summary: 'Get author detail', description: 'Retrieve professional metadata and authored posts for a specific user.' })
    async getAuthorById(@Param('id') id: string): Promise<any> {
        return { status: 'success', data: { id, posts: [] } };
    }
}


