import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestlancer/config';
import { LoggerModule } from '@nestlancer/logger';
import { DatabaseModule } from '@nestlancer/database';
import { AuthLibModule } from '@nestlancer/auth-lib';
import { StorageModule } from '@nestlancer/storage';
import { OutboxModule } from '@nestlancer/outbox';
import { MetricsModule } from '@nestlancer/metrics';
import { TracingModule } from '@nestlancer/tracing';
import { QueueModule } from '@nestlancer/queue';
import { CacheModule } from '@nestlancer/cache';
import progressConfig from './config/progress.config';

import { ProgressAdminController } from './controllers/admin/progress.admin.controller';
import { MilestonesAdminController } from './controllers/admin/milestones.admin.controller';
import { DeliverablesAdminController } from './controllers/admin/deliverables.admin.controller';
import { ProgressController } from './controllers/user/progress.controller';
import { MilestoneApprovalsController } from './controllers/user/milestone-approvals.controller';
import { DeliverableReviewsController } from './controllers/user/deliverable-reviews.controller';

import { ProgressService } from './services/progress.service';
import { ProgressTimelineService } from './services/progress-timeline.service';
import { MilestonesService } from './services/milestones.service';
import { DeliverablesService } from './services/deliverables.service';
import { MilestoneApprovalService } from './services/milestone-approval.service';
import { DeliverableReviewService } from './services/deliverable-review.service';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            load: [progressConfig],
        }),
        LoggerModule.forRoot(),
        MetricsModule,
        TracingModule.forRoot(),
        DatabaseModule,
        AuthLibModule,
        StorageModule,
        OutboxModule,
        QueueModule,
        CacheModule,
    ],
    controllers: [
        ProgressAdminController,
        MilestonesAdminController,
        DeliverablesAdminController,
        ProgressController,
        MilestoneApprovalsController,
        DeliverableReviewsController,
    ],
    providers: [
        ProgressService,
        ProgressTimelineService,
        MilestonesService,
        DeliverablesService,
        MilestoneApprovalService,
        DeliverableReviewService,
    ],
})
export class AppModule { }
