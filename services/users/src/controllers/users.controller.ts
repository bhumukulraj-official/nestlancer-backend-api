import { Controller, Get, Patch, Post, Delete, Body, Param, Query, UseGuards, UseInterceptors, UploadedFile, Req } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiStandardResponse } from '@nestlancer/common';
import { ActiveUser, JwtAuthGuard } from '@nestlancer/auth-lib';
import { ProfileService } from '../services/profile.service';
import { PreferencesService } from '../services/preferences.service';
import { AvatarService } from '../services/avatar.service';
import { SessionsService } from '../services/sessions.service';
import { AccountService } from '../services/account.service';
import { TwoFactorService } from '../services/two-factor.service';
import { ActivityService } from '../services/activity.service';
import { UpdateProfileDto } from '../dto/update-profile.dto';
import { UpdatePreferencesDto } from '../dto/update-preferences.dto';
import { ChangePasswordDto } from '../dto/change-password.dto';
import { DeleteAccountDto } from '../dto/delete-account.dto';
import { Enable2FADto } from '../dto/enable-2fa.dto';
import { Verify2FASetupDto } from '../dto/verify-2fa-setup.dto';
import { Disable2FADto } from '../dto/disable-2fa.dto';

@Controller()
@UseGuards(JwtAuthGuard)
export class UsersController {
    constructor(
        private readonly profileService: ProfileService,
        private readonly preferencesService: PreferencesService,
        private readonly avatarService: AvatarService,
        private readonly sessionsService: SessionsService,
        private readonly accountService: AccountService,
        private readonly twoFactorService: TwoFactorService,
        private readonly activityService: ActivityService,
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

    // --- Password & Security ---

    @Patch('password')
    @ApiStandardResponse({ message: 'Password changed successfully' })
    changePassword(@ActiveUser('sub') userId: string, @Body() dto: ChangePasswordDto) {
        return this.profileService.changePassword(userId, dto);
    }

    /** @doc Alias: POST /change-password (API spec) */
    @Post('change-password')
    @ApiStandardResponse({ message: 'Password changed successfully. Please login with your new password.' })
    changePasswordPost(@ActiveUser('sub') userId: string, @Body() dto: ChangePasswordDto) {
        return this.profileService.changePassword(userId, dto);
    }

    // --- Two-Factor Authentication ---

    @Post('2fa/enable')
    @ApiStandardResponse({ message: '2FA setup initiated' })
    enable2FA(@ActiveUser('sub') userId: string, @Body() dto: Enable2FADto) {
        return this.twoFactorService.enable2FA(userId, dto);
    }

    @Post('2fa/verify')
    @ApiStandardResponse({ message: '2FA enabled successfully' })
    verify2FASetup(@ActiveUser('sub') userId: string, @Body() dto: Verify2FASetupDto) {
        return this.twoFactorService.verify2FASetup(userId, dto);
    }

    @Post('2fa/disable')
    @ApiStandardResponse({ message: '2FA disabled successfully' })
    disable2FA(@ActiveUser('sub') userId: string, @Body() dto: Disable2FADto) {
        return this.twoFactorService.disable2FA(userId, dto);
    }

    @Get('2fa/status')
    @ApiStandardResponse()
    get2FAStatus(@ActiveUser('sub') userId: string) {
        return this.twoFactorService.get2FAStatus(userId);
    }

    @Get('2fa/backup-codes')
    @ApiStandardResponse()
    getBackupCodes(@ActiveUser('sub') userId: string) {
        return this.twoFactorService.getBackupCodes(userId);
    }

    @Post('2fa/regenerate-codes')
    @ApiStandardResponse({ message: 'Backup codes regenerated' })
    regenerateBackupCodes(@ActiveUser('sub') userId: string, @Body() dto: Enable2FADto) {
        return this.twoFactorService.regenerateBackupCodes(userId, dto);
    }

    // --- Session Management ---

    @Get('sessions')
    @ApiStandardResponse()
    getSessions(@ActiveUser('sub') userId: string, @ActiveUser('jti') jti: string) {
        return this.sessionsService.getSessions(userId, jti);
    }

    @Get('sessions/:sessionId')
    @ApiStandardResponse()
    getSessionDetails(@ActiveUser('sub') userId: string, @Param('sessionId') sessionId: string) {
        return this.sessionsService.getSessionById(userId, sessionId);
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

    // --- Activity & Data Export ---

    @Get('activity')
    @ApiStandardResponse()
    getActivity(
        @ActiveUser('sub') userId: string,
        @Query('page') page: string = '1',
        @Query('limit') limit: string = '20',
    ) {
        return this.activityService.getActivityLog(userId, parseInt(page, 10), parseInt(limit, 10));
    }

    @Get('export')
    @ApiStandardResponse()
    requestDataExport(@ActiveUser('sub') userId: string) {
        return this.activityService.requestDataExport(userId);
    }

    /** @doc Alias: GET /data-export (API spec) */
    @Get('data-export')
    @ApiStandardResponse()
    requestDataExportAlias(@ActiveUser('sub') userId: string) {
        return this.activityService.requestDataExport(userId);
    }

    @Get('export/:id')
    @ApiStandardResponse()
    downloadDataExport(@ActiveUser('sub') userId: string, @Param('id') exportId: string) {
        return this.activityService.downloadDataExport(userId, exportId);
    }
}
