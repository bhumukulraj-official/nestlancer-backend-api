import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaWriteService, PrismaReadService } from '@nestlancer/database';
import { BlogStatus } from '../entities/post.entity';
import { UpdatePostDto } from '../dto/update-post.dto';

@Injectable()
export class BlogAdminService {
    constructor(
        private readonly prismaWrite: PrismaWriteService,
        private readonly prismaRead: PrismaReadService,
    ) { }

    async findAll(query: any) {
        const { page = 1, limit = 20, status, categoryId } = query;
        const skip = (page - 1) * limit;

        const where: any = {};
        if (status) where.status = status;
        if (categoryId) where.categoryId = categoryId;

        const [items, totalItems] = await Promise.all([
            this.prismaRead.blogPost.findMany({
                where,
                skip,
                take: Number(limit),
                orderBy: { createdAt: 'desc' },
                include: { category: true, tags: true, author: { select: { id: true } } },
            }),
            this.prismaRead.blogPost.count({ where })
        ]);

        return {
            items,
            totalItems,
            page: Number(page),
            limit: Number(limit),
            totalPages: Math.ceil(totalItems / limit)
        };
    }

    async findById(id: string) {
        const item = await this.prismaRead.blogPost.findUnique({
            where: { id },
            include: { category: true, tags: true }
        });
        if (!item) throw new NotFoundException('Post not found');
        return item;
    }

    async update(id: string, dto: UpdatePostDto) {
        const { categoryId, tags, series, ...rest } = dto;
        return this.prismaWrite.blogPost.update({
            where: { id },
            data: {
                ...rest,
                ...(categoryId && { categoryId }),
            }
        });
    }

    async softDelete(id: string) {
        return this.prismaWrite.blogPost.update({
            where: { id },
            data: { status: 'ARCHIVED' }
        });
    }
}
