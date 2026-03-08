import { Controller, Post, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard, CurrentUser, AuthenticatedUser } from '@nestlancer/auth-lib';
import { ApiStandardResponse } from '@nestlancer/common';

@Controller('push')
@UseGuards(JwtAuthGuard)
export class PushController {

    @Post('register')
    @ApiStandardResponse(Object)
    async registerDevice(
        @CurrentUser() user: AuthenticatedUser,
        @Body() body: { token: string; deviceId: string; platform: string },
    ) {
        // TODO: Register push notification device token
        return { userId: user.userId, deviceId: body.deviceId, registered: true };
    }

    @Delete('unregister/:deviceId')
    @ApiStandardResponse(Object)
    async unregisterDevice(
        @CurrentUser() user: AuthenticatedUser,
        @Param('deviceId') deviceId: string,
    ) {
        // TODO: Unregister push notification device
        return { userId: user.userId, deviceId, unregistered: true };
    }
}
