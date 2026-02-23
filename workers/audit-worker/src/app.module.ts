import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LoggerModule } from '@nestlancer/logger';
import { MetricsModule } from '@nestlancer/metrics';
import { TracingModule } from '@nestlancer/tracing';
import { DatabaseModule } from '@nestlancer/database';
import { QueueModule } from '@nestlancer/queue';
import { AuditConsumer } from './consumers/audit.consumer';
import { AuditWorkerService } from './services/audit-worker.service';
import { BatchBufferService } from './services/batch-buffer.service';
import { AuditBatchInsertProcessor } from './processors/audit-batch-insert.processor';
import { auditConfig } from './config/audit-worker.config';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            load: [auditConfig],
        }),
        LoggerModule.forRoot({ serviceName: 'audit-worker' }),
        MetricsModule.forRoot(),
        TracingModule.forRoot({ serviceName: 'audit-worker' }),
        DatabaseModule.forRoot(),
        QueueModule.forConsumer('audit'),
    ],
    providers: [
        AuditConsumer,
        AuditWorkerService,
        BatchBufferService,
        AuditBatchInsertProcessor,
    ],
})
export class AuditModule { }
