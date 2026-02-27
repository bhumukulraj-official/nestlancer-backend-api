import { Controller, Get, Post, Patch, Delete, Param, Body, Query, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Request } from 'express';
import { HttpProxyService } from '../../proxy';

/**
 * Admin Gateway Controller
 * Routes admin requests to the Admin Service
 * All endpoints require admin authentication
 */
@Controller('admin')
@ApiTags('admin')
@ApiBearerAuth()
export class AdminController {
  constructor(private readonly proxy: HttpProxyService) {}

  // --- Dashboard ---

  @Get('dashboard/overview')
  @ApiOperation({ summary: 'Get dashboard overview metrics' })
  async getDashboardOverview(@Req() req: Request) {
    return this.proxy.forward('admin', req);
  }

  @Get('dashboard/revenue')
  @ApiOperation({ summary: 'Get revenue analytics' })
  async getRevenueAnalytics(@Req() req: Request) {
    return this.proxy.forward('admin', req);
  }

  @Get('dashboard/users')
  @ApiOperation({ summary: 'Get user metrics' })
  async getUserMetrics(@Req() req: Request) {
    return this.proxy.forward('admin', req);
  }

  @Get('dashboard/projects')
  @ApiOperation({ summary: 'Get project metrics' })
  async getProjectMetrics(@Req() req: Request) {
    return this.proxy.forward('admin', req);
  }

  @Get('dashboard/performance')
  @ApiOperation({ summary: 'Get system performance metrics' })
  async getPerformanceMetrics(@Req() req: Request) {
    return this.proxy.forward('admin', req);
  }

  @Get('dashboard/activity')
  @ApiOperation({ summary: 'Get recent activity' })
  async getRecentActivity(@Req() req: Request) {
    return this.proxy.forward('admin', req);
  }

  @Get('dashboard/alerts')
  @ApiOperation({ summary: 'Get system alerts' })
  async getSystemAlerts(@Req() req: Request) {
    return this.proxy.forward('admin', req);
  }

  // --- User Management ---

  @Get('users')
  @ApiOperation({ summary: 'List all users' })
  async listUsers(@Req() req: Request) {
    return this.proxy.forward('admin', req);
  }

  @Get('users/search')
  @ApiOperation({ summary: 'Search users' })
  async searchUsers(@Req() req: Request) {
    return this.proxy.forward('admin', req);
  }

  @Get('users/:userId')
  @ApiOperation({ summary: 'Get user details' })
  async getUser(@Req() req: Request) {
    return this.proxy.forward('admin', req);
  }

  @Patch('users/:userId')
  @ApiOperation({ summary: 'Update user' })
  async updateUser(@Req() req: Request) {
    return this.proxy.forward('admin', req);
  }

  @Patch('users/:userId/role')
  @ApiOperation({ summary: 'Change user role' })
  async changeUserRole(@Req() req: Request) {
    return this.proxy.forward('admin', req);
  }

  @Patch('users/:userId/status')
  @ApiOperation({ summary: 'Change account status' })
  async changeUserStatus(@Req() req: Request) {
    return this.proxy.forward('admin', req);
  }

  @Post('users/:userId/force-password-reset')
  @ApiOperation({ summary: 'Force password reset' })
  async forcePasswordReset(@Req() req: Request) {
    return this.proxy.forward('admin', req);
  }

  @Post('users/:userId/reset-password')
  @ApiOperation({ summary: 'Admin sets password' })
  async adminResetPassword(@Req() req: Request) {
    return this.proxy.forward('admin', req);
  }

  @Get('users/:userId/sessions')
  @ApiOperation({ summary: 'View user sessions' })
  async getUserSessions(@Req() req: Request) {
    return this.proxy.forward('admin', req);
  }

  @Delete('users/sessions/:sessionId')
  @ApiOperation({ summary: 'Terminate any session' })
  async terminateAnySession(@Req() req: Request) {
    return this.proxy.forward('admin', req);
  }

  @Post('users/:userId/terminate-all-sessions')
  @ApiOperation({ summary: 'End all user sessions' })
  async terminateAllUserSessions(@Req() req: Request) {
    return this.proxy.forward('admin', req);
  }

  @Get('users/:userId/activity')
  @ApiOperation({ summary: 'View user activity' })
  async getUserActivity(@Req() req: Request) {
    return this.proxy.forward('admin', req);
  }

