import { Injectable, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisPublisherService implements OnModuleDestroy {
    private readonly logger = new Logger(RedisPublisherService.name);
    private readonly publisher: Redis;
    private readonly prefix: string;

    constructor(private readonly configService: ConfigService) {
        this.publisher = new Redis({
            host: this.configService.get('notification-worker.redis.host'),
            port: this.configService.get('notification-worker.redis.port'),
            password: this.configService.get('notification-worker.redis.password'),
        });
        this.prefix = this.configService.get('notification-worker.redis.pubsubPrefix') || 'ws:';
    }

    async publish(channel: string, event: string, data: any): Promise<void> {
        const fullChannel = `${this.prefix}${channel}`;
        const payload = JSON.stringify({ event, data, timestamp: new Date().toISOString() });
        await this.publisher.publish(fullChannel, payload);
        this.logger.debug(`Published to Redis channel ${fullChannel}: ${event}`);
    }

    onModuleDestroy() {
        this.publisher.disconnect();
    }
}
