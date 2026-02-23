import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LoggerService } from '@nestlancer/logger';
import { HealthCheckResult } from '../interfaces/health-check-result.interface';
import { connect } from 'amqplib';

@Injectable()
export class QueueHealthService {
    constructor(
        private readonly configService: ConfigService,
        private readonly logger: LoggerService,
    ) { }

    async check(): Promise<HealthCheckResult> {
        const startTime = Date.now();
        try {
            const timeoutMs = this.configService.get<number>('healthService.timeouts.queue') || 2000;
            const rabbitUrl = this.configService.get<string>('RABBITMQ_URL', 'amqp://localhost:5672');

            // Attempt to connect and immediately close to verify availability
            const connectionPromise = async () => {
                const conn = await connect(rabbitUrl);
                await conn.close();
                return true;
            };

            await Promise.race([
                connectionPromise(),
                new Promise((_, reject) =>
                    setTimeout(() => reject(new Error('Queue connection timeout')), timeoutMs)
                )
            ]);

            const responseTime = Date.now() - startTime;

            return {
                status: 'healthy',
                responseTime,
                details: {
                    pendingJobs: 0, // Placeholder
                    workers: 0      // Placeholder
                }
            };
        } catch (error) {
            this.logger.error('Queue health check failed', error.stack, 'QueueHealthService');
            return {
                status: 'unhealthy',
                responseTime: Date.now() - startTime,
                error: error.message,
            };
        }
    }
}
