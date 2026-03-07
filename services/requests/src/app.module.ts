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
        ConfigModule.forRoot(),
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
    controllers: [],
    providers: [],
})
export class AppModule { }
