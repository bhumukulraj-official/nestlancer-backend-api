import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class LeaderElectionService {
    private readonly logger = new Logger(LeaderElectionService.name);
    private readonly redis: Redis;
    private readonly lockKey: string;
    private readonly lockTtl: number;
    private readonly instanceId: string;

    constructor(private readonly configService: ConfigService) {
        const redisUrl = this.configService.get<string>('REDIS_CACHE_URL') || '';
        this.redis = new Redis(redisUrl);
        this.lockKey = this.configService.get<string>('outbox.leaderLockKey') || 'outbox:lock';
        this.lockTtl = this.configService.get<number>('outbox.lockTtlSeconds') || 10;
        this.instanceId = this.configService.get<string>('outbox.instanceId') || 'unknown';
    }

    async acquireLock(): Promise<boolean> {
        try {
            const result = await this.redis.set(
                this.lockKey,
                this.instanceId,
                'EX',
                this.lockTtl,
                'NX'
            );

            if (result === 'OK') {
                this.logger.debug(`Instance ${this.instanceId} acquired leader lock`);
                return true;
            }

            // If already held by this instance, renew it
            const currentValue = await this.redis.get(this.lockKey);
            if (currentValue === this.instanceId) {
                await this.redis.expire(this.lockKey, this.lockTtl);
                return true;
            }

            return false;
        } catch (e: any) {
            const error = e as Error;
            this.logger.error(`Failed to acquire leader lock: ${error.message}`, error.stack);
            return false;
        }
    }

    async releaseLock(): Promise<void> {
        try {
            const currentValue = await this.redis.get(this.lockKey);
            if (currentValue === this.instanceId) {
                await this.redis.del(this.lockKey);
                this.logger.debug(`Instance ${this.instanceId} released leader lock`);
            }
        } catch (e: any) {
            const error = e as Error;
            this.logger.error(`Failed to release leader lock: ${error.message}`, error.stack);
        }
    }

    isLeader(): Promise<boolean> {
        return this.redis.get(this.lockKey).then((val) => val === this.instanceId);
    }
}
