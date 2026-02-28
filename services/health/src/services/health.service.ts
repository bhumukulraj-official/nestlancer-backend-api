import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AggregatedHealthStatus, DebugHealthStatus, ServiceHealthStatus } from '../interfaces/health-status.interface';
import { DatabaseHealthService } from './database-health.service';
import { CacheHealthService } from './cache-health.service';
import { QueueHealthService } from './queue-health.service';
import { StorageHealthService } from './storage-health.service';
import { ExternalServicesHealthService } from './external-services-health.service';
import { WorkersHealthService } from './workers-health.service';
import { WebsocketHealthService } from './websocket-health.service';
import { SystemMetricsService } from './system-metrics.service';
import { FeatureFlagsHealthService } from './feature-flags-health.service';

@Injectable()
export class HealthService {
    constructor(
        private readonly configService: ConfigService,
        private readonly dbHealth: DatabaseHealthService,
        private readonly cacheHealth: CacheHealthService,
        private readonly queueHealth: QueueHealthService,
        private readonly storageHealth: StorageHealthService,
        private readonly externalHealth: ExternalServicesHealthService,
        private readonly workersHealth: WorkersHealthService,
        private readonly wsHealth: WebsocketHealthService,
        private readonly metricsService: SystemMetricsService,
        private readonly featureFlagsHealth: FeatureFlagsHealthService,
    ) { }

    async getAggregatedHealth(): Promise<AggregatedHealthStatus> {
        const [
            dbRes,
            cacheRes,
            queueRes,
            storageRes,
            externalRes,
            workersRes,
            wsRes,
        ] = await Promise.all([
            this.dbHealth.check(),
            this.cacheHealth.check(),
            this.queueHealth.check(),
            this.storageHealth.check(),
            this.externalHealth.check(),
            this.workersHealth.check(),
            this.wsHealth.check(),
        ]);

        const checks = {
            database: dbRes.status === 'healthy' ? 'pass' : 'fail',
            cache: cacheRes.status === 'healthy' ? 'pass' : 'fail',
            queue: queueRes.status === 'healthy' ? 'pass' : 'fail',
            storage: storageRes.status === 'healthy' ? 'pass' : 'fail',
            externalServices: externalRes.status === 'healthy' ? 'pass' : 'fail',
        };

        const isHealthy = Object.values(checks).every(val => val === 'pass');
        const isUnhealthy = dbRes.status === 'unhealthy' || cacheRes.status === 'unhealthy';

        const services: Record<string, ServiceHealthStatus> = {
            database: { status: dbRes.status, responseTime: dbRes.responseTime, ...dbRes.details },
            cache: { status: cacheRes.status, responseTime: cacheRes.responseTime, ...cacheRes.details },
            queue: { status: queueRes.status, responseTime: queueRes.responseTime, ...queueRes.details },
            storage: { status: storageRes.status, responseTime: storageRes.responseTime, ...storageRes.details },
            external: { status: externalRes.status, responseTime: externalRes.responseTime, ...externalRes.details },
            workers: { status: workersRes.status, responseTime: workersRes.responseTime, ...workersRes.details },
            websocket: { status: wsRes.status, responseTime: wsRes.responseTime, ...wsRes.details },
        };

        return {
            status: isUnhealthy ? 'unhealthy' : isHealthy ? 'healthy' : 'degraded',
            timestamp: new Date().toISOString(),
            uptime: this.formatUptime(process.uptime()),
            version: this.configService.get<string>('healthService.version') || '1.0.0',
            environment: this.configService.get<string>('NODE_ENV') || 'development',
            services,
            checks: checks as any,
        };
    }

    async getDebugHealth(): Promise<DebugHealthStatus> {
        const metrics = this.metricsService.getMetrics();
        const flags = await this.featureFlagsHealth.check();

        // Perform live checks for core dependencies to get active state
        const [dbRes, cacheRes, queueRes] = await Promise.all([
            this.dbHealth.check(),
            this.cacheHealth.check(),
            this.queueHealth.check(),
        ]);

        return {
            status: 'healthy', // Base status, should be computed ideally
            timestamp: new Date().toISOString(),
            server: {
                hostname: process.env.HOSTNAME || 'localhost',
                platform: process.platform,
                architecture: process.arch,
                nodeVersion: process.version,
                memory: metrics.memory,
                cpu: metrics.cpu,
                disk: metrics.disk,
            },
            process: metrics.process,
            dependencies: {
                database: {
                    connected: dbRes.status === 'healthy',
                    ...dbRes.details,
                },
                cache: {
                    connected: cacheRes.status === 'healthy',
                    ...cacheRes.details,
                },
                queue: {
                    connected: queueRes.status === 'healthy',
                    ...queueRes.details,
                },
            },
            featureFlags: flags.flags,
        };
    }

    async getReadiness(): Promise<{ status: string; checks: Record<string, boolean> }> {
        const [dbRes, cacheRes, queueRes] = await Promise.all([
            this.dbHealth.check(),
            this.cacheHealth.check(),
            this.queueHealth.check(),
        ]);

        const checks = {
            database: dbRes.status !== 'unhealthy',
            cache: cacheRes.status !== 'unhealthy',
            queue: queueRes.status !== 'unhealthy',
        };

        const isReady = Object.values(checks).every(Boolean);

        return {
            status: isReady ? 'ready' : 'not_ready',
            checks,
        };
    }

    getLiveness(): { status: string; uptime: number } {
        return {
            status: 'alive',
            uptime: Math.floor(process.uptime()),
        };
    }

    // Helper method for formatting seconds into days, hours, mins, secs
    private formatUptime(secondsStr: number): string {
        const d = Math.floor(secondsStr / (3600 * 24));
        const h = Math.floor((secondsStr % (3600 * 24)) / 3600);
        const m = Math.floor((secondsStr % 3600) / 60);
        const s = Math.floor(secondsStr % 60);

        const dDisplay = d > 0 ? d + "d " : "";
        const hDisplay = h > 0 ? h + "h " : "";
        const mDisplay = m > 0 ? m + "m " : "";
        const sDisplay = s > 0 ? s + "s" : "";
        return (dDisplay + hDisplay + mDisplay + sDisplay).trim() || "0s";
    }
}
