import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LoggerModule } from '@nestlancer/logger';
import { MetricsModule } from '@nestlancer/metrics';
import { TracingModule } from '@nestlancer/tracing';
import { DatabaseModule, PrismaReadService, PrismaWriteService } from '@nestlancer/database';
import { CacheModule } from '@nestlancer/cache';
import { QueueModule, QueuePublisherService } from '@nestlancer/queue';
import { AuthLibModule } from '@nestlancer/auth-lib';

import { WebhookReceiverController } from './controllers/webhook/webhook-receiver.controller';
import { WebhookIngestionService } from './services/webhook-ingestion.service';
import { WebhookDispatcherService } from './services/webhook-dispatcher.service';
import { RazorpayProvider } from './providers/razorpay.provider';
import { CloudflareProvider } from './providers/cloudflare.provider';
import { webhooksConfig } from './config/webhooks.config';

@Module({
    imports: [
        ConfigModule,
        LoggerModule,
        MetricsModule,
        TracingModule,
        DatabaseModule.forRoot(),
        CacheModule,
        QueueModule.forRoot({ url: process.env.REDIS_URL || 'redis://localhost:6379' }),
        AuthLibModule,
    ],
    controllers: [WebhookReceiverController],
    providers: [
        WebhookIngestionService,
        WebhookDispatcherService,
        RazorpayProvider,
        CloudflareProvider,
        PrismaReadService,
        PrismaWriteService,
        QueuePublisherService,
    ],
})
export class AppModule { }
