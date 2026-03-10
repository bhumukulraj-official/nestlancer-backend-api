import { Controller, Get, Head, HttpCode, HttpStatus, Param, Req } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Request } from 'express';
import { Public } from '@nestlancer/common';
import { HealthService } from './health.service';
import { HttpProxyService } from '../../proxy';

/**
 * Health Controller
 * Provides health check endpoints for the gateway and aggregated service health.
 * Sub-routes (ping, database, cache, etc.) proxy to the health microservice.
 */
@Controller('health')
@ApiTags('health')
export class HealthController {
  constructor(
    private readonly healthService: HealthService,
    private readonly proxy: HttpProxyService,
  ) {}

  @Get()
  @Public()
  @ApiOperation({ summary: 'Gateway health check', description: 'Returns gateway health status' })
  check() {
    return this.healthService.getGatewayHealth();
  }

  @Get('detailed')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Detailed health check',
    description: 'Returns detailed health status for all infrastructure',
  })
  async detailed() {
    return this.healthService.checkAllServices();
  }

  @Get('ready')
  @Public()
  @ApiOperation({
    summary: 'Readiness probe',
    description: 'Checks if critical services are ready',
  })
  async ready() {
    const { ready, criticalServices } = await this.healthService.isReady();

    return {
      status: ready ? 'ready' : 'not_ready',
      timestamp: new Date().toISOString(),
      ...(criticalServices.length > 0 && { unavailableServices: criticalServices }),
    };
  }

  @Get('live')
  @Public()
  @ApiOperation({ summary: 'Liveness probe', description: 'Checks if gateway is alive' })
  live() {
    return {
      status: 'alive',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }

  @Get('dependencies')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Dependency health',
    description: 'Aggregated health check of all services',
  })
  async checkDependencies() {
    return this.healthService.checkAllServices();
  }

  @Get('services/:name')
  @Public()
  @ApiOperation({ summary: 'Check specific service health' })
  async checkService(@Param('name') name: string) {
    const isHealthy = await this.healthService.isServiceHealthy(name);
    return {
      service: name,
      status: isHealthy ? 'up' : 'down',
      timestamp: new Date().toISOString(),
    };
  }

  @Head('ping')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'HEAD /health/ping' })
  async ping(@Req() req: Request) {
    return this.proxy.forward('health', req, undefined, '/api/v1/ping');
  }

  @Get('database')
  @Public()
  @ApiOperation({ summary: 'Database health' })
  async database(@Req() req: Request) {
    return this.proxy.forward('health', req, undefined, '/api/v1/database');
  }

  @Get('cache')
  @Public()
  @ApiOperation({ summary: 'Cache health' })
  async cache(@Req() req: Request) {
    return this.proxy.forward('health', req, undefined, '/api/v1/cache');
  }

  @Get('queue')
  @Public()
  @ApiOperation({ summary: 'Queue health' })
  async queue(@Req() req: Request) {
    return this.proxy.forward('health', req, undefined, '/api/v1/queue');
  }

  @Get('storage')
  @Public()
  @ApiOperation({ summary: 'Storage health' })
  async storage(@Req() req: Request) {
    return this.proxy.forward('health', req, undefined, '/api/v1/storage');
  }

  @Get('microservices')
  @Public()
  @ApiOperation({ summary: 'Microservices health' })
  async microservices(@Req() req: Request) {
    return this.proxy.forward('health', req, undefined, '/api/v1/microservices');
  }

  @Get('external')
  @Public()
  @ApiOperation({ summary: 'External services health' })
  async external(@Req() req: Request) {
    return this.proxy.forward('health', req, undefined, '/api/v1/external');
  }

  @Get('workers')
  @Public()
  @ApiOperation({ summary: 'Workers health' })
  async workers(@Req() req: Request) {
    return this.proxy.forward('health', req, undefined, '/api/v1/workers');
  }

  @Get('websocket')
  @Public()
  @ApiOperation({ summary: 'WebSocket health' })
  async websocket(@Req() req: Request) {
    return this.proxy.forward('health', req, undefined, '/api/v1/websocket');
  }

  @Get('system')
  @Public()
  @ApiOperation({ summary: 'System metrics' })
  async system(@Req() req: Request) {
    return this.proxy.forward('health', req, undefined, '/api/v1/system');
  }

  @Get('features')
  @Public()
  @ApiOperation({ summary: 'Feature flags health' })
  async features(@Req() req: Request) {
    return this.proxy.forward('health', req, undefined, '/api/v1/features');
  }

  @Get('registry')
  @Public()
  @ApiOperation({ summary: 'Registry health' })
  async registry(@Req() req: Request) {
    return this.proxy.forward('health', req, undefined, '/api/v1/registry');
  }

  @Get('debug')
  @Public()
  @ApiOperation({ summary: 'Admin debug diagnostics (delegate to health service)' })
  async debug(@Req() req: Request) {
    return this.proxy.forward('health', req, undefined, '/api/v1/debug');
  }
}
