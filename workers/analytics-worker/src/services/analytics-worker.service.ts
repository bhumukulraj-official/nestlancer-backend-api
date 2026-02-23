import { Injectable } from '@nestjs/common';
import { LoggerService } from '@nestlancer/logger';
import { RedisCacheService } from '@nestlancer/cache';
import { AggregationResult } from '../interfaces/aggregation-result.interface';
import { AnalyticsJobType, Period } from '../interfaces/analytics-job.interface';

@Injectable()
export class AnalyticsWorkerService {
    constructor(
        private readonly logger: LoggerService,
        private readonly cache: RedisCacheService,
    ) { }

    async getLatest(type: AnalyticsJobType): Promise<any> {
        const key = `analytics:${type.toLowerCase()}:latest`;
        return await this.cache.get(key);
    }

    async saveResult(result: AggregationResult): Promise<void> {
        const key = `analytics:${result.type.toLowerCase()}:${result.period.toLowerCase()}`;
        const latestKey = `analytics:${result.type.toLowerCase()}:latest`;

        await this.cache.set(key, result, result.cachedUntil.getTime() - Date.now());
        await this.cache.set(latestKey, result);

        this.logger.log(`Saved analytics result for ${result.type} (${result.period})`);
    }
}
