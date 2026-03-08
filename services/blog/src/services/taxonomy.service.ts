import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaReadService, PrismaWriteService } from '@nestlancer/database';

interface CategoryResponse {
    id: string;
    name: string;
    slug: string;
    description?: string;
    postCount: number;
    createdAt: Date;
}

interface TagResponse {
    id: string;
    name: string;
    slug: string;
    postCount: number;
    createdAt: Date;
}

interface AuthorResponse {
    id: string;
    name: string;
    email: string;
    postCount: number;
}

@Injectable()
export class CategoriesService {
    constructor(
        private readonly prismaRead: PrismaReadService,
        private readonly prismaWrite: PrismaWriteService,
    ) { }

    /**
     * Retrieves all available blog categories with their post counts.
     * 
     * @returns A promise resolving to a list of categories
     */
    async findAll(): Promise<CategoryResponse[]> {
        const categories = await this.prismaRead.blogCategory.findMany({
            include: {
                _count: {
                    select: { posts: true }
                }
            },
            orderBy: { name: 'asc' }
        });

        return categories.map(cat => ({
            id: cat.id,
            name: cat.name,
            slug: cat.slug,
            description: cat.description || undefined,
            postCount: cat._count.posts,
            createdAt: cat.createdAt,
        }));
    }

    /**
     * Retrieves detailed information for a single category by its slug.
     * 
     * @param slug The unique URL-friendly identifier of the category
     * @throws NotFoundException if the category does not exist
     * @returns A promise resolving to the category details
     */
    async findBySlug(slug: string): Promise<CategoryResponse> {
        const category = await this.prismaRead.blogCategory.findUnique({
            where: { slug },
            include: {
                _count: {
                    select: { posts: true }
                }
            }
        });

        if (!category) {
            throw new NotFoundException(`Category with slug "${slug}" not found`);
        }

        return {
            id: category.id,
            name: category.name,
            slug: category.slug,
            description: category.description || undefined,
            postCount: category._count.posts,
            createdAt: category.createdAt,
        };
    }

    /**
     * Creates a new blog category.
     * 
     * @param data Initial category data
     * @returns A promise resolving to the created category
     */
    async create(data: { name: string; slug: string; description?: string }): Promise<CategoryResponse> {
        const category = await this.prismaWrite.blogCategory.create({
            data: {
                name: data.name,
                slug: data.slug,
                description: data.description,
            },
            include: {
                _count: {
                    select: { posts: true }
                }
            }
        });

        return {
            id: category.id,
            name: category.name,
            slug: category.slug,
            description: category.description || undefined,
            postCount: category._count.posts,
            createdAt: category.createdAt,
        };
    }
}

/**
 * Service for managing taxonomical tags used in blog content.
 */
@Injectable()
export class TagsService {
    constructor(
        private readonly prismaRead: PrismaReadService,
        private readonly prismaWrite: PrismaWriteService,
    ) { }

    /**
     * Retrieves all blog tags sorted alphabetically.
     * 
     * @returns A promise resolving to a list of tags
     */
    async findAll(): Promise<TagResponse[]> {
        const tags = await this.prismaRead.blogTag.findMany({
            include: {
                _count: {
                    select: { posts: true }
                }
            },
            orderBy: { name: 'asc' }
        });

        return tags.map(tag => ({
            id: tag.id,
            name: tag.name,
            slug: tag.slug,
            postCount: tag._count.posts,
            createdAt: tag.createdAt,
        }));
    }

    /**
     * Retrieves metadata for a specific tag by its slug.
     * 
     * @param slug The unique identifier of the tag
     * @throws NotFoundException if the tag does not exist
     * @returns A promise resolving to the tag metadata
     */
    async findBySlug(slug: string): Promise<TagResponse> {
        const tag = await this.prismaRead.blogTag.findUnique({
            where: { slug },
            include: {
                _count: {
                    select: { posts: true }
                }
            }
        });

        if (!tag) {
            throw new NotFoundException(`Tag with slug "${slug}" not found`);
        }

        return {
            id: tag.id,
            name: tag.name,
            slug: tag.slug,
            postCount: tag._count.posts,
            createdAt: tag.createdAt,
        };
    }

    /**
     * Retrieves the most frequently used tags.
     * 
     * @param limit Maximum number of tags to return
     * @returns A promise resolving to the most popular tags
     */
    async findPopular(limit: number = 10): Promise<TagResponse[]> {
        const tags = await this.prismaRead.blogTag.findMany({
            include: {
                _count: {
                    select: { posts: true }
                }
            },
            orderBy: {
                posts: {
                    _count: 'desc'
                }
            },
            take: limit,
        });

        return tags.map(tag => ({
            id: tag.id,
            name: tag.name,
            slug: tag.slug,
            postCount: tag._count.posts,
            createdAt: tag.createdAt,
        }));
    }

    /**
     * Creates a new metadata tag.
     * 
     * @param data Initial tag data
     * @returns A promise resolving to the created tag
     */
    async create(data: { name: string; slug: string }): Promise<TagResponse> {
        const tag = await this.prismaWrite.blogTag.create({
            data: {
                name: data.name,
                slug: data.slug,
            },
            include: {
                _count: {
                    select: { posts: true }
                }
            }
        });

        return {
            id: tag.id,
            name: tag.name,
            slug: tag.slug,
            postCount: tag._count.posts,
            createdAt: tag.createdAt,
        };
    }
}

/**
 * Service for retrieving public profiles and contributions of blog authors.
 */
@Injectable()
export class AuthorsService {
    constructor(private readonly prismaRead: PrismaReadService) { }

    /**
     * Retrieves a list of active blog authors with their associated post counts.
     * 
     * @returns A promise resolving to the list of authors
     */
    async findAll(): Promise<AuthorResponse[]> {
        const authors = await this.prismaRead.user.findMany({
            where: {
                blogPosts: {
                    some: {}
                }
            },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                _count: {
                    select: { blogPosts: true }
                }
            },
            orderBy: {
                blogPosts: {
                    _count: 'desc'
                }
            }
        });

        return authors.map(author => ({
            id: author.id,
            name: `${author.firstName} ${author.lastName}`,
            email: author.email,
            postCount: author._count?.blogPosts || 0,
        }));
    }

    /**
     * Retrieves a specific author profile by its unique identifier.
     * 
     * @param id The unique identifier of the user (author)
     * @throws NotFoundException if the author does not exist
     * @returns A promise resolving to the author profile
     */
    async findById(id: string): Promise<AuthorResponse> {
        const author = await this.prismaRead.user.findUnique({
            where: { id },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                _count: {
                    select: { blogPosts: true }
                }
            }
        });

        if (!author) {
            throw new NotFoundException(`Author with ID "${id}" not found`);
        }

        return {
            id: author.id,
            name: `${author.firstName} ${author.lastName}`,
            email: author.email,
            postCount: author._count?.blogPosts || 0,
        };
    }
}

