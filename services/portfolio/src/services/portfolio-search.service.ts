import { Injectable } from '@nestjs/common';
import { PrismaReadService, ReadOnly } from '@nestlancer/database';
import { SearchPortfolioDto } from '../dto/search-portfolio.dto';

@Injectable()
export class PortfolioSearchService {
    constructor(private readonly prismaRead: PrismaReadService) { }

    @ReadOnly()
    async search(dto: SearchPortfolioDto) {
        // In a real app we might use `@nestlancer/search` with tsvector or elasticsearch.
        // For now we'll do a basic PostgreSQL ILIKE or basic search

        const { q, categoryId } = dto;

        // PostgreSQL ILIKE fallback if not using tsvector
        const where: any = {
            status: 'PUBLISHED',
            OR: [
                { title: { contains: q, mode: 'insensitive' } },
                { shortDescription: { contains: q, mode: 'insensitive' } },
                { tags: { some: { name: { contains: q, mode: 'insensitive' } } } },
            ]
        };

        if (categoryId) {
            where.categoryId = categoryId;
        }

        const items = await this.prismaRead.portfolioItem.findMany({
            where,
            orderBy: [{ featured: 'desc' }, { publishedAt: 'desc' }],
            take: 50, // limit search results
            include: {
                category: true,
                tags: true,
            }
        });

        return items;
    }
}
