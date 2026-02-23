import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LoggerModule } from '@nestlancer/logger';
import { MetricsModule } from '@nestlancer/metrics';
import { TracingModule } from '@nestlancer/tracing';
import { DatabaseModule } from '@nestlancer/database';
import { QueueModule } from '@nestlancer/queue';
import { WebhookReceiverController } from './controllers/webhook/webhook-receiver.controller';
import { WebhookIngestionService } from './services/webhook-ingestion.service';
import { WebhookDispatcherService } from './services/webhook-dispatcher.service';
import { WebhookRetryService } from './services/webhook-retry.service';
import { WebhookReplayService } from './services/webhook-replay.service';
import { RazorpayProvider } from './providers/razorpay.provider';
import { CloudflareProvider } from './providers/cloudflare.provider';
import { webhooksConfig } from './config/webhooks.config';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            load: [webhooksConfig],
        }),
        LoggerModule.forRoot(),
        MetricsModule.forRoot(),
        TracingModule.forRoot(),
        DatabaseModule.forRoot(),
        QueueModule.forRoot(),
    ],
    controllers: [WebhookReceiverController],
    providers: [
        WebhookIngestionService,
        WebhookDispatcherService,
        WebhookRetryService,
        WebhookReplayService,
        RazorpayProvider,
        CloudflareProvider,
    ],
})
export class AppModule { }
