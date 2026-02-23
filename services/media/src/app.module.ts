import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestlancer/config';
import { DatabaseModule } from '@nestlancer/database';
import { LoggerModule } from '@nestlancer/logger';
import { MetricsModule } from '@nestlancer/metrics';
import { TracingModule } from '@nestlancer/tracing';
import { OutboxModule } from '@nestlancer/outbox';
import { QueueModule } from '@nestlancer/queue';
import { CacheModule } from '@nestlancer/cache';
import { AuthModule } from '@nestlancer/auth-lib';
import { StorageModule } from './storage/storage.module';
import { MediaModule } from './media/media.module';
import { ShareModule } from './share/share.module';

@Module({
    imports: [
        ConfigModule.forRoot(),
        LoggerModule.forRoot(),
        MetricsModule.forRoot(),
        TracingModule.forRoot(),
        DatabaseModule.forRoot(),
        CacheModule.forRoot(),
        QueueModule.forRoot(),
        OutboxModule.forRoot(),
        AuthModule.forRoot(),
        StorageModule,
        MediaModule,
        ShareModule,
    ],
})
export class AppModule { }
