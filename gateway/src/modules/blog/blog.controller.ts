import { Controller, Get, Post, Patch, Delete, Param, Body, Query, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Request } from 'express';
import { Public } from '@nestlancer/common';
import { HttpProxyService } from '../../proxy';

/**
 * Blog Gateway Controller
 * Routes blog requests to the Blog Service
 */
@Controller('blog')
@ApiTags('blog')
export class BlogController {
  constructor(private readonly proxy: HttpProxyService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: 'List blog posts' })
  async findAll(@Req() req: Request) {
    return this.proxy.forward('blog', req);
  }

  @Get('posts')
  @Public()
  @ApiOperation({ summary: 'List blog posts' })
  async listPosts(@Req() req: Request) {
    return this.proxy.forward('blog', req);
  }

  @Get('posts/:slug')
  @Public()
  @ApiOperation({ summary: 'Get blog post by slug' })
  async getPostBySlug(@Req() req: Request) {
    return this.proxy.forward('blog', req);
  }

  @Post('posts')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create blog post' })
  async create(@Req() req: Request) {
    return this.proxy.forward('blog', req);
  }

  @Patch('posts/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update blog post' })
  async update(@Req() req: Request) {
    return this.proxy.forward('blog', req);
  }

  @Delete('posts/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete blog post' })
  async remove(@Req() req: Request) {
    return this.proxy.forward('blog', req);
  }

  @Get('categories')
  @Public()
  @ApiOperation({ summary: 'List blog categories' })
  async getCategories(@Req() req: Request) {
    return this.proxy.forward('blog', req);
  }

  @Get('tags')
  @Public()
  @ApiOperation({ summary: 'List blog tags' })
  async getTags(@Req() req: Request) {
    return this.proxy.forward('blog', req);
  }

  @Get('health')
  @ApiOperation({ summary: 'Blog service health check' })
  async health(@Req() req: Request) {
    return this.proxy.forward('blog', req);
  }
}
