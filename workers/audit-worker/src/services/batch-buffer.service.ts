import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuditEntry } from '../interfaces/audit-job.interface';

/**
 * Generic buffering service that collects items and triggers a flush based on size or time.
 * Used primarily to batch database insertions for better performance.
 * 
 * @template T - The type of items being buffered
 */
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

    /**
     * Cleans up the flush timer when the module is destroyed.
     */
    onModuleDestroy(): void {
        this.stopTimer();
    }

    /**
     * Adds an item to the buffer.
     * 
     * @param item - The item to add
     * @returns True if the buffer has reached the batch size and should be flushed
     */
    add(item: T): boolean {
        this.buffer.push(item);
        return this.buffer.length >= this.batchSize;
    }

    /**
     * Drains all items from the buffer and resets it.
     * 
     * @returns An array containing all buffered items
     */
    drain(): T[] {
        const items = [...this.buffer];
        this.buffer = [];
        return items;
    }

    /**
     * Returns the current number of items in the buffer.
     * 
     * @returns The buffer size
     */
    size(): number {
        return this.buffer.length;
    }

    /**
     * Starts the periodic flush timer.
     * Note: The actual flush logic is usually handled by the consuming service.
     */
    private startTimer(): void {
        this.flushTimer = setInterval(() => {
            // Timer management only; consuming service handles scheduled flushes
        }, this.flushIntervalMs);
    }

    /**
     * Stops the periodic flush timer.
     */
    private stopTimer(): void {
        if (this.flushTimer) {
            clearInterval(this.flushTimer);
            this.flushTimer = null;
        }
    }
}
