import { Injectable } from '@nestjs/common';
import { HealthCheckResult } from '../interfaces/health-check-result.interface';

@Injectable()
export class FeatureFlagsHealthService {
    async check() {
        return {
            status: 'healthy' as const,
            flags: {
                newDashboard: true,
                advancedAnalytics: false,
                betaFeatures: true
            }
        };
    }
}
