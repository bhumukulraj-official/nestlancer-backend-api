import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { QueueConsumerService } from '@nestlancer/queue';
import { EmailWorkerService } from '../services/email-worker.service';
import { EmailJob } from '../interfaces/email-job.interface';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailConsumer implements OnModuleInit {
  private readonly logger = new Logger(EmailConsumer.name);

  constructor(
    private readonly queueConsumer: QueueConsumerService,
    private readonly emailWorkerService: EmailWorkerService,
    private readonly configService: ConfigService,
  ) { }

  async onModuleInit() {
    const queueName =
      this.configService.get<string>('emailWorker.rabbitmq.queue') || 'email.queue';
    this.logger.log(`Starting email consumer on queue: ${queueName}`);

    await this.queueConsumer.consume(queueName, async (msg) => {
      const content = msg.content.toString();
      try {
        const job: EmailJob = JSON.parse(content);
        this.logger.debug(`[EmailConsumer] Received job: ${job.type} to ${job.to}`);
        await this.emailWorkerService.processEmail(job);
      } catch (error: any) {
        this.logger.error(
          `[EmailConsumer] Catastrophic error processing message: ${content.substring(0, 100)}...`,
          error.stack,
        );
        // Throwing will trigger nack in QueueConsumerService
        throw error;
      }
    });
  }
}
