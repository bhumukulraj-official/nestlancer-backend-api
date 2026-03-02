import { Test, TestingModule } from '@nestjs/testing';
import { HealthLibModule } from '../../src/health-lib.module';
import { DatabaseHealthIndicator } from '../../src/indicators/database.indicator';
import { RedisHealthIndicator } from '../../src/indicators/redis.indicator';
import { ConfigModule } from '@nestjs/config';

describe('HealthLibModule (Integration)', () => {
  let module: TestingModule;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env.test' }),
        HealthLibModule,
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

  it('should have health indicators registered', () => {
    const dbIndicator = module.get<DatabaseHealthIndicator>(DatabaseHealthIndicator);
    const redisIndicator = module.get<RedisHealthIndicator>(RedisHealthIndicator);

    expect(dbIndicator).toBeDefined();
    expect(redisIndicator).toBeDefined();
  });
});
