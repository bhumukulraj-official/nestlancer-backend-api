import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { ConfigModule } from '@nestlancer/config';
import { LoggerModule } from '@nestlancer/logger';
import { MetricsModule } from '@nestlancer/metrics';
import { TracingModule } from '@nestlancer/tracing';
import { DatabaseModule } from '@nestlancer/database';
import { QueueModule } from '@nestlancer/queue';
import { OutboxModule } from '@nestlancer/outbox';
import { CacheModule } from '@nestlancer/cache';
import { AuthLibModule } from '@nestlancer/auth-lib';
import { StorageModule } from '@nestlancer/storage';

import { RequestsController } from './controllers/requests.controller';
import { RequestsAdminController } from './controllers/requests.admin.controller';
import { RequestsService } from './services/requests.service';
import { RequestsAdminService } from './services/requests.admin.service';
import { RequestAttachmentsService } from './services/request-attachments.service';
import { RequestStatsService } from './services/request-stats.service';
import { QuotesAdminService } from './services/quotes.admin.service';

import requestsConfig from './config/requests.config';

@Module({
    imports: [
        ConfigModule.forRoot(),
        NestConfigModule.forFeature(requestsConfig),
        LoggerModule.forRoot(),
        MetricsModule,
        TracingModule.forRoot(),
        DatabaseModule.forRoot(),
        QueueModule.forRoot(),
        OutboxModule.forRoot(),
        CacheModule.forRoot(),
        AuthLibModule,
        StorageModule.forRoot(),
    ],
    controllers: [RequestsController, RequestsAdminController],
    providers: [
        RequestsService,
        RequestsAdminService,
        RequestAttachmentsService,
        RequestStatsService,
        QuotesAdminService,
    ],
})
export class AppModule { }
