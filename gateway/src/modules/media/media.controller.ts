import { Controller, Get, Post, Patch, Delete, Param, Body, Query, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Request } from 'express';
import { HttpProxyService } from '../../proxy';

/**
 * Media Gateway Controller
 * Routes media requests to the Media Service
 */
@Controller('media')
@ApiTags('media')
@ApiBearerAuth()
export class MediaController {
  constructor(private readonly proxy: HttpProxyService) {}

  @Get()
  @ApiOperation({ summary: 'List media files' })
  async findAll(@Req() req: Request) {
    return this.proxy.forward('media', req);
  }

  @Post('upload')
  @ApiOperation({ summary: 'Upload media file' })
  async upload(@Req() req: Request) {
    return this.proxy.forward('media', req);
  }

  @Get('health')
  @ApiOperation({ summary: 'Media service health check' })
  async health(@Req() req: Request) {
    return this.proxy.forward('media', req);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Storage stats' })
  async stats(@Req() req: Request) {
    return this.proxy.forward('media', req);
  }

  @Get(':id/status')
  @ApiOperation({ summary: 'Media processing status' })
  async processingStatus(@Req() req: Request) {
    return this.proxy.forward('media', req);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get media by ID' })
  async findOne(@Req() req: Request) {
    return this.proxy.forward('media', req);
  }

  @Get(':id/download')
  @ApiOperation({ summary: 'Download media file' })
  async download(@Req() req: Request) {
    return this.proxy.forward('media', req);
  }

  @Get(':id/preview')
  @ApiOperation({ summary: 'Get media preview' })
  async preview(@Req() req: Request) {
    return this.proxy.forward('media', req);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update media metadata' })
  async update(@Req() req: Request) {
    return this.proxy.forward('media', req);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete media' })
  async remove(@Req() req: Request) {
    return this.proxy.forward('media', req);
  }
}
