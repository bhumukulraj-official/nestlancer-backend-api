import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { DatabaseModule } from '@nestlancer/database';
import { CacheModule } from '@nestlancer/cache';
import { QueueModule } from '@nestlancer/queue';
import { LoggerModule } from '@nestlancer/logger';
import { MetricsModule } from '@nestlancer/metrics';
import { TracingModule } from '@nestlancer/tracing';
import analyticsConfig from './config/analytics-worker.config';
import { AnalyticsWorkerService } from './services/analytics-worker.service';
import { AggregationService } from './services/aggregation.service';
import { ReportGeneratorService } from './services/report-generator.service';
import { AnalyticsConsumer } from './consumers/analytics.consumer';
import { UserAnalyticsProcessor } from './processors/user-analytics.processor';
import { ProjectAnalyticsProcessor } from './processors/project-analytics.processor';
import { RevenueAnalyticsProcessor } from './processors/revenue-analytics.processor';
import { PortfolioAnalyticsProcessor } from './processors/portfolio-analytics.processor';
import { BlogAnalyticsProcessor } from './processors/blog-analytics.processor';
import { EngagementAnalyticsProcessor } from './processors/engagement-analytics.processor';
import { HourlyAggregationCron } from './cron/hourly-aggregation.cron';
import { DailyAggregationCron } from './cron/daily-aggregation.cron';
import { WeeklyReportCron } from './cron/weekly-report.cron';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            load: [analyticsConfig],
        }),
        ScheduleModule.forRoot(),
        DatabaseModule,
        CacheModule,
        QueueModule.forConsumer('analytics'),
        LoggerModule,
        MetricsModule,
        TracingModule,
    ],
    providers: [
        AnalyticsWorkerService,
        AggregationService,
        ReportGeneratorService,
        AnalyticsConsumer,
        UserAnalyticsProcessor,
        ProjectAnalyticsProcessor,
        RevenueAnalyticsProcessor,
        PortfolioAnalyticsProcessor,
        BlogAnalyticsProcessor,
        EngagementAnalyticsProcessor,
        HourlyAggregationCron,
        DailyAggregationCron,
        WeeklyReportCron,
    ],
})
export class AppModule { }
