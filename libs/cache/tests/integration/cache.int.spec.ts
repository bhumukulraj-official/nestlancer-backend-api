import { Test, TestingModule } from '@nestjs/testing';
import { CacheModule } from '../../src/cache.module';
import { CacheService } from '../../src/cache.service';

// Provide an in-memory Redis mock so these integration tests
// don't depend on a real Redis instance being available.
jest.mock('ioredis', () => {
  const store = new Map<string, { value: string; expiresAt?: number }>();

  class MockRedis {
    on() {
      return this;
    }

    async get(key: string) {
      const entry = store.get(key);
      if (!entry) return null;
      if (entry.expiresAt && Date.now() > entry.expiresAt) {
        store.delete(key);
        return null;
      }
      return entry.value;
    }

    async set(key: string, value: string) {
      store.set(key, { value });
      return 'OK';
    }

    async setex(key: string, ttlSeconds: number, value: string) {
      store.set(key, { value, expiresAt: Date.now() + ttlSeconds * 1000 });
      return 'OK';
    }

    async del(key: string) {
      store.delete(key);
      return 1;
    }

    async exists(key: string) {
      const entry = store.get(key);
      if (!entry) return 0;
      if (entry.expiresAt && Date.now() > entry.expiresAt) {
        store.delete(key);
        return 0;
      }
      return 1;
    }

    async sadd(key: string, member: string) {
      const existing = store.get(key);
      const current = existing ? JSON.parse(existing.value) : [];
      const set = new Set<string>(current);
      set.add(member);
      store.set(key, { value: JSON.stringify([...set]) });
      return 1;
    }

    async smembers(key: string) {
      const entry = store.get(key);
      if (!entry) return [];
      try {
        const parsed = JSON.parse(entry.value);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }

    async quit() {
      store.clear();
      return 'OK';
    }
  }

  return jest.fn(() => new MockRedis());
});

describe('Cache Integration', () => {
  let cacheService: CacheService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [CacheModule.forRoot({ redisUrl: 'redis://localhost:6379' })],
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

    await cacheService.set(key, value);

    expect(await cacheService.exists(key)).toBe(true);

    const result = await cacheService.get<{ foo: string }>(key);
    expect(result).toEqual(value);

    await cacheService.del(key);
    expect(await cacheService.exists(key)).toBe(false);
  });

  it('should respect TTL', async () => {
    jest.setTimeout(10000);
    const key = `test-ttl-${Date.now()}`;
    await cacheService.set(key, 'value', 1);

    expect(await cacheService.exists(key)).toBe(true);

    await new Promise((resolve) => setTimeout(resolve, 1100));

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
