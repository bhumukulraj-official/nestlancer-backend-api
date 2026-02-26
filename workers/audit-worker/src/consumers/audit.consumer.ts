import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConsumeMessage } from 'amqplib';
import { QueueConsumerService } from '@nestlancer/queue';
import { AuditWorkerService } from '../services/audit-worker.service';
import { AuditEntry } from '../interfaces/audit-job.interface';

@Injectable()
export class AuditConsumer implements OnModuleInit {
    private readonly logger = new Logger(AuditConsumer.name);

    constructor(
        private readonly auditWorkerService: AuditWorkerService,
        private readonly queueConsumer: QueueConsumerService,
    ) { }

    async onModuleInit() {
        await this.queueConsumer.consume('audit.queue', async (msg: ConsumeMessage) => this.handleMessage(msg));
    }

    private async handleMessage(msg: ConsumeMessage) {
        const job: AuditEntry = JSON.parse(msg.content.toString());
        try {
            await this.auditWorkerService.handleAuditEntry(job);
        } catch (e) {
            const error = e as Error;
            this.logger.error(`Error processing audit job: ${error.message}`, error.stack);
            throw error;
        }
    }
}
