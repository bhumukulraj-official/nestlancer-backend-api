import { Injectable } from '@nestjs/common';
import { PrismaWriteService } from '@nestlancer/database/prisma/prisma-write.service';
import { PrismaReadService } from '@nestlancer/database/prisma/prisma-read.service';

@Injectable()
export class RequestStatsService {
    constructor(private readonly prismaRead: PrismaReadService) { }

    async getUserStats(userId: string) {
        const requests = await this.prismaRead.projectRequest.findMany({
            where: { userId, deletedAt: null },
            select: { status: true }
        });

        const byStatus = requests.reduce((acc, req) => {
            const statusKey = req.status.toLowerCase().replace(/_([a-z])/g, (g) => g[1].toUpperCase());
            acc[statusKey] = (acc[statusKey] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        return {
            total: requests.length,
            byStatus,
            // The rest would require more complex queries across quotes and projects
            averageResponseTime: '24 hours', // Placeholder
            pendingQuotes: byStatus['underReview'] || 0,
        };
    }

    async getOverallStats() {
        const requests = await this.prismaRead.projectRequest.findMany({
            where: { deletedAt: null },
            select: { status: true }
        });

        const byStatus = requests.reduce((acc, req) => {
            const statusKey = req.status.toLowerCase().replace(/_([a-z])/g, (g) => g[1].toUpperCase());
            acc[statusKey] = (acc[statusKey] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        return {
            total: requests.length,
            byStatus,
        };
    }
}
