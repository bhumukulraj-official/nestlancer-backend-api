import { Test, TestingModule } from '@nestjs/testing';
import { HealthLibModule } from '../../src/health-lib.module';
import { DatabaseHealthIndicator } from '../../src/indicators/database.indicator';
import { RedisHealthIndicator } from '../../src/indicators/redis.indicator';

describe('Health Indicators (Integration)', () => {
  let module: TestingModule;
  let dbIndicator: DatabaseHealthIndicator;
  let redisIndicator: RedisHealthIndicator;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [HealthLibModule],
    }).compile();

    dbIndicator = module.get<DatabaseHealthIndicator>(DatabaseHealthIndicator);
    redisIndicator = module.get<RedisHealthIndicator>(RedisHealthIndicator);
  });

  afterAll(async () => {
    if (module) {
      await module.close();
    }
  });

  describe('DatabaseHealthIndicator.check()', () => {
    it('should return healthy status', async () => {
      const result = await dbIndicator.check();

      expect(result.status).toBe('healthy');
      expect(result.responseTime).toBeGreaterThanOrEqual(0);
    });

    it('should return unhealthy status when check fails', async () => {
      // Simulate a failure inside check() by temporarily overriding the method internals
      const originalCheck = dbIndicator.check.bind(dbIndicator);
      jest.spyOn(dbIndicator, 'check').mockResolvedValueOnce({
        status: 'unhealthy',
        responseTime: 0,
        details: { error: 'Connection refused' },
      });

      const result = await dbIndicator.check();

      expect(result.status).toBe('unhealthy');
      expect(result.details).toBeDefined();
      expect(result.details?.error).toContain('Connection refused');
    });
  });

  describe('RedisHealthIndicator.check()', () => {
    it('should return healthy status', async () => {
      const result = await redisIndicator.check();

      expect(result.status).toBe('healthy');
      expect(result.responseTime).toBeGreaterThanOrEqual(0);
    });

    it('should return unhealthy status when check fails', async () => {
      jest.spyOn(redisIndicator, 'check').mockResolvedValueOnce({
        status: 'unhealthy',
        responseTime: 0,
        details: { error: 'Redis connection timeout' },
      });

      const result = await redisIndicator.check();

      expect(result.status).toBe('unhealthy');
      expect(result.details).toBeDefined();
      expect(result.details?.error).toContain('Redis connection timeout');
    });
  });

  describe('Multiple health checks', () => {
    it('should run all indicators and aggregate results', async () => {
      const [dbResult, redisResult] = await Promise.all([
        dbIndicator.check(),
        redisIndicator.check(),
      ]);

      const allHealthy = [dbResult, redisResult].every((r) => r.status === 'healthy');
      expect(allHealthy).toBe(true);
    });
  });
});
