import { Controller, Get, Post, Patch, Delete, Param, Body, Query, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { Request } from 'express';
import { HttpProxyService } from '../../proxy';
import { Public } from '@nestlancer/common';

/**
 * Projects Gateway Controller
 * Routes project requests to the Projects Service.
 *
 * Projects service: prefix api/v1, @Controller('projects')
 * Available: health, stats, templates, list, details, timeline, deliverables,
 *            payments, progress, milestones, messages, approve, revision, feedback
 */
@Controller('projects')
@ApiTags('projects')
@ApiBearerAuth()
export class ProjectsController {
  constructor(private readonly proxy: HttpProxyService) { }

  @Public()
  @Get('health')
  @ApiOperation({ summary: 'Projects service health check' })
  async health(@Req() req: Request) {
    return this.proxy.forward('projects', req);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get project statistics' })
  async getStats(@Req() req: Request) {
    return this.proxy.forward('projects', req);
  }

  @Get('templates')
  @ApiOperation({ summary: 'Get project templates' })
  async getTemplates(@Req() req: Request) {
    return this.proxy.forward('projects', req);
  }

  @Post('templates')
  @ApiOperation({ summary: 'Create project template' })
  async createTemplate(@Req() req: Request) {
    return this.proxy.forward('projects', req);
  }

  @Get()
  @ApiOperation({ summary: 'List projects' })
  async findAll(@Req() req: Request) {
    return this.proxy.forward('projects', req);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get project details' })
  @ApiParam({ name: 'id', description: 'Project UUID' })
  async findOne(@Req() req: Request) {
    return this.proxy.forward('projects', req);
  }

  @Get(':id/timeline')
  @ApiOperation({ summary: 'Get project timeline' })
  @ApiParam({ name: 'id', description: 'Project UUID' })
  async getTimeline(@Req() req: Request) {
    return this.proxy.forward('projects', req);
  }

  @Get(':id/deliverables')
  @ApiOperation({ summary: 'Get project deliverables' })
  @ApiParam({ name: 'id', description: 'Project UUID' })
  async getDeliverables(@Req() req: Request) {
    return this.proxy.forward('projects', req);
  }

  @Get(':id/payments')
  @ApiOperation({ summary: 'Get project payments' })
  @ApiParam({ name: 'id', description: 'Project UUID' })
  async getPayments(@Req() req: Request) {
    return this.proxy.forward('projects', req);
  }

  @Get(':id/progress')
  @ApiOperation({ summary: 'Get project progress summary' })
  @ApiParam({ name: 'id', description: 'Project UUID' })
  async getProgress(@Req() req: Request) {
    return this.proxy.forward('projects', req);
  }

  @Get(':id/milestones')
  @ApiOperation({ summary: 'Get project milestones' })
  @ApiParam({ name: 'id', description: 'Project UUID' })
  async getMilestones(@Req() req: Request) {
    return this.proxy.forward('projects', req);
  }

  @Get(':id/messages')
  @ApiOperation({ summary: 'Get project messages' })
  @ApiParam({ name: 'id', description: 'Project UUID' })
  async getMessages(@Req() req: Request) {
    return this.proxy.forward('projects', req);
  }

  @Post(':id/messages')
  @ApiOperation({ summary: 'Send project message' })
  @ApiParam({ name: 'id', description: 'Project UUID' })
  async sendMessage(@Req() req: Request) {
    return this.proxy.forward('projects', req);
  }

  @Post(':id/approve')
  @ApiOperation({ summary: 'Approve project' })
  @ApiParam({ name: 'id', description: 'Project UUID' })
  async approveProject(@Req() req: Request) {
    return this.proxy.forward('projects', req);
  }

  @Post(':id/request-revision')
  @ApiOperation({ summary: 'Request project revision' })
  @ApiParam({ name: 'id', description: 'Project UUID' })
  async requestRevision(@Req() req: Request) {
    return this.proxy.forward('projects', req);
  }

  @Post(':id/feedback')
  @ApiOperation({ summary: 'Submit project feedback' })
  @ApiParam({ name: 'id', description: 'Project UUID' })
  async submitFeedback(@Req() req: Request) {
    return this.proxy.forward('projects', req);
  }

  @Get(':id/feedback')
  @ApiOperation({ summary: 'Get project feedback' })
  @ApiParam({ name: 'id', description: 'Project UUID' })
  async getFeedback(@Req() req: Request) {
    return this.proxy.forward('projects', req);
  }
}
