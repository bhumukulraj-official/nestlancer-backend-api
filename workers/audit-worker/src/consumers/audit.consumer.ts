import { Injectable } from '@nestjs/common';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { AuditWorkerService } from '../services/audit-worker.service';
import { AuditEntry } from '../interfaces/audit-job.interface';
import { LoggerService } from '@nestlancer/logger';

@Injectable()
@Processor('audit')
export class AuditConsumer extends WorkerHost {
    constructor(
        private readonly auditWorkerService: AuditWorkerService,
        private readonly logger: LoggerService,
    ) {
        super();
    }

    async process(job: Job<AuditEntry, any, string>): Promise<void> {
        try {
            await this.auditWorkerService.handleAuditEntry(job.data);
        } catch (error) {
            this.logger.error(`Error processing audit job ${job.id}: ${error.message}`, error.stack);
            throw error;
        }
    }
}
