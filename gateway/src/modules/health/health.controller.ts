import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Public } from '@nestlancer/common';

@Controller('health')
@ApiTags('health')
export class HealthController {
  @Get()
  @Public()
  @ApiOperation({ summary: 'Health check', description: 'Returns service health status' })
  check() {
    return { status: 'healthy', timestamp: new Date().toISOString(), uptime: process.uptime() };
  }

  @Get('ready')
  @Public()
  @ApiOperation({ summary: 'Readiness probe' })
  ready() {
    return { status: 'ready', timestamp: new Date().toISOString() };
  }
}
