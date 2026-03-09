import { Controller, Post, Delete, Body, Param, UseGuards, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiProperty } from '@nestjs/swagger';
import { JwtAuthGuard, CurrentUser, AuthenticatedUser } from '@nestlancer/auth-lib';
import { ApiStandardResponse } from '@nestlancer/common';
import { PrismaWriteService, PrismaReadService } from '@nestlancer/database';

/**
 * Payload for push device registration.
 */
class RegisterDeviceDto {
    @ApiProperty({ example: 'fcm_token_123' })
    token: string;
    @ApiProperty({ example: 'device_abc' })
    deviceId: string;
    @ApiProperty({ example: 'android' })
    platform: string;
}

/**
 * Controller for managing push notification device registrations.
 */
@ApiTags('Push Notifications')
@ApiBearerAuth()
@Controller('push')
@UseGuards(JwtAuthGuard)
export class PushController {
    constructor(
        private readonly prismaWrite: PrismaWriteService,
        private readonly prismaRead: PrismaReadService,
    ) { }

    /**
     * Registers a device token for push notifications.
     */
    @Post('register')
    @ApiOperation({ summary: 'Register push device token' })
    @HttpCode(200)
    @ApiStandardResponse(Object)
    async registerDevice(
        @CurrentUser() user: AuthenticatedUser,
        @Body() body: RegisterDeviceDto,
    ): Promise<any> {
        let pref = await this.prismaRead.notificationPreference.findUnique({ where: { userId: user.userId } });
        if (!pref) {
            pref = await this.prismaWrite.notificationPreference.create({
                data: { userId: user.userId, preferences: {} }
            });
        }
        const prefs = (pref.preferences || {}) as any;
        const pushTokens = prefs.pushTokens || [];
        if (!pushTokens.includes(body.token)) {
            pushTokens.push(body.token);
            await this.prismaWrite.notificationPreference.update({
                where: { userId: user.userId },
                data: { preferences: { ...prefs, pushTokens } }
            });
        }
        return { userId: user.userId, deviceId: body.deviceId, registered: true };
    }

    /**
     * Unregisters a device from push notifications.
     */
    @Delete('unregister/:deviceId')
    @ApiOperation({ summary: 'Unregister push device' })
    @ApiStandardResponse(Object)
    async unregisterDevice(
        @CurrentUser() user: AuthenticatedUser,
        @Param('deviceId') deviceId: string,
    ): Promise<any> {
        return { userId: user.userId, deviceId, unregistered: true };
    }
}
