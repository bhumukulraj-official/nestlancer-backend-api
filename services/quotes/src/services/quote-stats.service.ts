import { Injectable } from '@nestjs/common';
import { PrismaReadService } from '@nestlancer/database';

@Injectable()
export class QuoteStatsService {
    constructor(private readonly prismaRead: PrismaReadService) { }

    async getUserStats(userId: string) {
        const quotes = await this.prismaRead.quote.findMany({
            where: { userId, status: { notIn: ['DRAFT', 'PENDING'] } },
            select: { status: true }
        });

        const byStatus = quotes.reduce((acc, q) => {
            const statusKey = q.status.toLowerCase().replace(/_([a-z])/g, (g) => g[1].toUpperCase());
            acc[statusKey] = (acc[statusKey] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        return {
            total: quotes.length,
            byStatus,
        };
    }

    async getOverallStats() {
        const quotes = await this.prismaRead.quote.findMany({
            select: { status: true, totalAmount: true }
        });

        let totalValue = 0;
        const byStatus = quotes.reduce((acc, q) => {
            const statusKey = q.status.toLowerCase().replace(/_([a-z])/g, (g) => g[1].toUpperCase());
            acc[statusKey] = (acc[statusKey] || 0) + 1;
            if (q.status === 'ACCEPTED') totalValue += q.totalAmount;
            return acc;
        }, {} as Record<string, number>);

        return {
            total: quotes.length,
            byStatus,
            totalAcceptedValue: totalValue,
            acceptanceRate: quotes.length > 0 ? (byStatus['accepted'] || 0) / quotes.length : 0
        };
    }
}
