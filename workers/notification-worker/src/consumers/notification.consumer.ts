import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { QueueConsumerService } from '@nestlancer/queue';
import { NotificationWorkerService } from '../services/notification-worker.service';
import { NotificationJob } from '../interfaces/notification-job.interface';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class NotificationConsumer implements OnModuleInit {
  private readonly logger = new Logger(NotificationConsumer.name);

  constructor(
    private readonly queueConsumer: QueueConsumerService,
    private readonly notificationWorkerService: NotificationWorkerService,
    private readonly configService: ConfigService,
  ) {}

  async onModuleInit() {
    const queueName =
      this.configService.get<string>('notification-worker.rabbitmq.queue') || 'notification.queue';
    this.logger.log(`Starting notification consumer on queue: ${queueName}`);

    await this.queueConsumer.consume(queueName, async (msg) => {
      const content = msg.content.toString();
      try {
        const job: NotificationJob = JSON.parse(content);
        await this.notificationWorkerService.processNotification(job);
      } catch (error: any) {
        this.logger.error(`Error processing notification message: ${content}`, error);
        throw error;
      }
    });
  }
}
