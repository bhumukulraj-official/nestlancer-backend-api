import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard, RolesGuard, Roles } from '@nestlancer/auth-lib';
import { UserRole } from '@nestlancer/common/enums/role.enum';
import { SuccessResponse } from '@nestlancer/common/decorators/success-response.decorator';
import { SuperAdminGuard } from '../../guards/super-admin.guard';
import { DashboardService } from '../../services/dashboard.service';
import { DashboardQueryDto } from '../../dto/dashboard-query.dto';
import { RevenueQueryDto } from '../../dto/revenue-query.dto';
import { DashboardRevenueService } from '../../services/dashboard-revenue.service';
import { DashboardUsersService } from '../../services/dashboard-users.service';
import { DashboardProjectsService } from '../../services/dashboard-projects.service';
import { DashboardPerformanceService } from '../../services/dashboard-performance.service';

@ApiTags('Admin - Dashboard')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard, SuperAdminGuard)
@Roles(UserRole.ADMIN)
@Controller('dashboard')
export class DashboardAdminController {
    constructor(
        private readonly dashboardService: DashboardService,
        private readonly revenueService: DashboardRevenueService,
        private readonly usersService: DashboardUsersService,
        private readonly projectsService: DashboardProjectsService,
        private readonly performanceService: DashboardPerformanceService,
    ) { }

    @Get('overview')
    @ApiOperation({ summary: 'Get dashboard overview metrics' })
    @SuccessResponse('Dashboard overview retrieved successfully')
    async getOverview(@Query() query: DashboardQueryDto) {
        return this.dashboardService.getOverview(query);
    }

    @Get('revenue')
    @ApiOperation({ summary: 'Get revenue analytics' })
    @SuccessResponse('Revenue analytics retrieved successfully')
    async getRevenue(@Query() query: RevenueQueryDto) {
        return this.revenueService.getRevenue(query);
    }

    @Get('users')
    @ApiOperation({ summary: 'Get user metrics' })
    @SuccessResponse('User metrics retrieved successfully')
    async getUsers() {
        return this.usersService.getUserMetrics();
    }

    @Get('projects')
    @ApiOperation({ summary: 'Get project metrics' })
    @SuccessResponse('Project metrics retrieved successfully')
    async getProjects() {
        return this.projectsService.getProjectMetrics();
    }

    @Get('performance')
    @ApiOperation({ summary: 'Get system performance metrics' })
    @SuccessResponse('Performance metrics retrieved successfully')
    async getPerformance() {
        return this.performanceService.getPerformance();
    }

    @Get('activity')
    @ApiOperation({ summary: 'Get recent activity' })
    @SuccessResponse('Recent activity retrieved successfully')
    async getActivity() {
        return { data: [] }; // Mocked directly for brevity since DashboardService already mocks this
    }

    @Get('alerts')
    @ApiOperation({ summary: 'Get system alerts' })
    @SuccessResponse('Alerts retrieved successfully')
    async getAlerts() {
        return { data: [] }; // Mocked directly
    }
}
