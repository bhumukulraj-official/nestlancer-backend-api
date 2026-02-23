import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaWriteService } from '@nestlancer/database';
import { ConfigService } from '@nestjs/config';
import { OutboxEventStatus } from '../interfaces/outbox-event.interface';

@Injectable()
export class StaleEventMonitorService {
    private readonly logger = new Logger(StaleEventMonitorService.name);
    private readonly staleThresholdMinutes: number;

    constructor(
        private readonly prisma: PrismaWriteService,
        private readonly configService: ConfigService,
    ) {
        this.staleThresholdMinutes = this.configService.get<number>('outbox.staleThresholdMinutes');
    }

    @Cron('0 */5 * * * *') // Every 5 minutes
    async checkStaleEvents() {
        this.logger.debug('Checking for stale outbox events');

        const staleDate = new Date();
        staleDate.setMinutes(staleDate.getMinutes() - this.staleThresholdMinutes);

        const staleCount = await this.prisma.outboxEvent.count({
            where: {
                status: OutboxEventStatus.PENDING,
                createdAt: { lt: staleDate },
            },
        });

        if (staleCount > 0) {
            this.logger.warn(`Found ${staleCount} stale outbox events (older than ${this.staleThresholdMinutes} min)`);
            // In a real system, this might trigger an alert or an admin notification event
        }
    }
}
