import { Injectable, Inject, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import * as amqp from 'amqplib';

@Injectable()
export class QueuePublisherService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(QueuePublisherService.name);
  private connection!: any;
  private channel!: amqp.Channel;

  constructor(@Inject('QUEUE_OPTIONS') private readonly options: { url?: string }) { }

  async onModuleInit(): Promise<void> {
    const url = this.options.url || process.env.RABBITMQ_URL || 'amqp://localhost:5672';
    this.connection = (await amqp.connect(url)) as any;
    this.channel = await this.connection.createChannel();
    this.logger.log('Queue publisher connected');
  }

  async onModuleDestroy(): Promise<void> {
    await this.channel?.close();
    await this.connection?.close();
  }

  async publish(exchange: string, routingKey: string, payload: unknown, options?: amqp.Options.Publish): Promise<void> {
    const message = Buffer.from(JSON.stringify(payload));
    this.channel.publish(exchange, routingKey, message, {
      persistent: true,
      contentType: 'application/json',
      timestamp: Date.now(),
      ...options,
    });
  }

  async sendToQueue(queue: string, payload: unknown, options?: amqp.Options.Publish): Promise<void> {
    const message = Buffer.from(JSON.stringify(payload));
    this.channel.sendToQueue(queue, message, { persistent: true, contentType: 'application/json', ...options });
  }
}
