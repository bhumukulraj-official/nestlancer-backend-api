import { Injectable, Logger } from '@nestjs/common';
import { NotificationJob, NotificationChannel } from '../interfaces/notification-job.interface';
import { InAppNotificationProcessor } from '../processors/in-app-notification.processor';
import { PushProviderService } from './push-provider.service';
import { PrismaWriteService } from '@nestlancer/database';

@Injectable()
export class NotificationWorkerService {
    private readonly logger = new Logger(NotificationWorkerService.name);

    constructor(
        private readonly inAppProcessor: InAppNotificationProcessor,
        private readonly pushProvider: PushProviderService,
        private readonly prisma: PrismaWriteService,
    ) { }

    async processNotification(job: NotificationJob): Promise<void> {
        const { userId, channels = [NotificationChannel.IN_APP] } = job;
        this.logger.log(`Processing notification for user ${userId}, channels: ${channels.join(', ')}`);

        const results = await Promise.allSettled(
            channels.map(async (channel) => {
                switch (channel) {
                    case NotificationChannel.IN_APP:
                        return this.inAppProcessor.process(job);
                    case NotificationChannel.PUSH:
                        return this.processPushNotification(job);
                    default:
                        this.logger.warn(`Channel ${channel} not yet implemented`);
                }
            }),
        );

        // Logs results
        results.forEach((res, index) => {
            if (res.status === 'rejected') {
                this.logger.error(`Failed to deliver via channel ${channels[index]}:`, res.reason);
            }
        });

        // We consider it a success if at least one channel worked or we decide based on business logic
    }

    private async processPushNotification(job: NotificationJob) {
        const subscriptions = await this.prisma.userPushSubscription.findMany({
            where: { userId: job.userId },
        });

        if (subscriptions.length === 0) {
            this.logger.debug(`No push subscriptions found for user ${job.userId}`);
            return;
        }

        for (const sub of subscriptions) {
            const success = await this.pushProvider.sendNotification(sub.subscription, {
                title: job.notification.title,
                body: job.notification.message,
                data: {
                    url: job.notification.actionUrl,
                    type: job.type,
                },
            });

            if (!success) {
                // Remove invalid subscription
                await this.prisma.userPushSubscription.delete({ where: { id: sub.id } });
            }
        }
    }
}
