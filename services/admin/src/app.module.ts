import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestlancer/config';
import { DatabaseModule } from '@nestlancer/database';
import { CacheModule } from '@nestlancer/cache';
import { QueueModule } from '@nestlancer/queue';
import { LoggerModule } from '@nestlancer/logger';
import { MetricsModule } from '@nestlancer/metrics';
import { TracingModule } from '@nestlancer/tracing';
import { AuthLibModule } from '@nestlancer/auth-lib';

@Module({
    imports: [
        ConfigModule.forRoot(),
        LoggerModule.forRoot({ serviceName: 'admin-service' }),
        MetricsModule.forRoot(),
        TracingModule.forRoot(),
        DatabaseModule.forRoot(),
        CacheModule.forRoot(),
        QueueModule.forRoot(),
        AuthLibModule, // Provides JwtAuthGuard and RolesGuard
    ],
    controllers: [],
    providers: [],
})
export class AppModule { }
