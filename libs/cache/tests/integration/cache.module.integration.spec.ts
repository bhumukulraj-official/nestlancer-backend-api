import { Test, TestingModule } from '@nestjs/testing';
import { CacheModule } from '../../src/cache.module';
import { CacheService } from '../../src/cache.service';
import { ConfigModule } from '@nestjs/config';

// Mock ioredis
jest.mock('ioredis', () => {
  return jest.fn().mockImplementation(() => ({
    on: jest.fn(),
    get: jest.fn(),
    set: jest.fn(),
    setex: jest.fn(),
    del: jest.fn(),
    exists: jest.fn(),
    quit: jest.fn(),
  }));
});

describe('CacheModule (Integration)', () => {
  let module: TestingModule;
  let service: CacheService;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env.test' }),
        CacheModule.forRoot({ redisUrl: 'redis://localhost:6379' }),
      ],
      providers: [],
    }).compile();

    service = module.get<CacheService>(CacheService);
    await service.onModuleInit();
  });

  afterAll(async () => {
    if (service) {
      await service.onModuleDestroy();
    }
    if (module) {
      await module.close();
    }
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should set and get values from cache', async () => {
    const redisClient = service.getClient();
    (redisClient.get as jest.Mock).mockResolvedValue(JSON.stringify({ foo: 'bar' }));

    await service.set('test-key', { foo: 'bar' });
    const result = await service.get('test-key');

    expect(result).toEqual({ foo: 'bar' });
    expect(redisClient.set).toHaveBeenCalled();
    expect(redisClient.get).toHaveBeenCalledWith('test-key');
  });
});
