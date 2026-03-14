import { Controller, Get, Post, Patch, Delete, Param, Body, Query, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { Request } from 'express';
import { HttpProxyService } from '../../proxy';
import { Public } from '@nestlancer/common';

/**
 * Portfolio Gateway Controller
 * Routes portfolio requests to the Portfolio Service.
 *
 * Portfolio service: prefix api + URI v1, @Controller('portfolio')
 * Public: list, featured, categories, tags, search, detail, like
 * Health: at portfolio/health
 */
@Controller('portfolio')
@ApiTags('portfolio')
export class PortfolioController {
  constructor(private readonly proxy: HttpProxyService) { }

  @Public()
  @Get()
  @ApiOperation({ summary: 'List published portfolio items' })
  async list(@Req() req: Request) {
    return this.proxy.forward('portfolio', req);
  }

  @Public()
  @Get('featured')
  @ApiOperation({ summary: 'Get featured portfolio items' })
  async getFeatured(@Req() req: Request) {
    return this.proxy.forward('portfolio', req);
  }

  @Public()
  @Get('categories')
  @ApiOperation({ summary: 'Get portfolio categories' })
  async getCategories(@Req() req: Request) {
    return this.proxy.forward('portfolio', req);
  }

  @Public()
  @Get('tags')
  @ApiOperation({ summary: 'Get all portfolio tags' })
  async getTags(@Req() req: Request) {
    return this.proxy.forward('portfolio', req);
  }

  @Public()
  @Get('search')
  @ApiOperation({ summary: 'Search portfolio items' })
  async search(@Req() req: Request) {
    return this.proxy.forward('portfolio', req);
  }

  @Public()
  @Get('health')
  @ApiOperation({ summary: 'Portfolio service health check' })
  async health(@Req() req: Request) {
    return this.proxy.forward('portfolio', req);
  }

  @Public()
  @Get(':idOrSlug')
  @ApiOperation({ summary: 'Get portfolio item details' })
  @ApiParam({ name: 'idOrSlug', description: 'Item UUID or URL slug' })
  async getDetail(@Req() req: Request) {
    return this.proxy.forward('portfolio', req);
  }

  @Post(':id/like')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Toggle like on portfolio item' })
  @ApiParam({ name: 'id', description: 'Portfolio item UUID' })
  async toggleLike(@Req() req: Request) {
    return this.proxy.forward('portfolio', req);
  }
}
