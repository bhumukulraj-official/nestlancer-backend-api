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

@Injectable()
export class TagsService {
    constructor(
        private readonly prismaRead: PrismaReadService,
        private readonly prismaWrite: PrismaWriteService,
    ) { }

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

@Injectable()
export class AuthorsService {
    constructor(private readonly prismaRead: PrismaReadService) { }

    async findAll(): Promise<AuthorResponse[]> {
        const authors = await this.prismaRead.user.findMany({
            where: {
                blogPosts: {
                    some: {}
                }
            },
            select: {
                id: true,
                name: true,
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
            name: author.name,
            email: author.email,
            postCount: author._count.blogPosts,
        }));
    }

    async findById(id: string): Promise<AuthorResponse> {
        const author = await this.prismaRead.user.findUnique({
            where: { id },
            select: {
                id: true,
                name: true,
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
            name: author.name,
            email: author.email,
            postCount: author._count.blogPosts,
        };
    }
}
