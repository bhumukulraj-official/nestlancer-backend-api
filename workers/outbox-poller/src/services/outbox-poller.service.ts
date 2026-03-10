import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaWriteService } from '@nestlancer/database';
import { LeaderElectionService } from './leader-election.service';
import { OutboxPublisherService } from './outbox-publisher.service';
import { ConfigService } from '@nestjs/config';
import { OutboxEventStatus } from '../interfaces/outbox-event.interface';

/**
 * Background polling service for Transactional Outbox events.
 * Implements leader election to ensure only a single instance polls the database.
 * Periodically fetches pending events and publishes them to RabbitMQ.
 */
@Injectable()
export class OutboxPollerService {
  private readonly logger = new Logger(OutboxPollerService.name);
  private readonly batchSize: number;
  private isProcessing = false;

  constructor(
    private readonly prisma: PrismaWriteService,
    private readonly leaderElection: LeaderElectionService,
    private readonly publisher: OutboxPublisherService,
    private readonly configService: ConfigService,
  ) {
    this.batchSize = this.configService.get<number>('outbox.batchSize') || 100;
  }

  /**
   * Periodic scheduled task to poll the outbox table.
   * Checks for leadership status before proceeding to avoid race conditions.
   */
  @Cron('*/5 * * * * *') // Runs every 5 seconds
  async poll(): Promise<void> {
    if (this.isProcessing) return;

    const isLeader = await this.leaderElection.acquireLock();
    if (!isLeader) {
      // This instance is not the leader; skipping poll cycle.
      return;
    }

    this.isProcessing = true;
    try {
      await this.processBatch();
    } catch (e: any) {
      const error = e as Error;
      this.logger.error(
        `[OutboxPoller] Critical error in polling cycle: ${error.message}`,
        error.stack,
      );
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Fetches and processes a batch of pending outbox events.
   * Updates event status and retry counts based on publication success.
   */
  private async processBatch(): Promise<void> {
    // Fetch pending events ordered by creation time for fairness
    const events = await (this.prisma as any).outbox.findMany({
      where: { status: OutboxEventStatus.PENDING },
      orderBy: { createdAt: 'asc' },
      take: this.batchSize,
    });

    if (events.length === 0) return;

    this.logger.debug(
      `[OutboxPoller] Found ${events.length} pending events. Starting publication batch.`,
    );

    for (const event of events) {
      try {
        // 1. Publish to the appropriate RabbitMQ exchange
        await this.publisher.publish(event as any);

        // 2. Mark event as successfully published
        await (this.prisma as any).outbox.update({
          where: { id: event.id },
          data: {
            status: OutboxEventStatus.PUBLISHED,
            publishedAt: new Date(),
          },
        });
      } catch (e: any) {
        const error = e as Error;
        this.logger.error(
          `[OutboxPoller] Publication failed for EventID ${event.id}: ${error.message}`,
        );

        // 3. Increment retry count and mark as FAILED if limit reached
        await (this.prisma as any).outbox.update({
          where: { id: event.id },
          data: {
            retries: { increment: 1 },
            error: error.message,
            status:
              (event as any).retries >= 5 ? OutboxEventStatus.FAILED : OutboxEventStatus.PENDING,
          },
        });
      }
    }
  }
}
