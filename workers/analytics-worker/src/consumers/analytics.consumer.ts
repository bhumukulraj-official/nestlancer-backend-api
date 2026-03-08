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

/**
 * RabbitMQ consumer for analytics processing jobs.
 * Orchestrates the dispatch of processing tasks to specialized analytics processors.
 */
@Injectable()
export class AnalyticsConsumer implements OnModuleInit {
    private readonly QUEUE_NAME = 'analytics.queue';

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

    /**
     * Initializes the consumer on module startup.
     * Registers the handler for the analytics queue.
     */
    async onModuleInit(): Promise<void> {
        this.logger.log(`[AnalyticsConsumer] Initializing consumer for queue: ${this.QUEUE_NAME}`);
        await this.queueConsumer.consume(this.QUEUE_NAME, async (msg: ConsumeMessage) => {
            try {
                const job: AnalyticsJob = JSON.parse(msg.content.toString());
                await this.handleJob(job);
            } catch (error: any) {
                this.logger.error(`[AnalyticsConsumer] Failed to process message: ${error.message}`, error.stack);
                // Note: QueueConsumer handles basic nack logic if callback throws
                throw error;
            }
        });
    }

    /**
     * Dispatches the analytics job to the appropriate domain processor.
     * 
     * @param job - The analytics job payload received from the queue
     * @returns A promise that resolves when processing is triggered/complete
     */
    async handleJob(job: AnalyticsJob): Promise<void> {
        this.logger.log(`[AnalyticsConsumer] Dispatching job: ${job.type} | Period: ${job.period}`);

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
                this.logger.warn(`[AnalyticsConsumer] Unsupported job type received: ${job.type}`);
        }
    }
}
