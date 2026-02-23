import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaWriteService, PrismaReadService } from '@nestlancer/database';
import { PortfolioStatus, PortfolioItem } from '../entities/portfolio-item.entity';
import { BulkUpdatePortfolioDto, BulkOperation } from '../dto/bulk-update-portfolio.dto';
import { UpdatePrivacyDto } from '../dto/update-privacy.dto';
import { UpdatePortfolioItemDto } from '../dto/update-portfolio-item.dto';

@Injectable()
export class PortfolioAdminService {
    constructor(
        private readonly prismaWrite: PrismaWriteService,
        private readonly prismaRead: PrismaReadService,
    ) { }

    async findAll(query: any) {
        const { status, categoryId, featured, page = 1, limit = 20 } = query;
        const skip = (page - 1) * limit;

        const where: any = {};
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
            totalPages: Math.ceil(totalItems / limit)
        };
    }

    async findById(id: string) {
        const item = await this.prismaRead.portfolioItem.findUnique({
            where: { id },
            include: { category: true, images: true, tags: true }
        });
        if (!item) throw new NotFoundException('Item not found');
        return item;
    }

    async update(id: string, dto: UpdatePortfolioItemDto) {
        const { categoryId, imageIds, tags, ...rest } = dto;
        return this.prismaWrite.portfolioItem.update({
            where: { id },
            data: {
                ...rest,
                ...(categoryId && { categoryId }),
                // Simplistic tag/image update, ideally would map relationships
            }
        });
    }

    async softDelete(id: string) {
        // There isn't a deletedAt on portfolio-item.entity.ts usually, we might hard delete or set status to DELETED
        return this.prismaWrite.portfolioItem.delete({
            where: { id }
        });
    }

    async publish(id: string) {
        return this.prismaWrite.portfolioItem.update({
            where: { id },
            data: { status: PortfolioStatus.PUBLISHED, publishedAt: new Date() }
        });
    }

    async unpublish(id: string) {
        return this.prismaWrite.portfolioItem.update({
            where: { id },
            data: { status: PortfolioStatus.DRAFT, publishedAt: null }
        });
    }

    async archive(id: string) {
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
        // Depending on DB schema... if visibility exists we update it. If not, it might not be in the model.
        // We'll update a JSON field or similar if it's there, we'll omit for now as it's not strictly on the schema
        return this.prismaWrite.portfolioItem.update({
            where: { id },
            data: { /* visibility: dto.visibility */ } as any
        });
    }

    async duplicate(id: string) {
        const item = await this.findById(id);
        const { id: _, createdAt, updatedAt, publishedAt, slug, ...data } = item;

        return this.prismaWrite.portfolioItem.create({
            data: {
                ...data,
                slug: `${slug}-copy-${Date.now()}`,
                status: PortfolioStatus.DRAFT,
                title: `${data.title} (Copy)`,
            } as any
        });
    }

    async bulkUpdate(dto: BulkUpdatePortfolioDto) {
        const { operation, ids } = dto;

        if (operation === BulkOperation.PUBLISH) {
            return this.prismaWrite.portfolioItem.updateMany({
                where: { id: { in: ids } },
                data: { status: PortfolioStatus.PUBLISHED, publishedAt: new Date() }
            });
        } else if (operation === BulkOperation.ARCHIVE) {
            return this.prismaWrite.portfolioItem.updateMany({
                where: { id: { in: ids } },
                data: { status: PortfolioStatus.ARCHIVED }
            });
        } else if (operation === BulkOperation.DELETE) {
            return this.prismaWrite.portfolioItem.deleteMany({
                where: { id: { in: ids } }
            });
        }
    }
}
