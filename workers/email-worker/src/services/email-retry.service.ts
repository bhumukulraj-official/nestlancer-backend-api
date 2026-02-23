import { Injectable, Logger } from '@nestjs/common';
import { QueuePublisherService, DlqService } from '@nestlancer/queue';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailRetryService {
    private readonly logger = new Logger(EmailRetryService.name);
    private readonly MAX_RETRIES = 3;

    constructor(
        private readonly publisher: QueuePublisherService,
        private readonly dlqService: DlqService,
        private readonly configService: ConfigService,
    ) { }

    async handleFailure(queueName: string, message: any, error: any): Promise<void> {
        const retryCount = (message.retryCount || 0) + 1;

        if (retryCount > this.MAX_RETRIES) {
            this.logger.error(`Max retries exceeded for message. Sending to DLQ.`, error);
            await this.dlqService.sendToDlq(queueName, message, error.message);
            return;
        }

        const delay = this.getDelayForRetry(retryCount);
        this.logger.warn(`Retry #${retryCount} scheduled for email in ${delay}ms`);

        // In a real RabbitMQ setup, we'd use a delay exchange or TTL queue.
        // For this implementation, we'll simulate it by re-queueing with updated metadata
        // after a setTimeout if it's a small delay, OR we just re-queue immediately if no delay infra.

        const updatedMessage = { ...message, retryCount };

        // Simulate delay for retry (Not recommended for high volume, but fits simple requirement)
        setTimeout(async () => {
            await this.publisher.sendToQueue(queueName, updatedMessage);
        }, delay);
    }

    private getDelayForRetry(retryCount: number): number {
        // 1min, 5min, 30min in ms
        const delays = [60000, 300000, 1800000];
        return delays[retryCount - 1] || delays[delays.length - 1];
    }
}
