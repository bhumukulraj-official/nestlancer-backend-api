import { Module } from '@nestjs/common';
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

import requestsConfig from './config/requests.config';

@Module({
    imports: [
        ConfigModule,
        LoggerModule,
        MetricsModule,
        TracingModule,
        DatabaseModule,
        QueueModule,
        OutboxModule,
        CacheModule,
        AuthLibModule,
        StorageModule,
    ],
    controllers: [],
    providers: [],
})
export class AppModule { }
