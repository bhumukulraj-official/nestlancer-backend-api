import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard, CurrentUser, AuthenticatedUser } from '@nestlancer/auth-lib';
import { ApiStandardResponse } from '@nestlancer/common';
import { NotificationsService } from './notifications.service';

/**
 * Routes at /api/v1/... (after gateway strips /notifications).
 * Used for GET /health and POST /test when gateway forwards to notifications service.
 */
@Controller()
export class NotificationsRootController {
    constructor(private readonly notificationsService: NotificationsService) { }

    @Get('health')
    health() {
        return { status: 'ok', service: 'notifications' };
    }

    @Post('test')
    @UseGuards(JwtAuthGuard)
    @ApiStandardResponse(Object)
    async sendTest(@CurrentUser() user: AuthenticatedUser) {
        await this.notificationsService.sendTestNotification(user.userId);
        return { sent: true };
    }
}
