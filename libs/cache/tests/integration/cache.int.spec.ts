import { Test, TestingModule } from '@nestjs/testing';
import { CacheService } from '../../src/cache.service';
import { setupTestRedis, teardownTestRedis, resetTestRedis } from '@nestlancer/testing';

describe('CacheService (Integration)', () => {
    let service: CacheService;

    beforeAll(async () => {
        // Ensure REDIS_URL is set for the service to connect
        process.env.REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
        await setupTestRedis();
    });

    afterAll(async () => {
        await teardownTestRedis();
    });

    beforeEach(async () => {
        await resetTestRedis();

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                CacheService,
                {
                    provide: 'CACHE_OPTIONS',
                    useValue: { redisUrl: process.env.REDIS_URL },
                },
            ],
        }).compile();

        service = module.get<CacheService>(CacheService);
        await service.onModuleInit();
    });

    afterEach(async () => {
        await service.onModuleDestroy();
    });

    it('should set and get a value', async () => {
        const key = 'test-key';
        const value = { name: 'Nestlancer', type: 'Platform' };

        await service.set(key, value);
        const retrieved = await service.get(key);

        expect(retrieved).toEqual(value);
    });

    it('should respect TTL', async () => {
        const key = 'ttl-key';
        const value = 'transient';

        await service.set(key, value, 1); // 1 second
        expect(await service.get(key)).toEqual(value);

        // Wait for TTL to expire
        await new Promise(resolve => setTimeout(resolve, 1100));
        expect(await service.get(key)).toBeNull();
    });

    it('should handle tagging and invalidation', async () => {
        const tag = 'user:123';
        const key1 = 'user:123:profile';
        const key2 = 'user:123:settings';

        await service.set(key1, { profile: 'data' });
        await service.set(key2, { settings: 'data' });

        await service.tagKey(key1, [tag]);
        await service.tagKey(key2, [tag]);

        // Verify they exist
        expect(await service.get(key1)).toBeDefined();
        expect(await service.get(key2)).toBeDefined();

        // Invalidate by tag
        await service.invalidateByTag(tag);

        // Verify they are gone
        expect(await service.get(key1)).toBeNull();
        expect(await service.get(key2)).toBeNull();
    });
});
