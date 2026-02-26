import { Injectable } from '@nestjs/common';
import { PrismaReadService } from '@nestlancer/database/prisma/prisma-read.service';
import { RequestStatus, QuoteStatus } from '@nestlancer/common';

interface UserRequestStats {
    total: number;
    byStatus: Record<string, number>;
    averageResponseTime: string | null;
    pendingQuotes: number;
    conversionRate: number;
}

interface OverallRequestStats {
    total: number;
    byStatus: Record<string, number>;
    averageResponseTime: string | null;
    conversionRate: number;
}

@Injectable()
export class RequestStatsService {
    constructor(private readonly prismaRead: PrismaReadService) { }

    async getUserStats(userId: string): Promise<UserRequestStats> {
        const [requests, quotesWithTiming] = await Promise.all([
            this.prismaRead.projectRequest.findMany({
                where: { userId, deletedAt: null },
                select: { id: true, status: true, createdAt: true }
            }),
            this.prismaRead.quote.findMany({
                where: { request: { userId, deletedAt: null } },
                select: {
                    status: true,
                    createdAt: true,
                    request: { select: { createdAt: true } }
                }
            })
        ]);

        const byStatus = this.aggregateByStatus(requests);
        const averageResponseTime = this.calculateAverageResponseTime(quotesWithTiming);
        const pendingQuotes = quotesWithTiming.filter(q => 
            q.status === QuoteStatus.SENT || q.status === QuoteStatus.VIEWED
        ).length;

        const convertedCount = byStatus['convertedToProject'] || 0;
        const totalSubmitted = requests.filter(r => r.status !== RequestStatus.DRAFT).length;
        const conversionRate = totalSubmitted > 0 ? (convertedCount / totalSubmitted) * 100 : 0;

        return {
            total: requests.length,
            byStatus,
            averageResponseTime,
            pendingQuotes,
            conversionRate: Math.round(conversionRate * 100) / 100,
        };
    }

    async getOverallStats(): Promise<OverallRequestStats> {
        const [requests, quotesWithTiming] = await Promise.all([
            this.prismaRead.projectRequest.findMany({
                where: { deletedAt: null },
                select: { id: true, status: true, createdAt: true }
            }),
            this.prismaRead.quote.findMany({
                where: { request: { deletedAt: null } },
                select: {
                    status: true,
                    createdAt: true,
                    request: { select: { createdAt: true } }
                }
            })
        ]);

        const byStatus = this.aggregateByStatus(requests);
        const averageResponseTime = this.calculateAverageResponseTime(quotesWithTiming);

        const convertedCount = byStatus['convertedToProject'] || 0;
        const totalSubmitted = requests.filter(r => r.status !== RequestStatus.DRAFT).length;
        const conversionRate = totalSubmitted > 0 ? (convertedCount / totalSubmitted) * 100 : 0;

        return {
            total: requests.length,
            byStatus,
            averageResponseTime,
            conversionRate: Math.round(conversionRate * 100) / 100,
        };
    }

    private aggregateByStatus(requests: Array<{ status: string }>): Record<string, number> {
        return requests.reduce((acc, req) => {
            const statusKey = req.status.toLowerCase().replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
            acc[statusKey] = (acc[statusKey] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);
    }

    private calculateAverageResponseTime(quotes: Array<{
        createdAt: Date;
        request: { createdAt: Date };
    }>): string | null {
        if (quotes.length === 0) {
            return null;
        }

        const responseTimes = quotes.map(quote => {
            const requestDate = new Date(quote.request.createdAt).getTime();
            const quoteDate = new Date(quote.createdAt).getTime();
            return quoteDate - requestDate;
        });

        const avgMs = responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length;
        return this.formatDuration(avgMs);
    }

    private formatDuration(ms: number): string {
        const hours = Math.floor(ms / (1000 * 60 * 60));
        const days = Math.floor(hours / 24);

        if (days > 0) {
            const remainingHours = hours % 24;
            return remainingHours > 0 ? `${days} day${days > 1 ? 's' : ''} ${remainingHours} hour${remainingHours > 1 ? 's' : ''}` : `${days} day${days > 1 ? 's' : ''}`;
        }

        if (hours > 0) {
            return `${hours} hour${hours > 1 ? 's' : ''}`;
        }

        const minutes = Math.floor(ms / (1000 * 60));
        return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
    }
}
