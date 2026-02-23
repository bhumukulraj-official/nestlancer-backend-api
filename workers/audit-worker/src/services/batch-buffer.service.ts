import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuditEntry } from '../interfaces/audit-job.interface';

@Injectable()
export class BatchBufferService<T = AuditEntry> implements OnModuleDestroy {
    private buffer: T[] = [];
    private flushTimer: NodeJS.Timeout | null = null;
    private readonly batchSize: number;
    private readonly flushIntervalMs: number;

    constructor(private readonly configService: ConfigService) {
        this.batchSize = this.configService.get<number>('audit.batchSize', 100);
        this.flushIntervalMs = this.configService.get<number>('audit.flushIntervalMs', 5000);
        this.startTimer();
    }

    onModuleDestroy() {
        this.stopTimer();
    }

    add(item: T): boolean {
        this.buffer.push(item);
        return this.buffer.length >= this.batchSize;
    }

    drain(): T[] {
        const items = [...this.buffer];
        this.buffer = [];
        return items;
    }

    size(): number {
        return this.buffer.length;
    }

    private startTimer() {
        this.flushTimer = setInterval(() => {
            // Trigger externally or handled by Service
        }, this.flushIntervalMs);
    }

    private stopTimer() {
        if (this.flushTimer) {
            clearInterval(this.flushTimer);
            this.flushTimer = null;
        }
    }
}
