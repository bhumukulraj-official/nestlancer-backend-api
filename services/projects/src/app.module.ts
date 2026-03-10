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

import { ProjectsController } from './controllers/projects.controller';
import { ProjectsAdminController } from './controllers/projects.admin.controller';
import { ProjectsPublicController } from './controllers/projects.public.controller';
import { ProjectsService } from './services/projects.service';
import { ProjectsAdminService } from './services/projects.admin.service';
import { ProjectTimelineService } from './services/project-timeline.service';
import { ProjectDeliverablesService } from './services/project-deliverables.service';
import { ProjectPaymentsService } from './services/project-payments.service';

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
    controllers: [
        ProjectsController,
        ProjectsAdminController,
        ProjectsPublicController,
    ],
    providers: [
        ProjectsService,
        ProjectsAdminService,
        ProjectTimelineService,
        ProjectDeliverablesService,
        ProjectPaymentsService,
    ],
})
export class AppModule { }
