import { Controller, Get, HttpCode, HttpStatus, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Public } from '@nestlancer/common';
import { HealthService } from './health.service';

/**
 * Health Controller
 * Provides health check endpoints for the gateway and aggregated service health
 */
@Controller('health')
@ApiTags('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: 'Gateway health check', description: 'Returns gateway health status' })
  check() {
    return this.healthService.getGatewayHealth();
  }

  @Get('ready')
  @Public()
  @ApiOperation({ summary: 'Readiness probe', description: 'Checks if critical services are ready' })
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
  @ApiOperation({ summary: 'Dependency health', description: 'Aggregated health check of all services' })
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
}
