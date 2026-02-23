import { Injectable, Inject, OnModuleInit, Logger } from '@nestjs/common';
import * as amqp from 'amqplib';

@Injectable()
export class QueueConsumerService implements OnModuleInit {
  private readonly logger = new Logger(QueueConsumerService.name);
  private connection!: amqp.Connection;
  private channel!: amqp.Channel;

  constructor(@Inject('QUEUE_OPTIONS') private readonly options: { url?: string }) {}

  async onModuleInit(): Promise<void> {
    const url = this.options.url || process.env.RABBITMQ_URL || 'amqp://localhost:5672';
    this.connection = await amqp.connect(url);
    this.channel = await this.connection.createChannel();
    await this.channel.prefetch(1);
    this.logger.log('Queue consumer connected');
  }

  async consume(queue: string, handler: (msg: amqp.ConsumeMessage) => Promise<void>): Promise<void> {
    await this.channel.assertQueue(queue, { durable: true });
    await this.channel.consume(queue, async (msg) => {
      if (!msg) return;
      try {
        await handler(msg);
        this.channel.ack(msg);
      } catch (error) {
        this.logger.error(`Error processing message from ${queue}:`, error);
        this.channel.nack(msg, false, false);
      }
    });
  }

  getChannel(): amqp.Channel { return this.channel; }
}
