import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { ConfigModule } from '@nestlancer/config';
import { LoggerModule } from '@nestlancer/logger';
import { MetricsModule } from '@nestlancer/metrics';
import { TracingModule } from '@nestlancer/tracing';
import { HealthLibModule } from '@nestlancer/health-lib';
import { CacheModule } from '@nestlancer/cache';
import { HealthPublicController } from './controllers/public/health.public.controller';
import { HealthDebugAdminController } from './controllers/admin/health-debug.admin.controller';
import { HealthService } from './services/health.service';
import { DatabaseHealthService } from './services/database-health.service';
import { CacheHealthService } from './services/cache-health.service';
import { QueueHealthService } from './services/queue-health.service';
import { StorageHealthService } from './services/storage-health.service';
import { ExternalServicesHealthService } from './services/external-services-health.service';
import { WorkersHealthService } from './services/workers-health.service';
import { WebsocketHealthService } from './services/websocket-health.service';
import { SystemMetricsService } from './services/system-metrics.service';
import { FeatureFlagsHealthService } from './services/feature-flags-health.service';
import { ServiceRegistryHealthService } from './services/service-registry-health.service';
import healthConfig from './config/health.config';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            load: [healthConfig],
        }),
        LoggerModule.forRoot(),
        MetricsModule.forRoot(),
        TracingModule.forRoot(),
        TerminusModule,
        HealthLibModule,
        CacheModule,
    ],
    controllers: [HealthPublicController, HealthDebugAdminController],
    providers: [
        HealthService,
        DatabaseHealthService,
        CacheHealthService,
        QueueHealthService,
        StorageHealthService,
        ExternalServicesHealthService,
        WorkersHealthService,
        WebsocketHealthService,
        SystemMetricsService,
        FeatureFlagsHealthService,
        ServiceRegistryHealthService,
    ],
})
export class AppModule { }
