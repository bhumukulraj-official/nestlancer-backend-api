import { IoAdapter } from '@nestjs/platform-socket.io';
import { ServerOptions } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import Redis from 'ioredis';
import { INestApplication, Logger } from '@nestjs/common';
import { NestlancerConfigService } from '@nestlancer/config';

export class CustomRedisIoAdapter extends IoAdapter {
    private adapterConstructor!: ReturnType<typeof createAdapter>;
    private readonly logger = new Logger(CustomRedisIoAdapter.name);

    constructor(private app: INestApplication) {
        super(app);
    }

    async connectToRedis(): Promise<void> {
        const configService = this.app.get(NestlancerConfigService);
        const redisUrl = configService.redisPubSubUrl;

        this.logger.log(`Connecting to Redis for WebSockets at ${redisUrl}...`);

        const pubClient = new Redis(redisUrl);
        const subClient = pubClient.duplicate();

        await Promise.all([pubClient.ping(), subClient.ping()]);

        this.adapterConstructor = createAdapter(pubClient, subClient);
        this.logger.log('Redis pub/sub adapter connected successfully.');
    }

    createIOServer(port: number, options?: ServerOptions): any {
        const server = super.createIOServer(port, {
            ...options,
            cors: {
                origin: '*',
                credentials: true,
            },
        });

        if (this.adapterConstructor) {
            server.adapter(this.adapterConstructor);
        } else {
            this.logger.warn('Redis adapter not initialized. Fallback to in-memory adapter.');
        }

        return server;
    }
}
