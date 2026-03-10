import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConsumeMessage } from 'amqplib';
import { QueueConsumerService } from '@nestlancer/queue';
import { AuditWorkerService } from '../services/audit-worker.service';
import { AuditEntry } from '../interfaces/audit-job.interface';

/**
 * RabbitMQ consumer for audit log events.
 * Listens for system events and forwards them to the AuditWorkerService for batch processing.
 */
@Injectable()
export class AuditConsumer implements OnModuleInit {
  private readonly logger = new Logger(AuditConsumer.name);
  private readonly QUEUE_NAME = 'audit.queue';

  constructor(
    private readonly auditWorkerService: AuditWorkerService,
    private readonly queueConsumer: QueueConsumerService,
  ) {}

  /**
   * Initializes the consumer by registering the audit queue handler.
   */
  async onModuleInit(): Promise<void> {
    this.logger.log(`[AuditConsumer] Subscribing to queue: ${this.QUEUE_NAME}`);
    await this.queueConsumer.consume(this.QUEUE_NAME, async (msg: ConsumeMessage) =>
      this.handleMessage(msg),
    );
  }

  /**
   * Parses and hands off the audit entry to the processing service.
   *
   * @param msg - The RabbitMQ message containing the audit entry JSON
   * @throws Error if the message cannot be processed, allowing the consumer to handle retries
   */
  private async handleMessage(msg: ConsumeMessage): Promise<void> {
    try {
      const entry: AuditEntry = JSON.parse(msg.content.toString());
      await this.auditWorkerService.handleAuditEntry(entry);
    } catch (error: any) {
      this.logger.error(
        `[AuditConsumer] Failed to process audit message: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}
