import { Controller, Get, Post, Delete, Param, Query, Body, UseGuards } from '@nestjs/common';
import { NotificationsAdminService } from './notifications-admin.service';
import { NotificationBroadcastService } from './notification-broadcast.service';
import { NotificationSegmentService } from './notification-segment.service';
import { QueryNotificationsDto } from '../dto/query-notifications.dto';
import { SendNotificationDto } from '../dto/send-notification.dto';
import { BroadcastNotificationDto } from '../dto/broadcast-notification.dto';
import { SegmentNotificationDto } from '../dto/segment-notification.dto';
import { JwtAuthGuard, RolesGuard, Roles } from '@nestlancer/auth-lib';
import { UserRole, ApiStandardResponse, ApiPaginated } from '@nestlancer/common';

@Controller('admin/notifications')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class NotificationsAdminController {
    constructor(
        private readonly adminService: NotificationsAdminService,
        private readonly broadcastService: NotificationBroadcastService,
        private readonly segmentService: NotificationSegmentService,
    ) { }

    @Get()
    @ApiPaginated()
    async getAllNotifications(@Query() query: QueryNotificationsDto): Promise<any> {
        return this.adminService.findAll(query);
    }

    @Get('stats')
    @ApiStandardResponse(Object)
    async getStats() {
        return this.adminService.getStats();
    }

    @Get('delivery-report')
    @ApiStandardResponse(Object)
    async getDeliveryReport(@Query('notificationId') id: string) {
        return this.adminService.getDeliveryReport(id);
    }

    @Post('send')
    @ApiStandardResponse(Object)
    async sendNotification(@Body() dto: SendNotificationDto) {
        return this.adminService.sendTargeted(dto);
    }

    @Post('broadcast')
    @ApiStandardResponse(Object)
    async broadcastNotification(@Body() dto: BroadcastNotificationDto) {
        return this.broadcastService.broadcast(dto);
    }

    @Post('segment')
    @ApiStandardResponse(Object)
    async sendToSegment(@Body() dto: SegmentNotificationDto) {
        return this.segmentService.sendToSegment(dto);
    }

    @Delete('user/:userId')
    @ApiStandardResponse(Object)
    async clearUserNotifications(@Param('userId') userId: string): Promise<any> {
        return this.adminService.clearUserNotifications(userId);
    }

    @Post(':id/resend')
    @ApiStandardResponse(Object)
    async resendNotification(@Param('id') id: string) {
        // TODO: Resend a notification
        return { id, status: 'resent' };
    }
}
