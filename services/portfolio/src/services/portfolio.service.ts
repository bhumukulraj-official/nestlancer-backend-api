import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaWriteService, PrismaReadService, ReadOnly } from '@nestlancer/database';
import { CreatePortfolioItemDto } from '../dto/create-portfolio-item.dto';
import { UpdatePortfolioItemDto } from '../dto/update-portfolio-item.dto';
import { QueryPortfolioDto } from '../dto/query-portfolio.dto';
import { PortfolioStatus } from '../entities/portfolio-item.entity';

@Injectable()
export class PortfolioService {
  constructor(
    private readonly prismaWrite: PrismaWriteService,
    private readonly prismaRead: PrismaReadService,
  ) {}

  async create(dto: CreatePortfolioItemDto) {
    const slug =
      dto.slug ||
      dto.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');

    const { categoryId, imageIds, tags, ...rest } = dto;

    return this.prismaWrite.portfolioItem.create({
      data: {
        ...(rest as any),
        slug,
        categoryId: categoryId as string,
        status: PortfolioStatus.DRAFT,
        order: 0,
        likeCount: 0,
        viewCount: 0,
        tags: tags ? tags.map((t) => t.toLowerCase()) : [],
        images: imageIds
          ? {
              create: imageIds.map((mediaId, index) => ({ mediaId, order: index })),
            }
          : undefined,
      },
      include: { category: true, images: true },
    });
  }

  @ReadOnly()
  async findPublished(query: QueryPortfolioDto) {
    const { page = 1, limit = 20, categoryId, featured } = query;
    const skip = (page - 1) * limit;

    const where: any = { status: PortfolioStatus.PUBLISHED };

    if (categoryId) where.categoryId = categoryId;
    if (featured !== undefined) where.featured = featured;

    const [items, totalItems] = await Promise.all([
      this.prismaRead.portfolioItem.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ featured: 'desc' }, { order: 'asc' }, { createdAt: 'desc' }],
        include: { category: true },
      }),
      this.prismaRead.portfolioItem.count({ where }),
    ]);

    return {
      items,
      totalItems,
      page,
      limit,
      totalPages: Math.ceil(totalItems / limit),
      hasNextPage: skip + limit < totalItems,
      hasPreviousPage: page > 1,
    };
  }

  @ReadOnly()
  async findByIdOrSlug(idOrSlug: string) {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug);
    const item = await this.prismaRead.portfolioItem.findFirst({
      where: isUuid ? { id: idOrSlug } : { slug: idOrSlug },
      include: {
        category: true,
        images: { orderBy: { order: 'asc' } },
      },
    });

    if (!item) {
      throw new NotFoundException(`Portfolio item not found`);
    }

    return item;
  }

  @ReadOnly()
  async getFeatured(limit = 5) {
    return this.prismaRead.portfolioItem.findMany({
      where: { status: PortfolioStatus.PUBLISHED, featured: true },
      take: limit,
      orderBy: [{ order: 'asc' }, { publishedAt: 'desc' }],
      include: { category: true },
    });
  }
}
