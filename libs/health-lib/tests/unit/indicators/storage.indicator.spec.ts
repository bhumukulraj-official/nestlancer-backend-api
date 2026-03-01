import { Test, TestingModule } from '@nestjs/testing';
import { StorageHealthIndicator } from '../../../src/indicators/storage.indicator';

describe('StorageHealthIndicator', () => {
    let indicator: StorageHealthIndicator;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [StorageHealthIndicator],
        }).compile();

        indicator = module.get<StorageHealthIndicator>(StorageHealthIndicator);
    });

    it('should return healthy status', async () => {
        const result = await indicator.check();
        expect(result.status).toBe('healthy');
        expect(result.responseTime).toBeDefined();
    });
});
