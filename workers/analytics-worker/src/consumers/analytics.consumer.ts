import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConsumeMessage } from 'amqplib';
import { QueueConsumerService } from '@nestlancer/queue';
import { LoggerService } from '@nestlancer/logger';
import { AnalyticsJob, AnalyticsJobType } from '../interfaces/analytics-job.interface';
import { UserAnalyticsProcessor } from '../processors/user-analytics.processor';
import { ProjectAnalyticsProcessor } from '../processors/project-analytics.processor';
import { RevenueAnalyticsProcessor } from '../processors/revenue-analytics.processor';
import { PortfolioAnalyticsProcessor } from '../processors/portfolio-analytics.processor';
import { BlogAnalyticsProcessor } from '../processors/blog-analytics.processor';
import { EngagementAnalyticsProcessor } from '../processors/engagement-analytics.processor';

@Injectable()
export class AnalyticsConsumer implements OnModuleInit {
    constructor(
        private readonly logger: LoggerService,
        private readonly queueConsumer: QueueConsumerService,
        private readonly userAnalytics: UserAnalyticsProcessor,
        private readonly projectAnalytics: ProjectAnalyticsProcessor,
        private readonly revenueAnalytics: RevenueAnalyticsProcessor,
        private readonly portfolioAnalytics: PortfolioAnalyticsProcessor,
        private readonly blogAnalytics: BlogAnalyticsProcessor,
        private readonly engagementAnalytics: EngagementAnalyticsProcessor,
    ) { }

    async onModuleInit() {
        await this.queueConsumer.consume('analytics.queue', async (msg: ConsumeMessage) => {
            const job: AnalyticsJob = JSON.parse(msg.content.toString());
            await this.handleJob(job);
        });
    }

    async handleJob(job: AnalyticsJob): Promise<void> {
        this.logger.log(`Received analytics job: ${job.type} (${job.period})`);

        switch (job.type) {
            case AnalyticsJobType.USER_STATS:
                await this.userAnalytics.process(job.period);
                break;
            case AnalyticsJobType.PROJECT_STATS:
                await this.projectAnalytics.process(job.period);
                break;
            case AnalyticsJobType.REVENUE_REPORT:
                await this.revenueAnalytics.process(job.period);
                break;
            case AnalyticsJobType.PORTFOLIO_ANALYTICS:
                await this.portfolioAnalytics.process(job.period);
                break;
            case AnalyticsJobType.BLOG_ANALYTICS:
                await this.blogAnalytics.process(job.period);
                break;
            case AnalyticsJobType.ENGAGEMENT_METRICS:
                await this.engagementAnalytics.process(job.period);
                break;
            default:
                this.logger.warn(`Unknown analytics job type: ${job.type}`);
        }
    }
}