  @Delete('users/:userId')
  @ApiOperation({ summary: 'Delete user account' })
  async deleteUser(@Req() req: Request) {
    return this.proxy.forward('admin', req);
  }

  @Post('users/:userId/restore')
  @ApiOperation({ summary: 'Restore deleted user' })
  async restoreUser(@Req() req: Request) {
    return this.proxy.forward('admin', req);
  }

  @Post('users/bulk')
  @ApiOperation({ summary: 'Bulk user operations' })
  async bulkUserOperations(@Req() req: Request) {
    return this.proxy.forward('admin', req);
  }

  // --- Audit Logs ---

  @Get('logs')
  @ApiOperation({ summary: 'Auth audit logs' })
  async getAuditLogs(@Req() req: Request) {
    return this.proxy.forward('admin', req);
  }

  @Get('logs/security-stats')
  @ApiOperation({ summary: 'Security metrics' })
  async getSecurityStats(@Req() req: Request) {
    return this.proxy.forward('admin', req);
  }

  // --- System Configuration ---

  @Get('system/config')
  @ApiOperation({ summary: 'Get system configuration' })
  async getSystemConfig(@Req() req: Request) {
    return this.proxy.forward('admin', req);
  }

  @Patch('system/config')
  @ApiOperation({ summary: 'Update system configuration' })
  async updateSystemConfig(@Req() req: Request) {
    return this.proxy.forward('admin', req);
  }

  // --- Feature Flags ---

  @Get('system/feature-flags')
  @ApiOperation({ summary: 'List feature flags' })
  async getFeatureFlags(@Req() req: Request) {
    return this.proxy.forward('admin', req);
  }

  @Post('system/feature-flags')
  @ApiOperation({ summary: 'Create feature flag' })
  async createFeatureFlag(@Req() req: Request) {
    return this.proxy.forward('admin', req);
  }

  @Patch('system/feature-flags/:id')
  @ApiOperation({ summary: 'Update feature flag' })
  async updateFeatureFlag(@Req() req: Request) {
    return this.proxy.forward('admin', req);
  }

  @Delete('system/feature-flags/:id')
  @ApiOperation({ summary: 'Delete feature flag' })
  async deleteFeatureFlag(@Req() req: Request) {
    return this.proxy.forward('admin', req);
  }

  // --- Email Templates ---

  @Get('system/email-templates')
  @ApiOperation({ summary: 'List email templates' })
  async getEmailTemplates(@Req() req: Request) {
    return this.proxy.forward('admin', req);
  }

  @Get('system/email-templates/:id')
  @ApiOperation({ summary: 'Get email template' })
  async getEmailTemplate(@Req() req: Request) {
    return this.proxy.forward('admin', req);
  }

  @Patch('system/email-templates/:id')
  @ApiOperation({ summary: 'Update email template' })
  async updateEmailTemplate(@Req() req: Request) {
    return this.proxy.forward('admin', req);
  }

  @Get('system/email-templates/:id/preview')
  @ApiOperation({ summary: 'Preview email template' })
  async previewEmailTemplate(@Req() req: Request) {
    return this.proxy.forward('admin', req);
  }

  @Post('system/email-templates/:id/test')
  @ApiOperation({ summary: 'Send test email' })
  async sendTestEmail(@Req() req: Request) {
    return this.proxy.forward('admin', req);
  }

  // --- Backups ---

  @Get('system/backups')
  @ApiOperation({ summary: 'List backups' })
  async listBackups(@Req() req: Request) {
    return this.proxy.forward('admin', req);
  }

  @Post('system/backups')
  @ApiOperation({ summary: 'Create backup' })
  async createBackup(@Req() req: Request) {
    return this.proxy.forward('admin', req);
  }

  @Post('system/backups/:id/restore')
  @ApiOperation({ summary: 'Restore from backup' })
  async restoreBackup(@Req() req: Request) {
    return this.proxy.forward('admin', req);
  }

  @Delete('system/backups/:id')
  @ApiOperation({ summary: 'Delete backup' })
  async deleteBackup(@Req() req: Request) {
    return this.proxy.forward('admin', req);
  }

  @Get('health')
  @ApiOperation({ summary: 'Admin service health check' })
  async health(@Req() req: Request) {
    return this.proxy.forward('admin', req);
  }
}
