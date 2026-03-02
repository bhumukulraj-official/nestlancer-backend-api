import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule as NestlancerConfigModule } from '../../src/config.module';
import { NestlancerConfigService } from '../../src/config.service';
import { ConfigModule } from '@nestjs/config';

describe('ConfigModule (Integration)', () => {
  let module: TestingModule;
  let service: NestlancerConfigService;

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    process.env.DATABASE_URL = 'postgres://localhost:5432/db';
    process.env.REDIS_CACHE_URL = 'redis://localhost:6379';
    process.env.RABBITMQ_URL = 'amqp://localhost';
    process.env.JWT_ACCESS_SECRET = 'secret1234567890';
    process.env.JWT_REFRESH_SECRET = 'secret1234567890';

    module = await Test.createTestingModule({
      imports: [
        NestlancerConfigModule.forRoot(),
      ],
    }).compile();

    service = module.get<NestlancerConfigService>(NestlancerConfigService);
  });

  afterAll(async () => {
    if (module) {
      await module.close();
    }
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return correct configuration values', () => {
    expect(service.nodeEnv).toBe('test');
    expect(service.isTest).toBe(true);
    expect(service.databaseUrl).toBe('postgres://localhost:5432/db');
    expect(service.redisCacheUrl).toBe('redis://localhost:6379');
  });

  it('should return default values for optional keys', () => {
    expect(service.appName).toBe('Nestlancer');
    expect(service.port).toBe(3000);
  });
});
