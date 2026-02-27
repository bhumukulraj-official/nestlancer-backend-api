import { Controller, Get, Post, Patch, Delete, Param, Body, Query, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Request } from 'express';
import { Public } from '@nestlancer/common';
import { HttpProxyService } from '../../proxy';

/**
 * Portfolio Gateway Controller
 * Routes portfolio requests to the Portfolio Service
 */
@Controller('portfolio')
@ApiTags('portfolio')
export class PortfolioController {
  constructor(private readonly proxy: HttpProxyService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: 'List public portfolio items' })
  async findAll(@Req() req: Request) {
    return this.proxy.forward('portfolio', req);
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Get portfolio item by ID' })
  async findOne(@Req() req: Request) {
    return this.proxy.forward('portfolio', req);
  }

  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create portfolio item' })
  async create(@Req() req: Request) {
    return this.proxy.forward('portfolio', req);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update portfolio item' })
  async update(@Req() req: Request) {
    return this.proxy.forward('portfolio', req);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete portfolio item' })
  async remove(@Req() req: Request) {
    return this.proxy.forward('portfolio', req);
  }

  @Get(':id/related')
  @Public()
  @ApiOperation({ summary: 'Get related portfolio items' })
  async getRelated(@Req() req: Request) {
    return this.proxy.forward('portfolio', req);
  }

  @Get('categories')
  @Public()
  @ApiOperation({ summary: 'List portfolio categories' })
  async getCategories(@Req() req: Request) {
    return this.proxy.forward('portfolio', req);
  }

  @Get('health')
  @ApiOperation({ summary: 'Portfolio service health check' })
  async health(@Req() req: Request) {
    return this.proxy.forward('portfolio', req);
  }
}
