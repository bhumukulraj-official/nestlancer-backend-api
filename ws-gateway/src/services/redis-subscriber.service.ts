import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import Redis from 'ioredis';
import { NestlancerConfigService } from '@nestlancer/config';
import { NotificationGateway } from '../gateways/notification.gateway';

const REDIS_CHANNEL_PREFIX = 'ws:';
const REDIS_PATTERN = 'ws:user:*';

@Injectable()
export class RedisSubscriberService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisSubscriberService.name);
  private subscriber: Redis | null = null;

  constructor(
    private readonly configService: NestlancerConfigService,
    private readonly moduleRef: ModuleRef,
  ) {}

  async onModuleInit() {
    const redisUrl = this.configService.redisPubSubUrl;
    this.subscriber = new Redis(redisUrl);
    this.subscriber.on('error', (err) =>
      this.logger.error(`Redis subscriber error: ${err.message}`),
    );

    this.subscriber.psubscribe(REDIS_PATTERN);
    this.subscriber.on('pmessage', (pattern, channel, message) =>
      this.handleMessage(channel, message),
    );
    this.logger.log(`Subscribed to Redis pattern ${REDIS_PATTERN}`);
  }

  onModuleDestroy() {
    if (this.subscriber) {
      this.subscriber.disconnect();
      this.subscriber = null;
      this.logger.log('Redis subscriber disconnected');
    }
  }

  private async handleMessage(channel: string, message: string): Promise<void> {
    try {
      const userId = channel.startsWith(REDIS_CHANNEL_PREFIX + 'user:')
        ? channel.slice((REDIS_CHANNEL_PREFIX + 'user:').length)
        : null;
      if (!userId) return;

      const payload = JSON.parse(message) as { event?: string; data?: unknown; timestamp?: string };
      const event = payload?.event ?? 'notification:new';
      const data = payload?.data ?? payload;

      const notificationGateway = this.moduleRef.get(NotificationGateway, { strict: false });
      if (notificationGateway) {
        notificationGateway.emitToUser(userId, event, data);
      }
    } catch (error: any) {
      this.logger.warn(`Failed to handle Redis message on ${channel}: ${(error as Error).message}`);
    }
  }
}
