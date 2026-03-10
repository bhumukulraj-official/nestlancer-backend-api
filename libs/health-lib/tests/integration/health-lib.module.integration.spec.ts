import { Test, TestingModule } from '@nestjs/testing';
import { HealthLibModule } from '../../src/health-lib.module';
import { DatabaseHealthIndicator } from '../../src/indicators/database.indicator';
import { RedisHealthIndicator } from '../../src/indicators/redis.indicator';
import { ConfigModule } from '@nestjs/config';

describe('HealthLibModule (Integration)', () => {
  let module: TestingModule;
  let dbIndicator: DatabaseHealthIndicator;
  let redisIndicator: RedisHealthIndicator;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env.test' }),
        HealthLibModule,
      ],
    }).compile();

    dbIndicator = module.get<DatabaseHealthIndicator>(DatabaseHealthIndicator);
    redisIndicator = module.get<RedisHealthIndicator>(RedisHealthIndicator);
  });

  afterAll(async () => {
    if (module) {
      await module.close();
    }
  });

  it('should be defined', () => {
    expect(dbIndicator).toBeDefined();
    expect(redisIndicator).toBeDefined();
  });

  describe('DatabaseHealthIndicator', () => {
    it('should return a healthy status with responseTime', async () => {
      const result = await dbIndicator.check();

      expect(result).toBeDefined();
      expect(result.status).toBe('healthy');
      expect(typeof result.responseTime).toBe('number');
      expect(result.responseTime).toBeGreaterThanOrEqual(0);
    });

    it('should return the correct shape from check()', async () => {
      const result = await dbIndicator.check();

      expect(result).toHaveProperty('status');
      expect(result).toHaveProperty('responseTime');
      expect(['healthy', 'degraded', 'unhealthy']).toContain(result.status);
    });
  });

  describe('RedisHealthIndicator', () => {
    it('should return a healthy status with responseTime', async () => {
      const result = await redisIndicator.check();

      expect(result).toBeDefined();
      expect(result.status).toBe('healthy');
      expect(typeof result.responseTime).toBe('number');
      expect(result.responseTime).toBeGreaterThanOrEqual(0);
    });

    it('should return the correct shape from check()', async () => {
      const result = await redisIndicator.check();

      expect(result).toHaveProperty('status');
      expect(result).toHaveProperty('responseTime');
      expect(['healthy', 'degraded', 'unhealthy']).toContain(result.status);
    });
  });
});
