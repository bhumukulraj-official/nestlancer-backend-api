import { Injectable } from '@nestjs/common';
import { HealthCheckResult } from '../interfaces/health-check-result.interface';

@Injectable()
export class WorkersHealthService {
    async check(): Promise<HealthCheckResult> {
        const startTime = Date.now();
        // In actual implementation, this queries the worker tracking table or Redis registry
        return {
            status: 'healthy',
            responseTime: Date.now() - startTime,
            details: {
                activeWorkers: 8,
                emailWorker: 'healthy',
                notificationWorker: 'healthy',
                outboxPoller: 'healthy'
            }
        };
    }
}
