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
  constructor(private readonly proxy: HttpProxyService) { }

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

  @Get('users/logs')
  @ApiOperation({ summary: 'Admin audit logs' })
  async getUsersLogs(@Req() req: Request) {
    return this.proxy.forward('admin', req);
  }

  @Get('users/security-stats')
  @ApiOperation({ summary: 'Security metrics' })
  async getUsersSecurityStats(@Req() req: Request) {
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

  // --- Feature Flags (documented: GET /system/features + PATCH /system/features/:flag) ---

  @Get('system/features')
  @ApiOperation({ summary: 'List feature flags (doc path: features)' })
  async getSystemFeatures(@Req() req: Request) {
    return this.proxy.forward('admin', req);
  }

  @Patch('system/features/:flag')
  @ApiOperation({ summary: 'Toggle feature flag (doc param: flag)' })
  async patchSystemFeature(@Req() req: Request) {
    return this.proxy.forward('admin', req);
  }

  @Get('system/jobs')
  @ApiOperation({ summary: 'List background jobs' })
  async getSystemJobs(@Req() req: Request) {
    return this.proxy.forward('admin', req);
  }

  @Post('system/jobs/:id/retry')
  @ApiOperation({ summary: 'Retry failed job' })
  async retrySystemJob(@Req() req: Request) {
    return this.proxy.forward('admin', req);
  }

  @Delete('system/jobs/:id')
  @ApiOperation({ summary: 'Cancel job' })
  async cancelSystemJob(@Req() req: Request) {
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

  // --- Additional Proxy Endpoints ---

  @Post('users/:userId/export')
  @ApiOperation({ summary: 'Export user data' })
  async exportUserData(@Req() req: Request) {
    return this.proxy.forward('admin', req);
  }

  @Post('users/impersonate/end/:sessionId')
  @ApiOperation({ summary: 'End impersonation' })
  async endImpersonation(@Req() req: Request) {
    return this.proxy.forward('admin', req);
  }

  @Post('impersonate/end')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'End impersonation session (documented path)' })
  async endImpersonationAlias(@Req() req: Request) {
    return this.proxy.forward('admin', req);
  }

  @Get('impersonate/sessions')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List active impersonation sessions (documented path)' })
  async getImpersonationSessions(@Req() req: Request) {
    return this.proxy.forward('admin', req);
  }

  @Get('payments/milestones')
  @ApiOperation({ summary: 'List payment milestones' })
  async listPaymentMilestones(@Req() req: Request) {
    return this.proxy.forward('payments', req);
  }

  @Get('payments/milestones/:id')
  @ApiOperation({ summary: 'Get payment milestone details' })
  async getPaymentMilestone(@Req() req: Request) {
    return this.proxy.forward('payments', req);
  }

  @Post('payments/milestones/:id/mark-complete')
  @ApiOperation({ summary: 'Mark milestone complete' })
  async markMilestoneComplete(@Req() req: Request) {
    return this.proxy.forward('payments', req);
  }

  @Post('payments/milestones/:id/request-payment')
  @ApiOperation({ summary: 'Request payment for milestone' })
  async requestMilestonePayment(@Req() req: Request) {
    return this.proxy.forward('payments', req);
  }

  @Post('payments/projects/:projectId/milestones')
  @ApiOperation({ summary: 'Create milestones for a project' })
  async createProjectMilestones(@Req() req: Request) {
    return this.proxy.forward('payments', req);
  }

  @Patch('payments/milestones/:id')
  @ApiOperation({ summary: 'Update a milestone' })
  async updateMilestone(@Req() req: Request) {
    return this.proxy.forward('payments', req);
  }

  @Get('payments/disputes/:id')
  @ApiOperation({ summary: 'Get dispute details' })
  async getDisputeDetails(@Req() req: Request) {
    return this.proxy.forward('payments', req);
  }

  @Post('payments/:id/verify')
  @ApiOperation({ summary: 'Verify a payment' })
  async verifyPayment(@Req() req: Request) {
    return this.proxy.forward('payments', req);
  }

  @Post('payments/disputes/:id/respond')
  @ApiOperation({ summary: 'Respond to dispute' })
  async respondDispute(@Req() req: Request) {
    return this.proxy.forward('payments', req);
  }

  @Get('payments/reconciliation')
  @ApiOperation({ summary: 'Payment reconciliation' })
  async getReconciliation(@Req() req: Request) {
    return this.proxy.forward('payments', req);
  }

  @Post('messages/projects/:projectId/system')
  @ApiOperation({ summary: 'Broadcast system message' })
  async broadcastSystemMessage(@Req() req: Request) {
    return this.proxy.forward('messaging', req);
  }

  @Get('messages/flagged')
  @ApiOperation({ summary: 'Get flagged messages' })
  async getFlaggedMessages(@Req() req: Request) {
    return this.proxy.forward('messaging', req);
  }

  @Get('templates')
  @ApiOperation({ summary: 'Get notification templates' })
  async getNotificationTemplates(@Req() req: Request) {
    return this.proxy.forward('notifications', req);
  }

  @Post('templates')
  @ApiOperation({ summary: 'Create notification template' })
  async createNotificationTemplate(@Req() req: Request) {
    return this.proxy.forward('notifications', req);
  }

  @Post('posts/:id/archive')
  @ApiOperation({ summary: 'Archive post' })
  async archivePost(@Req() req: Request) {
    return this.proxy.forward('blog', req);
  }

  @Get('posts/:id/revisions')
  @ApiOperation({ summary: 'Get post revisions' })
  async getPostRevisions(@Req() req: Request) {
    return this.proxy.forward('blog', req);
  }

  @Post('posts/:id/revisions/:revisionId/restore')
  @ApiOperation({ summary: 'Restore post revision' })
  async restorePostRevision(@Req() req: Request) {
    return this.proxy.forward('blog', req);
  }

  @Get('comments/reported')
  @ApiOperation({ summary: 'Get reported comments' })
  async getReportedComments(@Req() req: Request) {
    return this.proxy.forward('blog', req);
  }

  @Post('comments/:id/reject')
  @ApiOperation({ summary: 'Reject comment' })
  async rejectComment(@Req() req: Request) {
    return this.proxy.forward('blog', req);
  }

  @Post('comments/:id/spam')
  @ApiOperation({ summary: 'Mark comment as spam' })
  async markCommentSpam(@Req() req: Request) {
    return this.proxy.forward('blog', req);
  }

  @Post('comments/:id/pin')
  @ApiOperation({ summary: 'Pin comment' })
  async pinComment(@Req() req: Request) {
    return this.proxy.forward('blog', req);
  }

  @Post('comments/:id/unpin')
  @ApiOperation({ summary: 'Unpin comment' })
  async unpinComment(@Req() req: Request) {
    return this.proxy.forward('blog', req);
  }

  @Post('blog/tags')
  @ApiOperation({ summary: 'Create tag' })
  async createTag(@Req() req: Request) {
    return this.proxy.forward('blog', req);
  }

  @Post('blog/tags/merge')
  @ApiOperation({ summary: 'Merge tags' })
  async mergeTags(@Req() req: Request) {
    return this.proxy.forward('blog', req);
  }

  @Get('blog/authors')
  @ApiOperation({ summary: 'Get authors' })
  async getAuthors(@Req() req: Request) {
    return this.proxy.forward('blog', req);
  }

  @Get('projects/stats')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get project stats' })
  async getProjectStats(@Req() req: Request) {
    return this.proxy.forward('projects', req);
  }

  @Post('projects/:id/duplicate')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Duplicate project as template' })
  async duplicateProject(@Req() req: Request) {
    return this.proxy.forward('projects', req);
  }

  @Post('projects/:id/unarchive')
  @ApiOperation({ summary: 'Unarchive project' })
  async unarchiveProject(@Req() req: Request) {
    return this.proxy.forward('projects', req);
  }

  @Post('projects/:id/export')
  @ApiOperation({ summary: 'Export project' })
  async exportProject(@Req() req: Request) {
    return this.proxy.forward('projects', req);
  }

  @Get('quotes/templates')
  @ApiOperation({ summary: 'Get quote templates' })
  async getAdminQuoteTemplates(@Req() req: Request) {
    return this.proxy.forward('quotes', req);
  }

  @Post('quotes/templates')
  @ApiOperation({ summary: 'Create quote template' })
  async createAdminQuoteTemplate(@Req() req: Request) {
    return this.proxy.forward('quotes', req);
  }

  @Post('quotes/:id/resend')
  @ApiOperation({ summary: 'Resend quote notification' })
  async resendQuote(@Req() req: Request) {
    return this.proxy.forward('quotes', req);
  }

  @Get('webhooks/health')
  @ApiOperation({ summary: 'Webhooks admin health' })
  async webhooksHealth(@Req() req: Request) {
    return this.proxy.forward('admin', req);
  }

  @Get('webhooks/events')
  @ApiOperation({ summary: 'List available webhook events' })
  async webhooksEvents(@Req() req: Request) {
    return this.proxy.forward('admin', req);
  }

  // --- Admin Contact ---

  @Get('contact')
  @ApiOperation({ summary: 'List contact messages (admin)' })
  async listContactMessages(@Req() req: Request) {
    return this.proxy.forward('contact', req);
  }

  @Get('contact/:id')
  @ApiOperation({ summary: 'Get contact message details (admin)' })
  async getContactMessage(@Req() req: Request) {
    return this.proxy.forward('contact', req);
  }

  @Patch('contact/:id/status')
  @ApiOperation({ summary: 'Update contact message status (admin)' })
  async updateContactStatus(@Req() req: Request) {
    return this.proxy.forward('contact', req);
  }

  @Post('contact/:id/respond')
  @ApiOperation({ summary: 'Respond to contact message (admin)' })
  async respondToContact(@Req() req: Request) {
    return this.proxy.forward('contact', req);
  }

  @Post('contact/:id/spam')
  @ApiOperation({ summary: 'Mark contact message as spam (admin)' })
  async markContactSpam(@Req() req: Request) {
    return this.proxy.forward('contact', req);
  }

  @Delete('contact/:id')
  @ApiOperation({ summary: 'Delete contact message (admin)' })
  async deleteContactMessage(@Req() req: Request) {
    return this.proxy.forward('contact', req);
  }

  @Get('health')
  @ApiOperation({ summary: 'Admin service health check' })
  async health(@Req() req: Request) {
    return this.proxy.forward('admin', req);
  }
}
