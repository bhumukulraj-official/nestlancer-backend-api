import { Test, TestingModule } from '@nestjs/testing';
import { CacheModule } from '../../src/cache.module';
import { CacheService } from '../../src/cache.service';
import { ConfigModule } from '@nestjs/config';

describe('CacheModule (Integration)', () => {
  let module: TestingModule;
  let service: CacheService;

  beforeAll(async () => {
    // Ensure we use the test environment redis url
    const redisUrl = process.env.REDIS_CACHE_URL || 'redis://:dev-rcache-p4q5r6s7t8u9@100.103.64.83:6379/2';
    module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env.test' }),
        CacheModule.forRoot({ redisUrl }),
      ],
    }).compile();

    service = module.get<CacheService>(CacheService);
    await module.init();
  });

  afterAll(async () => {
    if (module) {
      await module.close();
    }
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should set and get values from cache', async () => {
    const key = `test-module-key-${Date.now()}`;
    const value = { foo: 'bar', date: new Date().toISOString() };

    await service.set(key, value);
    const result = await service.get(key);

    expect(result).toEqual(value);

    // Cleanup
    await service.del(key);
    const exists = await service.exists(key);
    expect(exists).toBe(false);
  });
});
