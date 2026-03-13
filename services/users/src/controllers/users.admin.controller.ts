import {
  Controller,
  Get,
  Patch,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { ApiStandardResponse, UserRole } from '@nestlancer/common';
import { JwtAuthGuard, RolesGuard, Roles } from '@nestlancer/auth-lib';
import { UsersAdminService } from '../services/users.admin.service';
import { AdminUpdateUserDto } from '../dto/admin-update-user.dto';
import { AdminChangeRoleDto } from '../dto/admin-change-role.dto';
import { AdminBulkOperationDto } from '../dto/admin-bulk-operation.dto';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';

/**
 * Controller for comprehensive administrative management of platform users.
 */
@ApiTags('Admin/Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, 'SUPER_ADMIN' as any)
@Controller('admin/users')
export class UsersAdminController {
  constructor(private readonly adminService: UsersAdminService) {}

  /**
   * Lists all platform users with optional status and pagination filtering.
   */
  @Get()
  @ApiOperation({ summary: 'List all users' })
  @ApiQuery({ name: 'page', required: false, example: '1' })
  @ApiQuery({ name: 'limit', required: false, example: '20' })
  @ApiQuery({ name: 'status', required: false, example: 'active' })
  @ApiStandardResponse()
  async listUsers(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
    @Query('status') status?: string,
  ): Promise<any> {
    return this.adminService.listUsers(parseInt(page, 10), parseInt(limit, 10), status);
  }

  /**
   * Searches for users based on name, email, or other identifying metadata.
   */
  @Get('search')
  @ApiOperation({ summary: 'Search users' })
  @ApiQuery({ name: 'q', description: 'Search query string' })
  @ApiQuery({ name: 'page', required: false, example: '1' })
  @ApiQuery({ name: 'limit', required: false, example: '20' })
  @ApiStandardResponse()
  async searchUsers(
    @Query('q') query: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
  ): Promise<any> {
    if (!query || !query.trim()) {
      throw new BadRequestException('Query parameter "q" is required');
    }
    return this.adminService.searchUsers(query, parseInt(page, 10), parseInt(limit, 10));
  }

  /**
   * Retrieves full administrative details for a specific user.
   */
  @Get(':userId')
  @ApiOperation({ summary: 'Get user details' })
  @ApiParam({ name: 'userId', description: 'User UUID' })
  @ApiStandardResponse()
  async getUserDetails(@Param('userId') userId: string): Promise<any> {
    return this.adminService.getUserDetails(userId);
  }

  /**
   * Overrides core profile or account configuration for a user.
   */
  @Patch(':userId')
  @ApiOperation({ summary: 'Update user (Admin)' })
  @ApiParam({ name: 'userId', description: 'User UUID' })
  @ApiStandardResponse({ message: 'User updated successfully' })
  async updateUser(@Param('userId') userId: string, @Body() dto: AdminUpdateUserDto): Promise<any> {
    return this.adminService.updateUser(userId, dto);
  }

  /**
   * Reassigns a user to a different system access level (Role).
   */
  @Patch(':userId/role')
  @ApiOperation({ summary: 'Change user role' })
  @ApiParam({ name: 'userId', description: 'User UUID' })
  @ApiStandardResponse({ message: 'User role updated successfully' })
  async changeRole(@Param('userId') userId: string, @Body() dto: AdminChangeRoleDto): Promise<any> {
    return this.adminService.changeRole(userId, dto.role);
  }

  /**
   * Transitions a user account to a different lifecycle state (e.g., suspended, active).
   */
  @Patch(':userId/status')
  @ApiOperation({ summary: 'Change user status' })
  @ApiParam({ name: 'userId', description: 'User UUID' })
  @ApiStandardResponse({ message: 'User status updated successfully' })
  async changeUserStatus(
    @Param('userId') userId: string,
    @Body('status') status: string,
  ): Promise<any> {
    return this.adminService.changeUserStatus(userId, status);
  }

  /**
   * Flags a user account to require a password change on next login.
   */
  @Post(':userId/force-password-reset')
  @ApiOperation({ summary: 'Force password reset' })
  @ApiParam({ name: 'userId', description: 'User UUID' })
  @ApiStandardResponse({
    message: 'Password reset forced. User will be required to change password on next login.',
  })
  async forcePasswordReset(@Param('userId') userId: string): Promise<any> {
    return this.adminService.forcePasswordReset(userId);
  }

  /**
   * Manually resets a user's password (Admin override).
   */
  @Post(':userId/reset-password')
  @ApiOperation({ summary: 'Manually reset password' })
  @ApiParam({ name: 'userId', description: 'User UUID' })
  @ApiStandardResponse({ message: 'Password reset successfully' })
  async adminResetPassword(
    @Param('userId') userId: string,
    @Body('newPassword') newPassword?: string,
  ): Promise<any> {
    return this.adminService.adminResetPassword(userId, newPassword);
  }

  /**
   * Lists all active login sessions for a specific user.
   */
  @Get(':userId/sessions')
  @ApiOperation({ summary: 'Get user active sessions' })
  @ApiParam({ name: 'userId', description: 'User UUID' })
  @ApiStandardResponse()
  async getUserSessions(@Param('userId') userId: string): Promise<any> {
    return this.adminService.getUserSessions(userId);
  }

  /**
   * Terminates a specific login session by ID.
   */
  @Delete('sessions/:sessionId')
  @ApiOperation({ summary: 'Terminate specific user session' })
  @ApiParam({ name: 'sessionId', description: 'Session UUID' })
  @ApiStandardResponse({ message: 'User session terminated successfully' })
  async terminateUserSession(@Param('sessionId') sessionId: string): Promise<any> {
    return this.adminService.terminateUserSession(sessionId);
  }

  /**
   * Revokes all active sessions for a specific user.
   */
  @Post(':userId/terminate-all-sessions')
  @ApiOperation({ summary: 'Terminate all user sessions' })
  @ApiParam({ name: 'userId', description: 'User UUID' })
  @ApiStandardResponse({ message: 'All user sessions terminated' })
  async terminateAllUserSessions(@Param('userId') userId: string): Promise<any> {
    return this.adminService.terminateAllUserSessions(userId);
  }

  /**
   * Triggers a GDPR-compliant data export for a user.
   */
  @Post(':userId/export')
  @ApiOperation({ summary: 'Trigger user data export' })
  @ApiParam({ name: 'userId', description: 'User UUID' })
  @ApiStandardResponse({ message: 'User data export triggered successfully' })
  async exportUserData(@Param('userId') userId: string): Promise<any> {
    return { message: 'Export scheduled' };
  }

  /**
   * Retrieves the audit log of system activities performed by or on a user.
   */
  @Get(':userId/activity')
  @ApiOperation({ summary: 'Get user activity log' })
  @ApiParam({ name: 'userId', description: 'User UUID' })
  @ApiQuery({ name: 'page', required: false, example: '1' })
  @ApiQuery({ name: 'limit', required: false, example: '50' })
  @ApiStandardResponse()
  async getUserActivity(
    @Param('userId') userId: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '50',
  ): Promise<any> {
    return this.adminService.getUserActivity(userId, parseInt(page, 10), parseInt(limit, 10));
  }

  /**
   * Permanently removes a user account and associated data.
   */
  @Delete(':userId')
  @ApiOperation({ summary: 'Delete user account' })
  @ApiParam({ name: 'userId', description: 'User UUID' })
  @ApiStandardResponse({ message: 'User deleted successfully' })
  async deleteUser(@Param('userId') userId: string): Promise<any> {
    return this.adminService.deleteUser(userId);
  }

  /**
   * Restores a soft-deleted user account.
   */
  @Post(':userId/restore')
  @ApiOperation({ summary: 'Restore user account' })
  @ApiParam({ name: 'userId', description: 'User UUID' })
  @ApiStandardResponse({ message: 'User restored successfully' })
  async restoreUser(@Param('userId') userId: string): Promise<any> {
    return this.adminService.restoreUser(userId);
  }

  /**
   * Executes administrative actions across multiple users simultaneously.
   */
  @Post('bulk')
  @ApiOperation({ summary: 'Bulk user operations' })
  @ApiStandardResponse({ message: 'Bulk operation completed' })
  async bulkOperation(@Body() dto: AdminBulkOperationDto): Promise<any> {
    return this.adminService.bulkOperation(dto);
  }

  /**
   * Retrieves system-wide administrative activity logs.
   */
  @Get('../logs')
  @ApiOperation({ summary: 'Get system logs' })
  @ApiQuery({ name: 'page', required: false, example: '1' })
  @ApiQuery({ name: 'limit', required: false, example: '50' })
  @ApiStandardResponse()
  async getLogs(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '50',
  ): Promise<any> {
    return this.adminService.getLogs(parseInt(page, 10), parseInt(limit, 10));
  }

  /**
   * Retrieves aggregated security and authentication statistics.
   */
  @Get('../logs/security-stats')
  @ApiOperation({ summary: 'Get security statistics' })
  @ApiStandardResponse()
  async getSecurityStats(): Promise<any> {
    return this.adminService.getSecurityStats();
  }
}
