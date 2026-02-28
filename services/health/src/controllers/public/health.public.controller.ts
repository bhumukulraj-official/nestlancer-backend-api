import { Controller, Get, Head, HttpCode, HttpStatus, Res } from '@nestjs/common';
import { Response } from 'express';
import { Public } from '@nestlancer/common/decorators/public.decorator';
import { Cacheable } from '@nestlancer/cache/decorators/cacheable.decorator';
import { HealthService } from '../../services/health.service';
import { DatabaseHealthService } from '../../services/database-health.service';
import { CacheHealthService } from '../../services/cache-health.service';
import { QueueHealthService } from '../../services/queue-health.service';
import { StorageHealthService } from '../../services/storage-health.service';
import { ExternalServicesHealthService } from '../../services/external-services-health.service';
import { WorkersHealthService } from '../../services/workers-health.service';
import { WebsocketHealthService } from '../../services/websocket-health.service';
import { SystemMetricsService } from '../../services/system-metrics.service';
import { FeatureFlagsHealthService } from '../../services/feature-flags-health.service';
import { ServiceRegistryHealthService } from '../../services/service-registry-health.service';

@Controller()
@Public() // Health endpoints are typically public or semi-public
export class HealthPublicController {
    constructor(
        private readonly healthService: HealthService,
        private readonly dbHealth: DatabaseHealthService,
        private readonly cacheHealth: CacheHealthService,
        private readonly queueHealth: QueueHealthService,
        private readonly storageHealth: StorageHealthService,
        private readonly externalHealth: ExternalServicesHealthService,
        private readonly workersHealth: WorkersHealthService,
        private readonly wsHealth: WebsocketHealthService,
        private readonly metricsService: SystemMetricsService,
        private readonly featureFlags: FeatureFlagsHealthService,
        private readonly registryHealth: ServiceRegistryHealthService,
    ) { }

    @Get()
    @Cacheable({ ttl: 15000 }) // Cache for 15s to prevent DDoS
    async getAggregatedHealth(@Res() res: Response) {
        const health = await this.healthService.getAggregatedHealth();

        let status = HttpStatus.OK;
        if (health.status === 'unhealthy') status = HttpStatus.SERVICE_UNAVAILABLE;
        else if (health.status === 'degraded') status = HttpStatus.PARTIAL_CONTENT;

        return res.status(status).json(health);
    }

    @Get('ready')
    async getReadiness(@Res() res: Response) {
        const readiness = await this.healthService.getReadiness();
        const status = readiness.status === 'ready' ? HttpStatus.OK : HttpStatus.SERVICE_UNAVAILABLE;
        return res.status(status).json(readiness);
    }

    @Get('live')
    getLiveness() {
        return this.healthService.getLiveness();
    }

    @Head('ping')
    @HttpCode(HttpStatus.OK)
    ping() {
        return;
    }

    @Get('database')
    async getDatabaseHealth(@Res() res: Response) {
        const result = await this.dbHealth.check();
        const status = result.status === 'healthy' ? HttpStatus.OK : HttpStatus.SERVICE_UNAVAILABLE;
        return res.status(status).json(result);
    }

    @Get('cache')
    async getCacheHealth(@Res() res: Response) {
        const result = await this.cacheHealth.check();
        const status = result.status === 'healthy' ? HttpStatus.OK : HttpStatus.SERVICE_UNAVAILABLE;
        return res.status(status).json(result);
    }

    @Get('queue')
    async getQueueHealth(@Res() res: Response) {
        const result = await this.queueHealth.check();
        const status = result.status === 'healthy' ? HttpStatus.OK : HttpStatus.SERVICE_UNAVAILABLE;
        return res.status(status).json(result);
    }

    @Get('storage')
    async getStorageHealth(@Res() res: Response) {
        const result = await this.storageHealth.check();
        const status = result.status === 'healthy' ? HttpStatus.OK : HttpStatus.SERVICE_UNAVAILABLE;
        return res.status(status).json(result);
    }

    @Get('microservices')
    getMicroservicesHealth() {
        // Abstracted to aggregated response for now, typically hits registry or sidecar
        return { status: 'healthy', ...this.healthService.getAggregatedHealth() };
    }

    @Get('external')
    async getExternalHealth(@Res() res: Response) {
        const result = await this.externalHealth.check();
        const status = result.status === 'healthy' ? HttpStatus.OK : HttpStatus.SERVICE_UNAVAILABLE;
        return res.status(status).json(result);
    }

    @Get('workers')
    async getWorkersHealth(@Res() res: Response) {
        const result = await this.workersHealth.check();
        const status = result.status === 'healthy' ? HttpStatus.OK : HttpStatus.SERVICE_UNAVAILABLE;
        return res.status(status).json(result);
    }

    @Get('websocket')
    async getWebsocketHealth(@Res() res: Response) {
        const result = await this.wsHealth.check();
        const status = result.status === 'healthy' ? HttpStatus.OK : HttpStatus.SERVICE_UNAVAILABLE;
        return res.status(status).json(result);
    }

    @Get('system')
    getSystemMetrics() {
        return { status: 'healthy', ...this.metricsService.getMetrics() };
    }

    @Get('features')
    async getFeatureFlags() {
        return this.featureFlags.check();
    }

    @Get('registry')
    async getRegistryHealth(@Res() res: Response) {
        const result = await this.registryHealth.check();
        const status = result.status === 'healthy' ? HttpStatus.OK : HttpStatus.SERVICE_UNAVAILABLE;
        return res.status(status).json(result);
    }
}
