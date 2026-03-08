import { Controller, Get, Post, Patch, Delete, Param, Body, Query, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Request } from 'express';
import { HttpProxyService } from '../../proxy';

/**
 * Requests Gateway Controller
 * Routes project requests to the Requests Service
 */
@Controller('requests')
@ApiTags('requests')
@ApiBearerAuth()
export class RequestsController {
  constructor(private readonly proxy: HttpProxyService) {}

  @Get()
  @ApiOperation({ summary: 'List project requests' })
  async findAll(@Req() req: Request) {
    return this.proxy.forward('requests', req);
  }

  @Post()
  @ApiOperation({ summary: 'Create project request' })
  async create(@Req() req: Request) {
    return this.proxy.forward('requests', req);
  }

  @Get(':id/status')
  @ApiOperation({ summary: 'Get request status timeline' })
  async getStatus(@Req() req: Request) {
    return this.proxy.forward('requests', req);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get request by ID' })
  async findOne(@Req() req: Request) {
    return this.proxy.forward('requests', req);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update request' })
  async update(@Req() req: Request) {
    return this.proxy.forward('requests', req);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete request' })
  async remove(@Req() req: Request) {
    return this.proxy.forward('requests', req);
  }

  @Post(':id/submit')
  @ApiOperation({ summary: 'Submit request for review' })
  async submit(@Req() req: Request) {
    return this.proxy.forward('requests', req);
  }

  @Post(':id/cancel')
  @ApiOperation({ summary: 'Cancel request' })
  async cancel(@Req() req: Request) {
    return this.proxy.forward('requests', req);
  }

  @Get(':id/quotes')
  @ApiOperation({ summary: 'Get quotes for request' })
  async getQuotes(@Req() req: Request) {
    return this.proxy.forward('requests', req);
  }

  @Get('health')
  @ApiOperation({ summary: 'Requests service health check' })
  async health(@Req() req: Request) {
    return this.proxy.forward('requests', req);
  }
}
