import { Controller, Get, Patch, Post, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiStandardResponse, UserRole } from '@nestlancer/common';
import { JwtAuthGuard, RolesGuard, Roles } from '@nestlancer/auth-lib';
import { UsersAdminService } from '../services/users.admin.service';
import { AdminUpdateUserDto } from '../dto/admin-update-user.dto';
import { AdminChangeRoleDto } from '../dto/admin-change-role.dto';
import { AdminBulkOperationDto } from '../dto/admin-bulk-operation.dto';

@Controller('admin/users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, 'SUPER_ADMIN' as any)
export class UsersAdminController {
    constructor(private readonly adminService: UsersAdminService) { }

    @Get()
    @ApiStandardResponse()
    listUsers(
        @Query('page') page: string = '1',
        @Query('limit') limit: string = '20',
        @Query('status') status?: string
    ) {
        return this.adminService.listUsers(parseInt(page, 10), parseInt(limit, 10), status);
    }

    @Get('search')
    @ApiStandardResponse()
    searchUsers(
        @Query('q') query: string,
        @Query('page') page: string = '1',
        @Query('limit') limit: string = '20',
    ) {
        return this.adminService.searchUsers(query, parseInt(page, 10), parseInt(limit, 10));
    }

    @Get(':userId')
    @ApiStandardResponse()
    getUserDetails(@Param('userId') userId: string) {
        return this.adminService.getUserDetails(userId);
    }

    @Patch(':userId')
    @ApiStandardResponse({ message: 'User updated successfully' })
    updateUser(@Param('userId') userId: string, @Body() dto: AdminUpdateUserDto) {
        return this.adminService.updateUser(userId, dto);
    }

    @Patch(':userId/role')
    @ApiStandardResponse({ message: 'User role updated successfully' })
    changeRole(@Param('userId') userId: string, @Body() dto: AdminChangeRoleDto) {
        return this.adminService.changeRole(userId, dto.role);
    }

    @Patch(':userId/status')
    @ApiStandardResponse({ message: 'User status updated successfully' })
    changeUserStatus(@Param('userId') userId: string, @Body('status') status: string) {
        return this.adminService.changeUserStatus(userId, status);
    }

    @Post(':userId/force-password-reset')
    @ApiStandardResponse({ message: 'Password reset forced. User will be required to change password on next login.' })
    forcePasswordReset(@Param('userId') userId: string) {
        return this.adminService.forcePasswordReset(userId);
    }

    @Post(':userId/reset-password')
    @ApiStandardResponse({ message: 'Password reset successfully' })
    adminResetPassword(@Param('userId') userId: string, @Body('newPassword') newPassword?: string) {
        return this.adminService.adminResetPassword(userId, newPassword);
    }

    @Get(':userId/sessions')
    @ApiStandardResponse()
    getUserSessions(@Param('userId') userId: string) {
        return this.adminService.getUserSessions(userId);
    }

    @Delete('sessions/:sessionId')
    @ApiStandardResponse({ message: 'User session terminated successfully' })
    terminateUserSession(@Param('sessionId') sessionId: string) {
        return this.adminService.terminateUserSession(sessionId);
    }

    @Post(':userId/terminate-all-sessions')
    @ApiStandardResponse({ message: 'All user sessions terminated' })
    terminateAllUserSessions(@Param('userId') userId: string) {
        return this.adminService.terminateAllUserSessions(userId);
    }

    @Post(':userId/export')
    @ApiStandardResponse({ message: 'User data export triggered successfully' })
    exportUserData(@Param('userId') userId: string) {
        return { message: 'Export scheduled' };
    }

    @Get(':userId/activity')
    @ApiStandardResponse()
    getUserActivity(
        @Param('userId') userId: string,
        @Query('page') page: string = '1',
        @Query('limit') limit: string = '50',
    ) {
        return this.adminService.getUserActivity(userId, parseInt(page, 10), parseInt(limit, 10));
    }

    @Delete(':userId')
    @ApiStandardResponse({ message: 'User deleted successfully' })
    deleteUser(@Param('userId') userId: string) {
        return this.adminService.deleteUser(userId);
    }

    @Post(':userId/restore')
    @ApiStandardResponse({ message: 'User restored successfully' })
    restoreUser(@Param('userId') userId: string) {
        return this.adminService.restoreUser(userId);
    }

    @Post('bulk')
    @ApiStandardResponse({ message: 'Bulk operation completed' })
    bulkOperation(@Body() dto: AdminBulkOperationDto) {
        return this.adminService.bulkOperation(dto);
    }

    @Get('../logs')
    @ApiStandardResponse()
    getLogs(
        @Query('page') page: string = '1',
        @Query('limit') limit: string = '50',
    ) {
        return this.adminService.getLogs(parseInt(page, 10), parseInt(limit, 10));
    }

    @Get('../logs/security-stats')
    @ApiStandardResponse()
    getSecurityStats() {
        return this.adminService.getSecurityStats();
    }
}
