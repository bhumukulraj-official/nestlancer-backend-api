import { Injectable } from '@nestjs/common';
import { PrismaReadService, ReadOnly } from '@nestlancer/database';
import { SearchPortfolioDto } from '../dto/search-portfolio.dto';
import { PortfolioStatus } from '../entities/portfolio-item.entity';

@Injectable()
export class PortfolioSearchService {
    constructor(private readonly prismaRead: PrismaReadService) { }

    @ReadOnly()
    async search(dto: SearchPortfolioDto) {
        const { q, categoryId } = dto;

        const where: any = {
            status: PortfolioStatus.PUBLISHED,
            OR: [
                { title: { contains: q, mode: 'insensitive' } },
                { shortDescription: { contains: q, mode: 'insensitive' } },
            ]
        };

        if (categoryId) {
            where.categoryId = categoryId;
        }

        const items = await this.prismaRead.portfolioItem.findMany({
            where,
            orderBy: [{ featured: 'desc' }, { publishedAt: 'desc' }],
            take: 50,
            include: {
                category: true,
            }
        });

        return items;
    }
}
