import { Controller, Get, Post, Patch, Delete, Param, Body, Query, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Request } from 'express';
import { HttpProxyService } from '../../proxy';

/**
 * Notifications Gateway Controller
 * Routes notification requests to the Notifications Service
 */
@Controller('notifications')
@ApiTags('notifications')
@ApiBearerAuth()
export class NotificationsController {
  constructor(private readonly proxy: HttpProxyService) {}

  @Get()
  @ApiOperation({ summary: 'List notifications' })
  async findAll(@Req() req: Request) {
    return this.proxy.forward('notifications', req);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get notification by ID' })
  async findOne(@Req() req: Request) {
    return this.proxy.forward('notifications', req);
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark notification as read' })
  async markAsRead(@Req() req: Request) {
    return this.proxy.forward('notifications', req);
  }

  @Post('mark-all-read')
  @ApiOperation({ summary: 'Mark all notifications as read' })
  async markAllAsRead(@Req() req: Request) {
    return this.proxy.forward('notifications', req);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete notification' })
  async remove(@Req() req: Request) {
    return this.proxy.forward('notifications', req);
  }

  @Get('preferences')
  @ApiOperation({ summary: 'Get notification preferences' })
  async getPreferences(@Req() req: Request) {
    return this.proxy.forward('notifications', req);
  }

  @Patch('preferences')
  @ApiOperation({ summary: 'Update notification preferences' })
  async updatePreferences(@Req() req: Request) {
    return this.proxy.forward('notifications', req);
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Get unread notification count' })
  async getUnreadCount(@Req() req: Request) {
    return this.proxy.forward('notifications', req);
  }

  @Get('health')
  @ApiOperation({ summary: 'Notifications service health check' })
  async health(@Req() req: Request) {
    return this.proxy.forward('notifications', req);
  }
}
