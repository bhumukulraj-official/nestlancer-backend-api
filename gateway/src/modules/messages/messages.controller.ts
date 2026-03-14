import { Controller, Get, Post, Patch, Delete, Param, Body, Query, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { Request } from 'express';
import { HttpProxyService } from '../../proxy';

/**
 * Messages Gateway Controller
 * Routes messaging requests to the Messaging Service.
 *
 * Messaging service: prefix api + URI v1
 * Controllers: @Controller('conversations'), @Controller('messages'),
 *              @Controller('messages/:messageId/threads')
 *
 * Since the gateway controller is @Controller('messages'), paths like
 * /api/v1/messages/... will be forwarded as-is to the messaging service
 * which has @Controller('messages'). For conversations-related endpoints,
 * we use pathOverride to route to /api/v1/conversations/...
 */
@Controller('messages')
@ApiTags('messages')
@ApiBearerAuth()
export class MessagesController {
  constructor(private readonly proxy: HttpProxyService) { }

  // --- Conversations (maps to @Controller('conversations')) ---

  @Get('conversations')
  @ApiOperation({ summary: 'List user conversations' })
  async getConversations(@Req() req: Request) {
    return this.proxy.forward('messaging', req, undefined, '/api/v1/conversations');
  }

  @Get('conversations/unread-count')
  @ApiOperation({ summary: 'Get total unread message count' })
  async getUnreadCount(@Req() req: Request) {
    return this.proxy.forward('messaging', req, undefined, '/api/v1/conversations/unread-count');
  }

  // --- Messages (maps to @Controller('messages')) ---

  @Get()
  @ApiOperation({ summary: 'List messages' })
  async listMessages(@Req() req: Request) {
    return this.proxy.forward('messaging', req);
  }

  @Post()
  @ApiOperation({ summary: 'Send a message' })
  async sendMessage(@Req() req: Request) {
    return this.proxy.forward('messaging', req);
  }

  @Get('health')
  @ApiOperation({ summary: 'Messaging service health check' })
  async health(@Req() req: Request) {
    return this.proxy.forward('messaging', req);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get message details' })
  @ApiParam({ name: 'id', description: 'Message UUID' })
  async getMessageDetails(@Req() req: Request) {
    return this.proxy.forward('messaging', req);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a message' })
  @ApiParam({ name: 'id', description: 'Message UUID' })
  async deleteMessage(@Req() req: Request) {
    return this.proxy.forward('messaging', req);
  }

  @Post(':id/read')
  @ApiOperation({ summary: 'Mark message as read' })
  @ApiParam({ name: 'id', description: 'Message UUID' })
  async markAsRead(@Req() req: Request) {
    return this.proxy.forward('messaging', req);
  }

  // --- Threads (maps to @Controller('messages/:messageId/threads')) ---

  @Get(':messageId/threads')
  @ApiOperation({ summary: 'Get message threads' })
  @ApiParam({ name: 'messageId', description: 'Parent message UUID' })
  async getThreads(@Req() req: Request) {
    return this.proxy.forward('messaging', req);
  }

  @Post(':messageId/threads')
  @ApiOperation({ summary: 'Reply in thread' })
  @ApiParam({ name: 'messageId', description: 'Parent message UUID' })
  async replyInThread(@Req() req: Request) {
    return this.proxy.forward('messaging', req);
  }
}
