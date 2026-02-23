import { Controller, Get, Patch, Post, Delete, Param, Query, Body, UseGuards } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { QueryNotificationsDto } from '../dto/query-notifications.dto';
import { MarkReadDto } from '../dto/mark-read.dto';
import { MarkSelectedReadDto } from '../dto/mark-selected-read.dto';
import { JwtAuthGuard, CurrentUser, AuthenticatedUser } from '@nestlancer/auth-lib';
import { ApiStandardResponse } from '@nestlancer/common/decorators/api-standard-response.decorator';
import { ApiPaginatedResponse } from '@nestlancer/common/decorators/api-paginated.decorator';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
    constructor(private readonly notificationsService: NotificationsService) { }

    @Get()
    @ApiPaginatedResponse(Object)
    async getNotifications(
        @CurrentUser() user: AuthenticatedUser,
        @Query() query: QueryNotificationsDto,
    ) {
        return this.notificationsService.findByUser(user.id, query);
    }

    @Get('unread-count')
    @ApiStandardResponse(Object)
    async getUnreadCount(@CurrentUser() user: AuthenticatedUser) {
        return this.notificationsService.getUnreadCount(user.id);
    }

    @Get('history')
    @ApiPaginatedResponse(Object)
    async getHistory(
        @CurrentUser() user: AuthenticatedUser,
        @Query() query: QueryNotificationsDto,
    ) {
        return this.notificationsService.getHistory(user.id, query);
    }

    @Get(':id')
    @ApiStandardResponse(Object)
    async getNotification(
        @CurrentUser() user: AuthenticatedUser,
        @Param('id') id: string,
    ) {
        return this.notificationsService.findByIdAndUser(id, user.id);
    }

    @Patch(':id/read')
    @ApiStandardResponse(Object)
    async markAsRead(
        @CurrentUser() user: AuthenticatedUser,
        @Param('id') id: string,
        @Body() dto: MarkReadDto,
    ) {
        return this.notificationsService.markRead(id, user.id, dto.read ?? true);
    }

    @Patch(':id/unread')
    @ApiStandardResponse(Object)
    async markAsUnread(
        @CurrentUser() user: AuthenticatedUser,
        @Param('id') id: string,
    ) {
        return this.notificationsService.markRead(id, user.id, false);
    }

    @Post('read-all')
    @ApiStandardResponse(Object)
    async markAllAsRead(@CurrentUser() user: AuthenticatedUser) {
        return this.notificationsService.markAllRead(user.id);
    }

    @Post('read-selected')
    @ApiStandardResponse(Object)
    async markSelectedAsRead(
        @CurrentUser() user: AuthenticatedUser,
        @Body() dto: MarkSelectedReadDto,
    ) {
        return this.notificationsService.markSelectedRead(user.id, dto.notificationIds);
    }

    @Delete('clear-read')
    @ApiStandardResponse(Object)
    async clearReadNotifications(@CurrentUser() user: AuthenticatedUser) {
        return this.notificationsService.clearRead(user.id);
    }

    @Delete(':id')
    @ApiStandardResponse(Object)
    async deleteNotification(
        @CurrentUser() user: AuthenticatedUser,
        @Param('id') id: string,
    ) {
        return this.notificationsService.softDelete(id, user.id);
    }
}
