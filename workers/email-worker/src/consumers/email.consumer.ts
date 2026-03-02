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
        const queueName = this.configService.get<string>('email-worker.rabbitmq.queue') || 'email.queue';
        this.logger.log(`Starting email consumer on queue: ${queueName}`);

        await this.queueConsumer.consume(queueName, async (msg) => {
            const content = msg.content.toString();
            try {
                const job: EmailJob = JSON.parse(content);
                await this.emailWorkerService.processEmail(job);
            } catch (error: any) {
                this.logger.error(`Error processing email message: ${content}`, error);
                throw error; // Let QueueConsumerService handle nack
            }
        });
    }
}
