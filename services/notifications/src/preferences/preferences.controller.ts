import { Controller, Get, Patch, Body, UseGuards, Param } from '@nestjs/common';
import { PreferencesService } from './preferences.service';
import { UpdatePreferencesDto } from '../dto/update-preferences.dto';
import { JwtAuthGuard, CurrentUser, AuthenticatedUser } from '@nestlancer/auth-lib';
import { ApiStandardResponse } from '@nestlancer/common';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class PreferencesController {
    constructor(private readonly preferencesService: PreferencesService) { }

    @Get('preferences')
    @ApiStandardResponse(Object)
    async getPreferences(@CurrentUser() user: AuthenticatedUser) {
        return this.preferencesService.getPreferences(user.userId);
    }

    @Patch('preferences')
    @ApiStandardResponse(Object)
    async updatePreferences(
        @CurrentUser() user: AuthenticatedUser,
        @Body() dto: UpdatePreferencesDto,
    ) {
        return this.preferencesService.updatePreferences(user.userId, dto);
    }

    @Get('channels')
    @ApiStandardResponse(Object)
    async getNotificationChannels() {
        return this.preferencesService.getChannels();
    }

    @Get('preferences/channels')
    @ApiStandardResponse(Object)
    async getChannels() {
        return this.preferencesService.getChannels();
    }

    @Patch('preferences/channel/:channel')
    @ApiStandardResponse(Object)
    async updateChannel(
        @CurrentUser() user: AuthenticatedUser,
        @Param('channel') channel: string,
        @Body() body: { enabled: boolean },
    ) {
        // TODO: Update specific channel preference
        return { userId: user.userId, channel, enabled: body.enabled, updated: true };
    }
}
