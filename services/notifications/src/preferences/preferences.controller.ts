import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common';
import { PreferencesService } from './preferences.service';
import { UpdatePreferencesDto } from '../dto/update-preferences.dto';
import { JwtAuthGuard, CurrentUser, AuthenticatedUser } from '@nestlancer/auth-lib';
import { ApiStandardResponse } from '@nestlancer/common';

@Controller('notifications/preferences')
@UseGuards(JwtAuthGuard)
export class PreferencesController {
    constructor(private readonly preferencesService: PreferencesService) { }

    @Get()
    @ApiStandardResponse(Object)
    async getPreferences(@CurrentUser() user: AuthenticatedUser) {
        return this.preferencesService.getPreferences(user.userId);
    }

    @Patch()
    @ApiStandardResponse(Object)
    async updatePreferences(
        @CurrentUser() user: AuthenticatedUser,
        @Body() dto: UpdatePreferencesDto,
    ) {
        return this.preferencesService.updatePreferences(user.userId, dto);
    }

    @Get('channels')
    @ApiStandardResponse(Object)
    async getChannels() {
        return this.preferencesService.getChannels();
    }
}
