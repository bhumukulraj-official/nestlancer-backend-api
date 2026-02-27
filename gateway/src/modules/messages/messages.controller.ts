import { Controller, Get, Post, Patch, Delete, Param, Body, Query, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Request } from 'express';
import { HttpProxyService } from '../../proxy';

/**
 * Messages Gateway Controller
 * Routes messaging requests to the Messaging Service
 */
@Controller('messages')
@ApiTags('messages')
@ApiBearerAuth()
export class MessagesController {
  constructor(private readonly proxy: HttpProxyService) {}

  @Get()
  @ApiOperation({ summary: 'List conversations' })
  async findAll(@Req() req: Request) {
    return this.proxy.forward('messaging', req);
  }

  @Post()
  @ApiOperation({ summary: 'Create conversation' })
  async create(@Req() req: Request) {
    return this.proxy.forward('messaging', req);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get conversation by ID' })
  async findOne(@Req() req: Request) {
    return this.proxy.forward('messaging', req);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update conversation' })
  async update(@Req() req: Request) {
    return this.proxy.forward('messaging', req);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete conversation' })
  async remove(@Req() req: Request) {
    return this.proxy.forward('messaging', req);
  }

  @Get(':id/messages')
  @ApiOperation({ summary: 'Get messages in conversation' })
  async getMessages(@Req() req: Request) {
    return this.proxy.forward('messaging', req);
  }

  @Post(':id/messages')
  @ApiOperation({ summary: 'Send message' })
  async sendMessage(@Req() req: Request) {
    return this.proxy.forward('messaging', req);
  }

  @Post(':id/read')
  @ApiOperation({ summary: 'Mark conversation as read' })
  async markAsRead(@Req() req: Request) {
    return this.proxy.forward('messaging', req);
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Get unread message count' })
  async getUnreadCount(@Req() req: Request) {
    return this.proxy.forward('messaging', req);
  }

  @Get('health')
  @ApiOperation({ summary: 'Messaging service health check' })
  async health(@Req() req: Request) {
    return this.proxy.forward('messaging', req);
  }
}
