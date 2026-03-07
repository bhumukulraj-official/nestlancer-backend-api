import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule, ConfigService } from '@nestjs/config';
import { ConfigModule } from '@nestlancer/config';
import { HttpModule } from '@nestjs/axios';
import { QueueModule } from '@nestlancer/queue';
import { LoggerModule } from '@nestlancer/logger';
import { MetricsModule } from '@nestlancer/metrics';
import { TracingModule } from '@nestlancer/tracing';
import cdnConfig from './config/cdn-worker.config';
import { CdnWorkerService } from './services/cdn-worker.service';
import { CloudflareInvalidationService } from './services/cloudflare-invalidation.service';
import { CloudFrontInvalidationService } from './services/cloudfront-invalidation.service';
import { BatchCollectorService } from './services/batch-collector.service';
import { CdnConsumer } from './consumers/cdn.consumer';
import { PathInvalidationProcessor } from './processors/path-invalidation.processor';
import { BatchInvalidationProcessor } from './processors/batch-invalidation.processor';

@Module({
    imports: [
        ConfigModule.forRoot(),
        NestConfigModule.forFeature(cdnConfig),
        HttpModule,
        LoggerModule.forRoot(),
        MetricsModule,
        TracingModule.forRoot(),
        QueueModule.forRoot(),
    ],
    providers: [
        CdnWorkerService,
        CloudflareInvalidationService,
        CloudFrontInvalidationService,
        BatchCollectorService,
        CdnConsumer,
        PathInvalidationProcessor,
        BatchInvalidationProcessor,
    ],
})
export class AppModule { }
