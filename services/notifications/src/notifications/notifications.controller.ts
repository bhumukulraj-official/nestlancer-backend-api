import { Controller, Get, Patch, Post, Delete, Param, Query, Body, UseGuards } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { QueryNotificationsDto } from '../dto/query-notifications.dto';
import { MarkReadDto } from '../dto/mark-read.dto';
import { MarkSelectedReadDto } from '../dto/mark-selected-read.dto';
import { ApiStandardResponse, ApiPaginated, CurrentUser, AuthenticatedUser } from '@nestlancer/common';
import { JwtAuthGuard } from '@nestlancer/auth-lib';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
    constructor(private readonly notificationsService: NotificationsService) { }

    @Get()
    @ApiPaginated()
    async getNotifications(
        @CurrentUser() user: AuthenticatedUser,
        @Query() query: QueryNotificationsDto,
    ) {
        return this.notificationsService.findByUser(user.userId, query);
    }

    @Get('unread-count')
    @ApiStandardResponse(Object)
    async getUnreadCount(@CurrentUser() user: AuthenticatedUser) {
        return this.notificationsService.getUnreadCount(user.userId);
    }

    @Get('history')
    @ApiPaginated()
    async getHistory(
        @CurrentUser() user: AuthenticatedUser,
        @Query() query: QueryNotificationsDto,
    ) {
        return this.notificationsService.getHistory(user.userId, query);
    }

    @Get(':id')
    @ApiStandardResponse(Object)
    async getNotification(
        @CurrentUser() user: AuthenticatedUser,
        @Param('id') id: string,
    ) {
        return this.notificationsService.findByIdAndUser(id, user.userId);
    }

    @Patch(':id/read')
    @ApiStandardResponse(Object)
    async markAsRead(
        @CurrentUser() user: AuthenticatedUser,
        @Param('id') id: string,
        @Body() dto: MarkReadDto,
    ) {
        return this.notificationsService.markRead(id, user.userId, dto.read ?? true);
    }

    @Patch(':id/unread')
    @ApiStandardResponse(Object)
    async markAsUnread(
        @CurrentUser() user: AuthenticatedUser,
        @Param('id') id: string,
    ) {
        return this.notificationsService.markRead(id, user.userId, false);
    }

    @Post('read-all')
    @ApiStandardResponse(Object)
    async markAllAsRead(@CurrentUser() user: AuthenticatedUser) {
        return this.notificationsService.markAllRead(user.userId);
    }

    @Post('read-selected')
    @ApiStandardResponse(Object)
    async markSelectedAsRead(
        @CurrentUser() user: AuthenticatedUser,
        @Body() dto: MarkSelectedReadDto,
    ) {
        return this.notificationsService.markSelectedRead(user.userId, dto.notificationIds);
    }

    @Delete('clear-read')
    @ApiStandardResponse(Object)
    async clearReadNotifications(@CurrentUser() user: AuthenticatedUser) {
        return this.notificationsService.clearRead(user.userId);
    }

    @Delete(':id')
    @ApiStandardResponse(Object)
    async deleteNotification(
        @CurrentUser() user: AuthenticatedUser,
        @Param('id') id: string,
    ) {
        return this.notificationsService.softDelete(id, user.userId);
    }
}
