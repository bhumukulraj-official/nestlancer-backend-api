import { Controller, Post, Delete, Body, UseGuards } from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { RegisterPushSubscriptionDto } from '../dto/register-push-subscription.dto';
import { JwtAuthGuard, CurrentUser, AuthenticatedUser } from '@nestlancer/auth-lib';
import { ApiStandardResponse } from '@nestlancer/common';

@Controller('notifications/push-subscription')
@UseGuards(JwtAuthGuard)
export class SubscriptionsController {
    constructor(private readonly subscriptionsService: SubscriptionsService) { }

    @Post()
    @ApiStandardResponse(Object)
    async registerSubscription(
        @CurrentUser() user: AuthenticatedUser,
        @Body() dto: RegisterPushSubscriptionDto,
    ) {
        return this.subscriptionsService.register(user.userId, dto);
    }

    @Delete()
    @ApiStandardResponse(Object)
    async removeSubscription(
        @CurrentUser() user: AuthenticatedUser,
        @Body('endpoint') endpoint: string,
    ) {
        return this.subscriptionsService.unregister(user.userId, endpoint);
    }
}
