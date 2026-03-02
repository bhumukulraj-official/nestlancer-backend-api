import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
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
        ConfigModule,
        ScheduleModule,
        DatabaseModule,
        LoggerModule,
        MetricsModule,
        TracingModule,
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
export class AppModule { }
