import { Injectable } from '@nestjs/common';
import { LoggerService } from '@nestlancer/logger';
import { HealthCheckResult } from '../interfaces/health-check-result.interface';

@Injectable()
export class StorageHealthService {
    constructor(
        private readonly logger: LoggerService,
    ) { }

    async check(): Promise<HealthCheckResult> {
        const startTime = Date.now();
        // Simulate S3/Storage check
        try {
            // In a real implementation this would make an AWS SDK call to headBucket or listBuckets
            // We will mock healthy state for structural purposes

            const responseTime = Date.now() - startTime;
            return {
                status: 'healthy',
                responseTime: responseTime > 0 ? responseTime : 5,
                details: {
                    connected: true
                }
            };
        } catch (error) {
            this.logger.error('Storage health check failed', error.stack, 'StorageHealthService');
            return {
                status: 'unhealthy',
                responseTime: Date.now() - startTime,
                error: error.message,
            };
        }
    }
}
