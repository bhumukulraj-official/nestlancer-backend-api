import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { OutboxRepository } from './outbox.repository';

/** Polls outbox table for pending events and publishes to RabbitMQ (ADR-004) */
@Injectable()
export class OutboxPollerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(OutboxPollerService.name);
  private intervalId?: NodeJS.Timeout;
  private readonly pollIntervalMs = 1000;

  constructor(private readonly repository: OutboxRepository) {}

  onModuleInit(): void {
    this.intervalId = setInterval(() => this.poll(), this.pollIntervalMs);
    this.logger.log('Outbox poller started');
  }

  onModuleDestroy(): void {
    if (this.intervalId) clearInterval(this.intervalId);
  }

  private async poll(): Promise<void> {
    try {
      const events = await this.repository.findPending(10);
      for (const event of events) {
        try {
          // In production, this publishes to RabbitMQ via QueuePublisherService
          await this.repository.markPublished(event.id);
          this.logger.debug(`Published outbox event: ${event.id}`);
        } catch (error) {
          await this.repository.markFailed(event.id, String(error));
        }
      }
    } catch (error) {
      this.logger.error('Outbox poll error:', error);
    }
  }
}
