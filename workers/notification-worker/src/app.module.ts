import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LoggerModule } from '@nestlancer/logger';
import { MetricsModule } from '@nestlancer/metrics';
import { TracingModule } from '@nestlancer/tracing';
import { DatabaseModule } from '@nestlancer/database';
import { QueueModule } from '@nestlancer/queue';
import { CacheModule } from '@nestlancer/cache';
import { notificationWorkerConfig } from './config/notification-worker.config';
import { NotificationWorkerService } from './services/notification-worker.service';
import { RedisPublisherService } from './services/redis-publisher.service';
import { PushProviderService } from './services/push-provider.service';
import { InAppNotificationProcessor } from './processors/in-app-notification.processor';
import { NotificationConsumer } from './consumers/notification.consumer';

@Module({
  imports: [
    ConfigModule.forRoot(),
    ConfigModule.forFeature(notificationWorkerConfig),
    LoggerModule.forRoot(),
    MetricsModule,
    TracingModule.forRoot(),
    DatabaseModule.forRoot(),
    CacheModule.forRoot(),
    QueueModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        url: config.get('notificationWorker.rabbitmq.url'),
      }),
    }),
  ],
  providers: [
    NotificationWorkerService,
    RedisPublisherService,
    PushProviderService,
    InAppNotificationProcessor,
    NotificationConsumer,
  ],
})
export class AppModule {}
