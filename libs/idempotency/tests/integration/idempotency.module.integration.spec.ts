import { Test, TestingModule } from '@nestjs/testing';
import { IdempotencyModule } from '../../src/idempotency.module';
import { RedisIdempotencyStore } from '../../src/stores/redis.store';
import { DatabaseIdempotencyStore } from '../../src/stores/database.store';
import { IdempotencyInterceptor } from '../../src/idempotency.interceptor';
import { ConfigModule } from '@nestjs/config';

// Mock ioredis
jest.mock('ioredis', () => {
  return jest.fn().mockImplementation(() => ({
    on: jest.fn(),
    connect: jest.fn().mockResolvedValue(undefined),
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
  }));
});

describe('IdempotencyModule (Integration)', () => {
  let module: TestingModule;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env.test' }),
        IdempotencyModule.forRoot(),
      ],
    }).compile();
  });

  afterAll(async () => {
    if (module) {
      await module.close();
    }
  });

  it('should be defined', () => {
    expect(module).toBeDefined();
  });

  it('should have idempotency stores and interceptor registered', () => {
    const redisStore = module.get<RedisIdempotencyStore>(RedisIdempotencyStore);
    const dbStore = module.get<DatabaseIdempotencyStore>(DatabaseIdempotencyStore);
    const interceptor = module.get<IdempotencyInterceptor>(IdempotencyInterceptor);

    expect(redisStore).toBeDefined();
    expect(dbStore).toBeDefined();
    expect(interceptor).toBeDefined();
  });
});
