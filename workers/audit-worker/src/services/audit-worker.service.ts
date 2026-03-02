import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { BatchBufferService } from './batch-buffer.service';
import { AuditBatchInsertProcessor } from '../processors/audit-batch-insert.processor';
import { MetricsService } from '@nestlancer/metrics';
import { AuditEntry } from '../interfaces/audit-job.interface';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuditWorkerService implements OnModuleInit, OnModuleDestroy {
    private flushTimer: NodeJS.Timeout | null = null;
    private readonly flushIntervalMs: number;

    constructor(
        private readonly bufferService: BatchBufferService,
        private readonly processor: AuditBatchInsertProcessor,
        private readonly logger: Logger,
        private readonly metrics: MetricsService,
        private readonly configService: ConfigService,
    ) {
        this.flushIntervalMs = this.configService.get<number>('audit.flushIntervalMs', 5000);
    }

    onModuleInit() {
        this.startFlushTimer();
    }

    onModuleDestroy() {
        this.stopFlushTimer();
        // Final flush on shutdown
        this.flush().catch(err => {
            this.logger.error(`Error during final audit flush: ${err.message}`);
        });
    }

    async handleAuditEntry(entry: AuditEntry): Promise<void> {
        this.metrics.incrementCounter('audit.entries_received');
        const shouldFlush = this.bufferService.add(entry);
        this.metrics.setGauge('audit.buffer_size', this.bufferService.size());

        if (shouldFlush) {
            await this.flush();
        }
    }

    async flush(): Promise<void> {
        if (this.bufferService.size() === 0) return;

        this.logger.debug(`Flushing audit buffer (${this.bufferService.size()} entries)...`);
        const entries = this.bufferService.drain();

        const startTime = Date.now();
        await this.processor.insertBatch(entries);
        const duration = Date.now() - startTime;

        this.metrics.incrementCounter('audit.batch_inserted', undefined, entries.length);
        this.metrics.observeHistogram('audit.flush_duration', duration);
        this.metrics.setGauge('audit.buffer_size', this.bufferService.size());
    }

    private startFlushTimer() {
        this.flushTimer = setInterval(() => {
            this.flush().catch(err => {
                this.logger.error(`Error during scheduled audit flush: ${err.message}`);
            });
        }, this.flushIntervalMs);
    }

    private stopFlushTimer() {
        if (this.flushTimer) {
            clearInterval(this.flushTimer);
            this.flushTimer = null;
        }
    }
}
