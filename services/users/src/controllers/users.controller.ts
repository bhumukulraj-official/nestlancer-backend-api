import { Controller, Get, Patch, Post, Delete, Body, Param, UseGuards, UseInterceptors, UploadedFile, Req } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiStandardResponse } from '@nestlancer/common/decorators/api-standard-response.decorator';
import { ActiveUser } from '@nestlancer/auth-lib/decorators/active-user.decorator';
import { JwtAuthGuard } from '@nestlancer/auth-lib/guards/jwt-auth.guard';
import { ProfileService } from '../services/profile.service';
import { PreferencesService } from '../services/preferences.service';
import { AvatarService } from '../services/avatar.service';
import { SessionsService } from '../services/sessions.service';
import { AccountService } from '../services/account.service';
import { UpdateProfileDto } from '../dto/update-profile.dto';
import { UpdatePreferencesDto } from '../dto/update-preferences.dto';
import { ChangePasswordDto } from '../dto/change-password.dto';
import { DeleteAccountDto } from '../dto/delete-account.dto';

@Controller()
@UseGuards(JwtAuthGuard)
export class UsersController {
    constructor(
        private readonly profileService: ProfileService,
        private readonly preferencesService: PreferencesService,
        private readonly avatarService: AvatarService,
        private readonly sessionsService: SessionsService,
        private readonly accountService: AccountService,
    ) { }

    @Get('health')
    @ApiStandardResponse()
    healthCheck() {
        return { status: 'ok', service: 'users' };
    }

    // --- Profile Management ---

    @Get('profile')
    @ApiStandardResponse()
    getProfile(@ActiveUser('sub') userId: string) {
        return this.profileService.getProfile(userId);
    }

    @Patch('profile')
    @ApiStandardResponse({ message: 'Profile updated successfully' })
    updateProfile(@ActiveUser('sub') userId: string, @Body() dto: UpdateProfileDto) {
        return this.profileService.updateProfile(userId, dto);
    }

    @Post('avatar')
    @UseInterceptors(FileInterceptor('file'))
    @ApiStandardResponse({ message: 'Avatar uploaded successfully' })
    uploadAvatar(@ActiveUser('sub') userId: string, @UploadedFile() file: Express.Multer.File) {
        return this.avatarService.uploadAvatar(userId, file);
    }

    @Delete('avatar')
    @ApiStandardResponse({ message: 'Avatar removed successfully' })
    removeAvatar(@ActiveUser('sub') userId: string) {
        return this.avatarService.removeAvatar(userId);
    }

    @Get('preferences')
    @ApiStandardResponse()
    getPreferences(@ActiveUser('sub') userId: string) {
        return this.preferencesService.getPreferences(userId);
    }

    @Patch('preferences')
    @ApiStandardResponse({ message: 'Preferences updated successfully' })
    updatePreferences(@ActiveUser('sub') userId: string, @Body() dto: UpdatePreferencesDto) {
        return this.preferencesService.updatePreferences(userId, dto);
    }

    // --- Session Management ---

    @Get('sessions')
    @ApiStandardResponse()
    getSessions(@ActiveUser('sub') userId: string, @ActiveUser('jti') jti: string) {
        return this.sessionsService.getSessions(userId, jti);
    }

    @Delete('sessions/:sessionId')
    @ApiStandardResponse({ message: 'Session terminated successfully' })
    terminateSession(@ActiveUser('sub') userId: string, @Param('sessionId') sessionId: string, @ActiveUser('jti') jti: string) {
        return this.sessionsService.terminateSession(userId, sessionId, jti);
    }

    @Post('sessions/terminate-others')
    @ApiStandardResponse({ message: 'All other sessions terminated successfully' })
    terminateOtherSessions(@ActiveUser('sub') userId: string, @ActiveUser('jti') jti: string) {
        return this.sessionsService.terminateOtherSessions(userId, jti);
    }

    // --- Account Management ---

    @Post('delete-account')
    @ApiStandardResponse({ message: 'Account deletion scheduled. You have 30 days to cancel this request.' })
    deleteAccount(@ActiveUser('sub') userId: string, @Body() dto: DeleteAccountDto) {
        return this.accountService.requestAccountDeletion(userId, dto);
    }

    @Post('cancel-deletion')
    @ApiStandardResponse({ message: 'Account deletion cancelled successfully.' })
    cancelDeletion(@ActiveUser('sub') userId: string) {
        return this.accountService.cancelDeletionRequest(userId);
    }
}
