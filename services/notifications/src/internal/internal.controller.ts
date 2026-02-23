import { Controller, Post, Body, UseGuards, Param } from '@nestjs/common';
import { NotificationsAdminService } from '../notifications/notifications-admin.service';
import { SendNotificationDto } from '../dto/send-notification.dto';
import { JwtAuthGuard } from '@nestlancer/auth-lib';
import { ApiStandardResponse } from '@nestlancer/common/decorators/api-standard-response.decorator';

// Note: In a real microservices setup, internal communication might rely on JWTs signed by 
// the API Gateway or inter-service auth tokens. Using standard JwtAuthGuard for placeholder.
@Controller('internal/notifications')
@UseGuards(JwtAuthGuard)
export class InternalController {
    constructor(private readonly adminService: NotificationsAdminService) { }

    @Post('trigger')
    @ApiStandardResponse(Object)
    async triggerNotification(@Body() dto: SendNotificationDto) {
        // This allows other services to send notifications via direct HTTP call if not using queue
        return this.adminService.sendTargeted(dto);
    }
}
