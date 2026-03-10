import { Injectable, Logger } from '@nestjs/common';
import { QueuePublisherService } from '@nestlancer/queue';
import { OutboxEvent } from '../interfaces/outbox-event.interface';

/**
 * Specialized publisher service for the Transactional Outbox.
 * Maps event types to their dedicated RabbitMQ exchanges.
 */
@Injectable()
export class OutboxPublisherService {
  private readonly logger = new Logger(OutboxPublisherService.name);

  constructor(private readonly queuePublisher: QueuePublisherService) {}

  /**
   * Publishes an outbox event to RabbitMQ with appropriate metadata.
   *
   * @param event - The outbox event record from the database
   * @returns A promise resolving when the event is confirmed by the broker
   */
  async publish(event: OutboxEvent): Promise<void> {
    const exchange = this.getExchangeForEvent(event.eventType);
    const routingKey = event.eventType;

    this.logger.debug(
      `[OutboxPublisher] Publishing EventID ${event.id} | Exchange: ${exchange} | Key: ${routingKey}`,
    );

    await this.queuePublisher.publish(exchange, routingKey, event.payload, {
      messageId: event.id,
      timestamp: event.createdAt.getTime(),
      persistent: true,
    });
  }

  /**
   * Determines the correct AMQP exchange for an event type based on prefix.
   * Helps maintain domain isolation at the messaging layer.
   *
   * @param eventType - The type of event (e.g. 'payment.succeeded')
   * @returns The name of the RabbitMQ exchange
   */
  private getExchangeForEvent(eventType: string): string {
    if (eventType.startsWith('payment.')) return 'nestlancer.payments';
    if (eventType.startsWith('notification.')) return 'nestlancer.notifications';
    if (eventType.startsWith('email.')) return 'nestlancer.email';
    if (eventType.startsWith('message.')) return 'nestlancer.messaging';
    if (eventType.startsWith('media.')) return 'nestlancer.media';
    if (eventType.startsWith('cdn.')) return 'nestlancer.cdn';

    // Default exchange for generic system events
    return 'nestlancer.events';
  }
}
