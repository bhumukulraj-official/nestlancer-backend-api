import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LoggerService } from '@nestlancer/logger';
import { HealthCheckResult } from '../interfaces/health-check-result.interface';
import * as amqp from 'amqplib';

interface QueueStats {
    pendingJobs: number;
    consumers: number;
    queues: Array<{
        name: string;
        messages: number;
        consumers: number;
    }>;
}

@Injectable()
export class QueueHealthService {
    private readonly MONITORED_QUEUES = [
        'email.send',
        'notification.push',
        'audit.log',
        'media.process',
        'webhook.process',
        'cdn.invalidate',
        'analytics.aggregate',
    ];

    constructor(
        private readonly configService: ConfigService,
        private readonly logger: LoggerService,
    ) { }

    async check(): Promise<HealthCheckResult> {
        const startTime = Date.now();
        let connection: any = null;

        try {
            const timeoutMs = this.configService.get<number>('healthService.timeouts.queue') || 2000;
            const rabbitUrl = this.configService.get<string>('RABBITMQ_URL', 'amqp://localhost:5672');

            // Attempt to connect with timeout
            connection = await Promise.race([
                amqp.connect(rabbitUrl),
                new Promise<never>((_, reject) =>
                    setTimeout(() => reject(new Error('Queue connection timeout')), timeoutMs)
                )
            ]);

            // Get queue statistics
            const queueStats = await this.getQueueStats(connection);
            const responseTime = Date.now() - startTime;

            return {
                status: 'healthy',
                responseTime,
                details: {
                    pendingJobs: queueStats.pendingJobs,
                    workers: queueStats.consumers,
                    queues: queueStats.queues,
                }
            };
        } catch (error: any) {
            this.logger.error('Queue health check failed', error.stack, 'QueueHealthService');
            return {
                status: 'unhealthy',
                responseTime: Date.now() - startTime,
                error: error.message,
            };
        } finally {
            if (connection) {
                try {
                    await connection.close();
                } catch (closeError) {
                    this.logger.warn('Failed to close RabbitMQ connection', 'QueueHealthService');
                }
            }
        }
    }

    private async getQueueStats(connection: any): Promise<QueueStats> {
        const channel = await connection.createChannel();
        const queues: QueueStats['queues'] = [];
        let totalPendingJobs = 0;
        let totalConsumers = 0;

        try {
            for (const queueName of this.MONITORED_QUEUES) {
                try {
                    const queueInfo = await channel.checkQueue(queueName);
                    queues.push({
                        name: queueName,
                        messages: queueInfo.messageCount,
                        consumers: queueInfo.consumerCount,
                    });
                    totalPendingJobs += queueInfo.messageCount;
                    totalConsumers += queueInfo.consumerCount;
                } catch {
                    // Queue might not exist yet, which is fine
                    queues.push({
                        name: queueName,
                        messages: 0,
                        consumers: 0,
                    });
                }
            }
        } finally {
            await channel.close();
        }

        return {
            pendingJobs: totalPendingJobs,
            consumers: totalConsumers,
            queues,
        };
    }
}
