import { Controller, Get, Post, Patch, Delete, Param, Body, Query, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Request } from 'express';
import { HttpProxyService } from '../../proxy';

/**
 * Users Gateway Controller
 * Routes user management requests to the Users Service
 */
@Controller('users')
@ApiTags('users')
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly proxy: HttpProxyService) {}

  // --- Profile Management ---

  @Get('profile')
  @ApiOperation({ summary: 'Get current user profile' })
  async getProfile(@Req() req: Request) {
    return this.proxy.forward('users', req);
  }

  @Patch('profile')
  @ApiOperation({ summary: 'Update user profile' })
  async updateProfile(@Req() req: Request) {
    return this.proxy.forward('users', req);
  }

  @Post('avatar')
  @ApiOperation({ summary: 'Upload avatar' })
  async uploadAvatar(@Req() req: Request) {
    return this.proxy.forward('users', req);
  }

  @Delete('avatar')
  @ApiOperation({ summary: 'Remove avatar' })
  async removeAvatar(@Req() req: Request) {
    return this.proxy.forward('users', req);
  }

  @Get('preferences')
  @ApiOperation({ summary: 'Get user preferences' })
  async getPreferences(@Req() req: Request) {
    return this.proxy.forward('users', req);
  }

  @Patch('preferences')
  @ApiOperation({ summary: 'Update user preferences' })
  async updatePreferences(@Req() req: Request) {
    return this.proxy.forward('users', req);
  }

  // --- Password & Security ---

  @Post('change-password')
  @ApiOperation({ summary: 'Change password' })
  async changePassword(@Req() req: Request) {
    return this.proxy.forward('users', req);
  }

  // --- Two-Factor Authentication ---

  @Post('2fa/enable')
  @ApiOperation({ summary: 'Start 2FA setup' })
  async enable2FA(@Req() req: Request) {
    return this.proxy.forward('users', req);
  }

  @Post('2fa/verify')
  @ApiOperation({ summary: 'Complete 2FA setup' })
  async verify2FA(@Req() req: Request) {
    return this.proxy.forward('users', req);
  }

  @Post('2fa/disable')
  @ApiOperation({ summary: 'Disable 2FA' })
  async disable2FA(@Req() req: Request) {
    return this.proxy.forward('users', req);
  }

  @Get('2fa/backup-codes')
  @ApiOperation({ summary: 'Get backup codes' })
  async getBackupCodes(@Req() req: Request) {
    return this.proxy.forward('users', req);
  }

  @Post('2fa/regenerate-codes')
  @ApiOperation({ summary: 'Regenerate backup codes' })
  async regenerateBackupCodes(@Req() req: Request) {
    return this.proxy.forward('users', req);
  }

  // --- Session Management ---

  @Get('sessions')
  @ApiOperation({ summary: 'List active sessions' })
  async getSessions(@Req() req: Request) {
    return this.proxy.forward('users', req);
  }

  @Delete('sessions/:sessionId')
  @ApiOperation({ summary: 'Terminate specific session' })
  async terminateSession(@Req() req: Request) {
    return this.proxy.forward('users', req);
  }

  @Post('sessions/terminate-others')
  @ApiOperation({ summary: 'Logout all other sessions' })
  async terminateOtherSessions(@Req() req: Request) {
    return this.proxy.forward('users', req);
  }

  // --- Account Management ---

  @Post('delete-account')
  @ApiOperation({ summary: 'Request account deletion' })
  async deleteAccount(@Req() req: Request) {
    return this.proxy.forward('users', req);
  }

  @Post('cancel-deletion')
  @ApiOperation({ summary: 'Cancel deletion request' })
  async cancelDeletion(@Req() req: Request) {
    return this.proxy.forward('users', req);
  }

  @Get('activity')
  @ApiOperation({ summary: 'View activity history' })
  async getActivity(@Req() req: Request) {
    return this.proxy.forward('users', req);
  }

  @Get('data-export')
  @ApiOperation({ summary: 'Request GDPR data export' })
  async requestDataExport(@Req() req: Request) {
    return this.proxy.forward('users', req);
  }

  @Get('health')
  @ApiOperation({ summary: 'Users service health check' })
  async health(@Req() req: Request) {
    return this.proxy.forward('users', req);
  }
}
