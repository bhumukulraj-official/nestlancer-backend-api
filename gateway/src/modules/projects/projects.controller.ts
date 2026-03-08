import { Controller, Get, Post, Patch, Delete, Param, Body, Query, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Request } from 'express';
import { HttpProxyService } from '../../proxy';

/**
 * Projects Gateway Controller
 * Routes project requests to the Projects Service
 */
@Controller('projects')
@ApiTags('projects')
@ApiBearerAuth()
export class ProjectsController {
  constructor(private readonly proxy: HttpProxyService) {}

  @Get()
  @ApiOperation({ summary: 'List projects' })
  async findAll(@Req() req: Request) {
    return this.proxy.forward('projects', req);
  }

  @Post()
  @ApiOperation({ summary: 'Create project' })
  async create(@Req() req: Request) {
    return this.proxy.forward('projects', req);
  }

  @Get('stats')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user project stats' })
  async getStats(@Req() req: Request) {
    return this.proxy.forward('projects', req);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get project by ID' })
  async findOne(@Req() req: Request) {
    return this.proxy.forward('projects', req);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update project' })
  async update(@Req() req: Request) {
    return this.proxy.forward('projects', req);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete project' })
  async remove(@Req() req: Request) {
    return this.proxy.forward('projects', req);
  }

  @Post(':id/start')
  @ApiOperation({ summary: 'Start project' })
  async start(@Req() req: Request) {
    return this.proxy.forward('projects', req);
  }

  @Post(':id/complete')
  @ApiOperation({ summary: 'Complete project' })
  async complete(@Req() req: Request) {
    return this.proxy.forward('projects', req);
  }

  @Post(':id/cancel')
  @ApiOperation({ summary: 'Cancel project' })
  async cancel(@Req() req: Request) {
    return this.proxy.forward('projects', req);
  }

  @Get(':id/progress')
  @ApiOperation({ summary: 'Get project progress' })
  async getProgress(@Req() req: Request) {
    return this.proxy.forward('projects', req);
  }

  @Get(':id/deliverables')
  @ApiOperation({ summary: 'Get project deliverables' })
  async getDeliverables(@Req() req: Request) {
    return this.proxy.forward('projects', req);
  }

  @Get(':id/team')
  @ApiOperation({ summary: 'Get project team' })
  async getTeam(@Req() req: Request) {
    return this.proxy.forward('projects', req);
  }

  @Post(':id/team')
  @ApiOperation({ summary: 'Add team member' })
  async addTeamMember(@Req() req: Request) {
    return this.proxy.forward('projects', req);
  }

  @Post(':id/messages')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Send project message' })
  async sendProjectMessage(@Req() req: Request) {
    return this.proxy.forward('projects', req);
  }

  @Get('health')
  @ApiOperation({ summary: 'Projects service health check' })
  async health(@Req() req: Request) {
    return this.proxy.forward('projects', req);
  }
}
