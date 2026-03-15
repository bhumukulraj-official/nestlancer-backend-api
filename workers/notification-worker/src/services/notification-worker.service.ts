import { Injectable, Logger } from '@nestjs/common';
import { NotificationJob, NotificationChannel } from '@nestlancer/common';
import { InAppNotificationProcessor } from '../processors/in-app-notification.processor';
import { PushProviderService } from './push-provider.service';
import { NotificationRetryService } from './notification-retry.service';
import { PrismaWriteService } from '@nestlancer/database';

/**
 * Orchestrator service for the Notification Worker.
 * Handles delivery of across multiple channels (In-App, Push, Email).
 * Manages user notification preference checks and channel-specific dispatching.
 */
@Injectable()
export class NotificationWorkerService {
  private readonly logger = new Logger(NotificationWorkerService.name);

  constructor(
    private readonly inAppProcessor: InAppNotificationProcessor,
    private readonly pushProvider: PushProviderService,
    private readonly prisma: PrismaWriteService,
    private readonly retryService: NotificationRetryService,
  ) { }

  /**
   * Processes a notification job by dispatching to all requested channels.
   * Uses parallel execution (Promise.allSettled) for reliability across channels.
   *
   * @param job - The notification job containing content and target channels
   * @returns A promise that resolves when all delivery attempts have settled
   */
  async processNotification(job: NotificationJob): Promise<void> {
    const { userId, channels = [NotificationChannel.IN_APP] } = job;
    this.logger.log(
      `[NotificationWorker] Dispatching notification for UserID: ${userId} | Channels: ${channels.join(', ')}`,
    );

    const results = await Promise.allSettled(
      channels.map(async (channel) => {
        switch (channel) {
          case NotificationChannel.IN_APP:
            return this.inAppProcessor.process(job);
          case NotificationChannel.PUSH:
            return this.processPushNotification(job);
          default:
            this.logger.warn(
              `[NotificationWorker] Channel ${channel} is currently not implemented/supported.`,
            );
        }
      }),
    );

    // Aggregate and log delivery results
    for (let i = 0; i < results.length; i++) {
      const res = results[i];
      if (res.status === 'rejected') {
        const channel = channels[i];
        this.logger.error(`[NotificationWorker] Failure in channel ${channel}: ${res.reason?.message || res.reason}`);

        // For PUSH notifications, we trigger the retry service
        if (channel === NotificationChannel.PUSH) {
          await this.retryService.handleFailure(job, res.reason);
        }
      }
    }
  }

  /**
   * Handles push notification delivery to all registered devices of a user.
   * Automatically prunes invalid/expired subscriptions based on provider feedback.
   *
   * @param job - The notification job containing content
   * @returns A promise that resolves when all push attempts are complete
   */
  private async processPushNotification(job: NotificationJob): Promise<void> {
    const subscriptions = await this.prisma.userPushSubscription.findMany({
      where: { userId: job.userId },
    });

    if (subscriptions.length === 0) {
      this.logger.debug(`[NotificationWorker] No push tokens found for UserID: ${job.userId}`);
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
        // Subscription is stale, remove from database
        this.logger.log(`[NotificationWorker] Pruning invalid push subscription ID: ${sub.id}`);
        await this.prisma.userPushSubscription.delete({ where: { id: sub.id } });
      }
    }
  }
}
