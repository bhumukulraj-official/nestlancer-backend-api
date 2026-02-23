import { Injectable } from '@nestjs/common';
import { HealthCheckResult } from '../interfaces/health-check-result.interface';

@Injectable()
export class WebsocketHealthService {
    async check(): Promise<HealthCheckResult> {
        const startTime = Date.now();
        // In actual implementation, this pings the WS gateway API
        return {
            status: 'healthy',
            responseTime: Date.now() - startTime,
            details: {
                connectedClients: 152
            }
        };
    }
}
