import { Controller, Get, Patch, Post, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiStandardResponse } from '@nestlancer/common/decorators/api-standard-response.decorator';
import { JwtAuthGuard } from '@nestlancer/auth-lib/guards/jwt-auth.guard';
import { RolesGuard } from '@nestlancer/auth-lib/guards/roles.guard';
import { Roles } from '@nestlancer/auth-lib/decorators/roles.decorator';
import { UserRole } from '@nestlancer/common/enums/role.enum';
import { UsersAdminService } from '../services/users.admin.service';

@Controller('admin/users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
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

    @Get(':userId')
    @ApiStandardResponse()
    getUserDetails(@Param('userId') userId: string) {
        return this.adminService.getUserDetails(userId);
    }

    @Patch(':userId/status')
    @ApiStandardResponse({ message: 'User status updated successfully' })
    changeUserStatus(@Param('userId') userId: string, @Body('status') status: string) {
        return this.adminService.changeUserStatus(userId, status);
    }

    @Post(':userId/reset-password')
    @ApiStandardResponse({ message: 'Password reset successfully' })
    adminResetPassword(@Param('userId') userId: string, @Body('newPassword') newPassword?: string) {
        return this.adminService.adminResetPassword(userId, newPassword);
    }
}
