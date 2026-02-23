import { Injectable, Logger } from '@nestjs/common';
import { PrismaWriteService } from '@nestlancer/database';
import { RedisPublisherService } from '../services/redis-publisher.service';
import { NotificationJob } from '../interfaces/notification-job.interface';

@Injectable()
export class InAppNotificationProcessor {
    private readonly logger = new Logger(InAppNotificationProcessor.name);

    constructor(
        private readonly prisma: PrismaWriteService,
        private readonly redisPublisher: RedisPublisherService,
    ) { }

    async process(job: NotificationJob): Promise<void> {
        const { userId, notification, priority } = job;
        this.logger.log(`Processing in-app notification for user ${userId}`);

        try {
            const created = await this.prisma.notification.create({
                data: {
                    userId,
                    type: job.type,
                    title: notification.title,
                    message: notification.message,
                    data: notification.data,
                    actionUrl: notification.actionUrl,
                    priority: (priority as any) || 'NORMAL',
                    channels: job.channels,
                },
            });

            // Publish to Redis for real-time WebSocket delivery
            await this.redisPublisher.publish(`user:${userId}`, 'notification.new', created);

            this.logger.log(`In-app notification created for user ${userId}: ${created.id}`);
        } catch (error) {
            this.logger.error(`Failed to process in-app notification for user ${userId}:`, error);
            throw error;
        }
    }
}
