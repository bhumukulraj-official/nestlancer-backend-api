/**
 * E2E RabbitMQ Helper
 *
 * Utilities for publishing and consuming messages from RabbitMQ
 * to assert worker behavior in E2E tests.
 */

import * as amqp from 'amqplib';

export interface RabbitMQConfig {
  url?: string;
}

export class E2ERabbitMQHelper {
  private connection: amqp.Connection | null = null;
  private channel: amqp.Channel | null = null;
  private url: string;

  constructor(config: RabbitMQConfig = {}) {
    this.url = config.url || process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672';
  }

  /**
   * Connect to RabbitMQ and create a channel.
   */
  async connect(): Promise<void> {
    this.connection = await amqp.connect(this.url);
    this.channel = await this.connection.createChannel();
  }

  /**
   * Disconnect from RabbitMQ.
   */
  async disconnect(): Promise<void> {
    if (this.channel) {
      await this.channel.close().catch(() => {});
      this.channel = null;
    }
    if (this.connection) {
      await this.connection.close().catch(() => {});
      this.connection = null;
    }
  }

  /**
   * Publish a message to an exchange.
   */
  async publishToExchange(
    exchange: string,
    routingKey: string,
    message: any,
    options?: amqp.Options.Publish,
  ): Promise<void> {
    if (!this.channel) throw new Error('Not connected to RabbitMQ');

    await this.channel.assertExchange(exchange, 'topic', { durable: true });
    this.channel.publish(exchange, routingKey, Buffer.from(JSON.stringify(message)), {
      contentType: 'application/json',
      persistent: true,
      ...options,
    });
  }

  /**
   * Publish a message directly to a queue.
   */
  async publishToQueue(queue: string, message: any): Promise<void> {
    if (!this.channel) throw new Error('Not connected to RabbitMQ');

    await this.channel.assertQueue(queue, { durable: true });
    this.channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)), {
      contentType: 'application/json',
      persistent: true,
    });
  }

  /**
   * Consume a single message from a queue with timeout.
   */
  async consumeOne(queue: string, timeoutMs: number = 10000): Promise<any | null> {
    if (!this.channel) throw new Error('Not connected to RabbitMQ');

    await this.channel.assertQueue(queue, { durable: true });

    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        resolve(null); // Timeout – no message received
      }, timeoutMs);

      this.channel!.consume(
        queue,
        (msg) => {
          if (msg) {
            clearTimeout(timer);
            this.channel!.ack(msg);
            try {
              resolve(JSON.parse(msg.content.toString()));
            } catch {
              resolve(msg.content.toString());
            }
          }
        },
        { noAck: false },
      ).catch(reject);
    });
  }

  /**
   * Purge all messages from a queue.
   */
  async purgeQueue(queue: string): Promise<void> {
    if (!this.channel) throw new Error('Not connected to RabbitMQ');
    await this.channel.purgeQueue(queue).catch(() => {});
  }

  /**
   * Delete a queue.
   */
  async deleteQueue(queue: string): Promise<void> {
    if (!this.channel) throw new Error('Not connected to RabbitMQ');
    await this.channel.deleteQueue(queue).catch(() => {});
  }

  /**
   * Get the message count in a queue.
   */
  async getQueueMessageCount(queue: string): Promise<number> {
    if (!this.channel) throw new Error('Not connected to RabbitMQ');
    const info = await this.channel.assertQueue(queue, { durable: true });
    return info.messageCount;
  }
}

/**
 * Create a new RabbitMQ helper.
 */
export function createRabbitMQHelper(config?: RabbitMQConfig): E2ERabbitMQHelper {
  return new E2ERabbitMQHelper(config);
}
