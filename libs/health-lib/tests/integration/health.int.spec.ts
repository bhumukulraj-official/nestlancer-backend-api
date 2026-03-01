import { Test, TestingModule } from '@nestjs/testing';
import { HealthLibModule } from '../../src/health-lib.module';
import { DatabaseHealthIndicator } from '../../src/indicators/database.indicator';
import { RedisHealthIndicator } from '../../src/indicators/redis.indicator';

describe('HealthLibModule (Integration)', () => {
    let module: TestingModule;

    beforeAll(async () => {
        module = await Test.createTestingModule({
            imports: [HealthLibModule],
        }).compile();
    });

    it('should be defined', () => {
        expect(module).toBeDefined();
    });

    it('should export indicators', () => {
        const dbIndicator = module.get<DatabaseHealthIndicator>(DatabaseHealthIndicator);
        const redisIndicator = module.get<RedisHealthIndicator>(RedisHealthIndicator);

        expect(dbIndicator).toBeDefined();
        expect(redisIndicator).toBeDefined();
    });
});
