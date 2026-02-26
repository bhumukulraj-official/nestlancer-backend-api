import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaWriteService, PrismaReadService } from '@nestlancer/database';
import { PortfolioStatus } from '../entities/portfolio-item.entity';
import { BulkUpdatePortfolioDto, BulkOperation } from '../dto/bulk-update-portfolio.dto';
import { UpdatePrivacyDto, Visibility } from '../dto/update-privacy.dto';
import { UpdatePortfolioItemDto } from '../dto/update-portfolio-item.dto';

interface PortfolioQueryParams {
    status?: string;
    categoryId?: string;
    featured?: string | boolean;
    page?: number;
    limit?: number;
}

interface PaginatedResult<T> {
    items: T[];
    totalItems: number;
    page: number;
    limit: number;
    totalPages: number;
}

@Injectable()
export class PortfolioAdminService {
    constructor(
        private readonly prismaWrite: PrismaWriteService,
        private readonly prismaRead: PrismaReadService,
    ) { }

    async findAll(query: PortfolioQueryParams): Promise<PaginatedResult<any>> {
        const { status, categoryId, featured, page = 1, limit = 20 } = query;
        const skip = (page - 1) * Number(limit);

        const where: Record<string, unknown> = {};
        if (status) where.status = status;
        if (categoryId) where.categoryId = categoryId;
        if (featured !== undefined) where.featured = featured === 'true' || featured === true;

        const [items, totalItems] = await Promise.all([
            this.prismaRead.portfolioItem.findMany({
                where,
                skip,
                take: Number(limit),
                orderBy: { createdAt: 'desc' },
                include: { category: true },
            }),
            this.prismaRead.portfolioItem.count({ where })
        ]);

        return {
            items,
            totalItems,
            page: Number(page),
            limit: Number(limit),
            totalPages: Math.ceil(totalItems / Number(limit))
        };
    }

    async findById(id: string) {
        const item = await this.prismaRead.portfolioItem.findUnique({
            where: { id },
            include: { category: true }
        });
        if (!item) throw new NotFoundException('Portfolio item not found');
        return item;
    }

    async update(id: string, dto: UpdatePortfolioItemDto) {
        // Verify item exists
        await this.findById(id);

        const { categoryId, ...rest } = dto;
        const updateData: Record<string, unknown> = { ...rest };

        if (categoryId) {
            updateData.categoryId = categoryId;
        }

        return this.prismaWrite.portfolioItem.update({
            where: { id },
            data: updateData,
            include: { category: true }
        });
    }

    async softDelete(id: string) {
        // Verify item exists
        await this.findById(id);

        return this.prismaWrite.portfolioItem.update({
            where: { id },
            data: { deletedAt: new Date(), status: PortfolioStatus.ARCHIVED }
        });
    }

    async hardDelete(id: string) {
        // Verify item exists
        await this.findById(id);

        return this.prismaWrite.portfolioItem.delete({
            where: { id }
        });
    }

    async publish(id: string) {
        // Verify item exists
        await this.findById(id);

        return this.prismaWrite.portfolioItem.update({
            where: { id },
            data: { status: PortfolioStatus.PUBLISHED, publishedAt: new Date() }
        });
    }

    async unpublish(id: string) {
        // Verify item exists
        await this.findById(id);

        return this.prismaWrite.portfolioItem.update({
            where: { id },
            data: { status: PortfolioStatus.DRAFT, publishedAt: null }
        });
    }

    async archive(id: string) {
        // Verify item exists
        await this.findById(id);

        return this.prismaWrite.portfolioItem.update({
            where: { id },
            data: { status: PortfolioStatus.ARCHIVED }
        });
    }

    async toggleFeatured(id: string) {
        const item = await this.findById(id);
        return this.prismaWrite.portfolioItem.update({
            where: { id },
            data: { featured: !item.featured }
        });
    }

    async updatePrivacy(id: string, dto: UpdatePrivacyDto) {
        // Verify item exists
        await this.findById(id);

        // Map DTO visibility to Prisma enum
        const visibilityMap: Record<Visibility, string> = {
            [Visibility.PUBLIC]: 'PUBLIC',
            [Visibility.UNLISTED]: 'UNLISTED',
            [Visibility.PRIVATE]: 'PRIVATE',
        };

        return this.prismaWrite.portfolioItem.update({
            where: { id },
            data: { visibility: visibilityMap[dto.visibility] }
        });
    }

    async duplicate(id: string) {
        const item = await this.findById(id);
        const { id: _, createdAt, updatedAt, publishedAt, slug, ...data } = item;

        // Generate unique slug
        const timestamp = Date.now();
        const newSlug = `${slug}-copy-${timestamp}`;

        return this.prismaWrite.portfolioItem.create({
            data: {
                ...data,
                slug: newSlug,
                status: PortfolioStatus.DRAFT,
                title: `${data.title} (Copy)`,
                publishedAt: null,
                deletedAt: null,
                categoryId: item.categoryId,
            }
        });
    }

    async bulkUpdate(dto: BulkUpdatePortfolioDto) {
        const { operation, ids } = dto;

        switch (operation) {
            case BulkOperation.PUBLISH:
                return this.prismaWrite.portfolioItem.updateMany({
                    where: { id: { in: ids } },
                    data: { status: PortfolioStatus.PUBLISHED, publishedAt: new Date() }
                });

            case BulkOperation.ARCHIVE:
                return this.prismaWrite.portfolioItem.updateMany({
                    where: { id: { in: ids } },
                    data: { status: PortfolioStatus.ARCHIVED }
                });

            case BulkOperation.DELETE:
                return this.prismaWrite.portfolioItem.deleteMany({
                    where: { id: { in: ids } }
                });

            case BulkOperation.FEATURE:
                return this.prismaWrite.portfolioItem.updateMany({
                    where: { id: { in: ids } },
                    data: { featured: true }
                });

            case BulkOperation.UNFEATURE:
                return this.prismaWrite.portfolioItem.updateMany({
                    where: { id: { in: ids } },
                    data: { featured: false }
                });

            default:
                throw new Error(`Unknown bulk operation: ${operation}`);
        }
    }
}
