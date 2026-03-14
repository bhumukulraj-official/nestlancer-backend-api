import { Controller, Get, Post, Patch, Delete, Param, Body, Query, Req, UseInterceptors } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam, ApiConsumes } from '@nestjs/swagger';
import { Request } from 'express';
import { HttpProxyService } from '../../proxy';
import { Public } from '@nestlancer/common';

/**
 * Media Gateway Controller
 * Routes media requests to the Media Service.
 *
 * Media service: prefix api/v1, @Controller('media')
 * Available: list, request-upload, confirm-upload, direct-upload, details,
 *            update-metadata, delete, download-url, storage-stats,
 *            copy, move, regenerate-thumbnail, versions
 * Also: chunked uploads at @Controller('media/upload/chunked')
 *       share at @Controller('media') (share endpoints)
 */
@Controller('media')
@ApiTags('media')
@ApiBearerAuth()
export class MediaController {
  constructor(private readonly proxy: HttpProxyService) { }

  @Get()
  @ApiOperation({ summary: 'List user media files' })
  async listMedia(@Req() req: Request) {
    return this.proxy.forward('media', req);
  }

  @Post('request')
  @ApiOperation({ summary: 'Request a presigned upload URL' })
  async requestUpload(@Req() req: Request) {
    return this.proxy.forward('media', req);
  }

  @Post('confirm')
  @ApiOperation({ summary: 'Confirm a completed upload' })
  async confirmUpload(@Req() req: Request) {
    return this.proxy.forward('media', req);
  }

  @Post('direct-upload')
  @ApiOperation({ summary: 'Direct file upload' })
  @ApiConsumes('multipart/form-data')
  async directUpload(@Req() req: Request) {
    return this.proxy.forward('media', req);
  }

  @Get('storage-stats')
  @ApiOperation({ summary: 'Get storage usage statistics' })
  async getStorageStats(@Req() req: Request) {
    return this.proxy.forward('media', req);
  }

  @Public()
  @Get('health')
  @ApiOperation({ summary: 'Media service health check' })
  async health(@Req() req: Request) {
    return this.proxy.forward('media', req);
  }

  // --- Chunked uploads ---

  @Post('upload/chunked/init')
  @ApiOperation({ summary: 'Initialize chunked upload' })
  async initChunkedUpload(@Req() req: Request) {
    return this.proxy.forward('media', req);
  }

  @Post('upload/chunked/:uploadId/chunk')
  @ApiOperation({ summary: 'Upload a chunk' })
  @ApiParam({ name: 'uploadId', description: 'Chunked upload session ID' })
  async uploadChunk(@Req() req: Request) {
    return this.proxy.forward('media', req);
  }

  @Post('upload/chunked/:uploadId/complete')
  @ApiOperation({ summary: 'Complete chunked upload' })
  @ApiParam({ name: 'uploadId', description: 'Chunked upload session ID' })
  async completeChunkedUpload(@Req() req: Request) {
    return this.proxy.forward('media', req);
  }

  // --- Individual media operations ---

  @Get(':id')
  @ApiOperation({ summary: 'Get media details' })
  @ApiParam({ name: 'id', description: 'Media UUID' })
  async getMediaDetails(@Req() req: Request) {
    return this.proxy.forward('media', req);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update media metadata' })
  @ApiParam({ name: 'id', description: 'Media UUID' })
  async updateMetadata(@Req() req: Request) {
    return this.proxy.forward('media', req);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete media' })
  @ApiParam({ name: 'id', description: 'Media UUID' })
  async deleteMedia(@Req() req: Request) {
    return this.proxy.forward('media', req);
  }

  @Get(':id/download-url')
  @ApiOperation({ summary: 'Get download URL for media' })
  @ApiParam({ name: 'id', description: 'Media UUID' })
  async getDownloadUrl(@Req() req: Request) {
    return this.proxy.forward('media', req);
  }

  @Post(':id/copy')
  @ApiOperation({ summary: 'Copy media to another folder' })
  @ApiParam({ name: 'id', description: 'Media UUID' })
  async copyMedia(@Req() req: Request) {
    return this.proxy.forward('media', req);
  }

  @Post(':id/move')
  @ApiOperation({ summary: 'Move media to another folder' })
  @ApiParam({ name: 'id', description: 'Media UUID' })
  async moveMedia(@Req() req: Request) {
    return this.proxy.forward('media', req);
  }

  @Post(':id/regenerate-thumbnail')
  @ApiOperation({ summary: 'Regenerate media thumbnail' })
  @ApiParam({ name: 'id', description: 'Media UUID' })
  async regenerateThumbnail(@Req() req: Request) {
    return this.proxy.forward('media', req);
  }

  @Get(':id/versions')
  @ApiOperation({ summary: 'Get media version history' })
  @ApiParam({ name: 'id', description: 'Media UUID' })
  async getVersions(@Req() req: Request) {
    return this.proxy.forward('media', req);
  }

  // --- Share endpoints ---

  @Post(':id/share')
  @ApiOperation({ summary: 'Create share link for media' })
  @ApiParam({ name: 'id', description: 'Media UUID' })
  async createShareLink(@Req() req: Request) {
    return this.proxy.forward('media', req);
  }

  @Get(':id/shares')
  @ApiOperation({ summary: 'List share links for media' })
  @ApiParam({ name: 'id', description: 'Media UUID' })
  async listShareLinks(@Req() req: Request) {
    return this.proxy.forward('media', req);
  }
}
