import { Injectable, Logger } from '@nestjs/common';
import { QueuePublisherService } from '@nestlancer/queue';
import { OutboxEvent } from '../interfaces/outbox-event.interface';

@Injectable()
export class OutboxPublisherService {
    private readonly logger = new Logger(OutboxPublisherService.name);

    constructor(private readonly queuePublisher: QueuePublisherService) { }

    async publish(event: OutboxEvent): Promise<void> {
        const exchange = this.getExchangeForEvent(event.eventType);
        const routingKey = event.eventType;

        this.logger.debug(`Publishing event ${event.id} to exchange ${exchange} with routing key ${routingKey}`);

        await this.queuePublisher.publish(exchange, routingKey, event.payload, {
            messageId: event.id,
            timestamp: event.createdAt.getTime(),
            persistent: true,
        });
    }

    private getExchangeForEvent(eventType: string): string {
        if (eventType.startsWith('payment.')) return 'nestlancer.payments'; // Adjusted based on project standards
        if (eventType.startsWith('notification.')) return 'nestlancer.notifications';
        if (eventType.startsWith('email.')) return 'nestlancer.email';
        if (eventType.startsWith('message.')) return 'nestlancer.messaging';
        if (eventType.startsWith('media.')) return 'nestlancer.media';
        if (eventType.startsWith('cdn.')) return 'nestlancer.cdn';

        // Default to a generic events exchange if not specifically mapped
        return 'nestlancer.events';
    }
}
