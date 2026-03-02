import { Test, TestingModule } from '@nestjs/testing';
import { CacheModule } from '../../src/cache.module';
import { CacheService } from '../../src/cache.service';

describe('Cache Integration', () => {
    let cacheService: CacheService;

    beforeAll(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [CacheModule.forRoot({ redisUrl: process.env.REDIS_URL || 'redis://localhost:6379' })],
        }).compile();

        cacheService = module.get<CacheService>(CacheService);
        await cacheService.onModuleInit();
    });

    afterAll(async () => {
        await cacheService.onModuleDestroy();
    });

    it('should set, get, and delete values', async () => {
        const key = `test-key-${Date.now()}`;
        const value = { foo: 'bar' };

        // Set
        await cacheService.set(key, value);

        // Exists
        expect(await cacheService.exists(key)).toBe(true);

        // Get
        const result = await cacheService.get<{ foo: string }>(key);
        expect(result).toEqual(value);

        // Delete
        await cacheService.del(key);
        expect(await cacheService.exists(key)).toBe(false);
    });

    it('should respect TTL', async () => {
        const key = `test-ttl-${Date.now()}`;
        await cacheService.set(key, 'value', 1); // 1 second TTL

        expect(await cacheService.exists(key)).toBe(true);

        // Wait 1.1s
        await new Promise(resolve => setTimeout(resolve, 1100));

        expect(await cacheService.exists(key)).toBe(false);
    });

    it('should handle tag-based invalidation', async () => {
        const key1 = `test-tag-1-${Date.now()}`;
        const key2 = `test-tag-2-${Date.now()}`;
        const tag = `test-tag-group-${Date.now()}`;

        await cacheService.set(key1, 'val1');
        await cacheService.set(key2, 'val2');

        await cacheService.tagKey(key1, [tag]);
        await cacheService.tagKey(key2, [tag]);

        expect(await cacheService.exists(key1)).toBe(true);
        expect(await cacheService.exists(key2)).toBe(true);

        await cacheService.invalidateByTag(tag);

        expect(await cacheService.exists(key1)).toBe(false);
        expect(await cacheService.exists(key2)).toBe(false);
    });
});
