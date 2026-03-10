import { Controller, Post, Body, UseGuards, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { NotificationsAdminService } from '../notifications/notifications-admin.service';
import { SendNotificationDto } from '../dto/send-notification.dto';
import { JwtAuthGuard } from '@nestlancer/auth-lib';
import { ApiStandardResponse } from '@nestlancer/common';

/**
 * Controller for internal inter-service notification triggers.
 * Restricted to internal calls or administrative context.
 */
@ApiTags('Internal Notifications')
@ApiBearerAuth()
@Controller('internal/notifications')
@UseGuards(JwtAuthGuard)
export class InternalController {
  constructor(private readonly adminService: NotificationsAdminService) {}

  /**
   * Triggers a notification from another microservice.
   * Useful for synchronous event-based notifications.
   */
  @Post('trigger')
  @ApiOperation({ summary: 'Trigger an internal notification' })
  @ApiStandardResponse(Object)
  async triggerNotification(@Body() dto: SendNotificationDto): Promise<any> {
    // This allows other services to send notifications via direct HTTP call if not using queue
    return this.adminService.sendTargeted(dto);
  }
}
