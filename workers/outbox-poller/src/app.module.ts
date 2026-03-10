import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule, ConfigService } from '@nestjs/config';
import { ConfigModule } from '@nestlancer/config';
import { ScheduleModule } from '@nestjs/schedule';
import { DatabaseModule } from '@nestlancer/database';
import { QueueModule } from '@nestlancer/queue';
import { LoggerModule } from '@nestlancer/logger';
import { MetricsModule } from '@nestlancer/metrics';
import { TracingModule } from '@nestlancer/tracing';
import outboxConfig from './config/outbox-poller.config';
import { OutboxPollerService } from './services/outbox-poller.service';
import { OutboxPublisherService } from './services/outbox-publisher.service';
import { LeaderElectionService } from './services/leader-election.service';
import { StaleEventMonitorService } from './services/stale-event-monitor.service';

@Module({
  imports: [
    ConfigModule.forRoot(),
    NestConfigModule.forFeature(outboxConfig),
    ScheduleModule.forRoot(),
    DatabaseModule.forRoot(),
    LoggerModule.forRoot(),
    MetricsModule,
    TracingModule.forRoot(),
    QueueModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        url: configService.get<string>('RABBITMQ_URL'),
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [
    OutboxPollerService,
    OutboxPublisherService,
    LeaderElectionService,
    StaleEventMonitorService,
  ],
})
export class AppModule {}
