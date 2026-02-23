import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaWriteService } from '@nestlancer/database';
import { LeaderElectionService } from './leader-election.service';
import { OutboxPublisherService } from './outbox-publisher.service';
import { ConfigService } from '@nestjs/config';
import { OutboxEventStatus } from '../interfaces/outbox-event.interface';

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
        this.batchSize = this.configService.get<number>('outbox.batchSize');
    }

    @Cron('*/2 * * * * *') // Every 2 seconds
    async poll() {
        if (this.isProcessing) return;

        const isLeader = await this.leaderElection.acquireLock();
        if (!isLeader) return;

        this.isProcessing = true;
        try {
            await this.processBatch();
        } catch (error) {
            this.logger.error(`Error in outbox polling loop: ${error.message}`, error.stack);
        } finally {
            this.isProcessing = false;
        }
    }

    private async processBatch() {
        // 1. Fetch pending events
        const events = await this.prisma.outboxEvent.findMany({
            where: { status: OutboxEventStatus.PENDING },
            orderBy: { createdAt: 'asc' },
            take: this.batchSize,
        });

        if (events.length === 0) return;

        this.logger.log(`Processing ${events.length} outbox events`);

        for (const event of events) {
            try {
                // 2. Publish to RabbitMQ
                await this.publisher.publish(event as any);

                // 3. Mark as published
                await this.prisma.outboxEvent.update({
                    where: { id: event.id },
                    data: {
                        status: OutboxEventStatus.PUBLISHED,
                        publishedAt: new Date(),
                    },
                });
            } catch (error) {
                this.logger.error(`Failed to process outbox event ${event.id}: ${error.message}`);

                // 4. Update retry count or mark as failed
                await this.prisma.outboxEvent.update({
                    where: { id: event.id },
                    data: {
                        retryCount: { increment: 1 },
                        lastError: error.message,
                        status: event.retryCount >= 5 ? OutboxEventStatus.FAILED : OutboxEventStatus.PENDING,
                    },
                });
            }
        }
    }
}
