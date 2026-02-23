import { Injectable } from '@nestjs/common';
import { AggregationService } from '../services/aggregation.service';
import { AnalyticsWorkerService } from '../services/analytics-worker.service';
import { AnalyticsJobType, Period } from '../interfaces/analytics-job.interface';
import { LoggerService } from '@nestlancer/logger';

@Injectable()
export class ProjectAnalyticsProcessor {
    constructor(
        private readonly aggregationService: AggregationService,
        private readonly analyticsWorkerService: AnalyticsWorkerService,
        private readonly logger: LoggerService,
    ) { }

    async process(period: Period): Promise<void> {
        this.logger.log(`Processing project analytics for period: ${period}`);

        const projectsByStatus = await this.aggregationService.aggregate('project', ['status'], { id: 'count' });
        const revenuePerProject = await this.aggregationService.aggregate('project', [], { totalAmount: 'sum', id: 'count' });

        const data = {
            statuses: projectsByStatus.reduce((acc, curr) => ({ ...acc, [curr.status]: curr._count.id }), {}),
            totalRevenue: revenuePerProject[0]?._sum?.totalAmount || 0,
            averageValue: revenuePerProject[0]?._count?.id ? (revenuePerProject[0]._sum.totalAmount / revenuePerProject[0]._count.id) : 0,
        };

        await this.analyticsWorkerService.saveResult({
            type: AnalyticsJobType.PROJECT_STATS,
            period,
            data,
            generatedAt: new Date(),
            cachedUntil: new Date(Date.now() + 3600000),
        });
    }
}
