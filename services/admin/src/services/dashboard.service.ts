import { Injectable, Inject } from '@nestjs/common';
import { CacheService } from '@nestlancer/cache';
import { ADMIN_CONFIG } from '../config/admin.config';
import { DashboardOverview } from '../interfaces/dashboard.interface';
import { DashboardQueryDto } from '../dto/dashboard-query.dto';
import { DashboardRevenueService } from './dashboard-revenue.service';
import { DashboardUsersService } from './dashboard-users.service';
import { DashboardProjectsService } from './dashboard-projects.service';
import { DashboardPerformanceService } from './dashboard-performance.service';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class DashboardService {
    constructor(
        private readonly cacheService: CacheService,
        private readonly revenueService: DashboardRevenueService,
        private readonly usersService: DashboardUsersService,
        private readonly projectsService: DashboardProjectsService,
        private readonly performanceService: DashboardPerformanceService,
        private readonly httpService: HttpService,
    ) { }

    async getOverview(query: DashboardQueryDto): Promise<DashboardOverview> {
        const period = query.period || 'MONTH';
        const cacheKey = `admin:dashboard:overview:${period}`;

        const cached = await this.cacheService.get<DashboardOverview>(cacheKey);
        if (cached) {
            return cached;
        }

        // In a real microservice environment, these would make HTTP calls to other services
        // via service discovery, or query shared read-replicas. 
        // Here we delegate to specialized services that abstract the data fetching.

        const [revenue, users, projects, performance] = await Promise.all([
            this.revenueService.getRevenueOverview(period),
            this.usersService.getUserOverview(period),
            this.projectsService.getProjectOverview(period),
            this.performanceService.getSystemPerformance(),
        ]);

        const overview: DashboardOverview = {
            period: {
                start: new Date().toISOString(), // Mock dates based on period
                end: new Date().toISOString(),
                days: 30,
            },
            summary: {
                totalUsers: users.total,
                newUsers: users.newThisMonth,
                activeProjects: projects.active,
                completedProjects: projects.completed,
                pendingRequests: 18, // Mocked for brevity
                openQuotes: 8,
                revenueThisMonth: revenue.total,
                currency: 'INR',
            },
            trends: {
                users: users.trend,
                revenue: revenue.trend,
                projects: projects.trend,
                requests: { current: 65, previous: 58, change: 12.07, trend: 'up' },
            },
            recentActivity: [], // Would aggregate from audit logs / event bus
            alerts: [], // Would query health / metrics
            charts: {
                revenueByMonth: revenue.chartData,
                usersByDay: users.chartData,
                projectsByStatus: projects.byStatus,
            },
            quickStats: {
                avgProjectValue: 12500,
                avgProjectDuration: '6 weeks',
                clientSatisfaction: 4.8,
                repeatClientRate: 35,
            },
            systemHealth: performance.health,
        };

        await this.cacheService.set(cacheKey, overview, ADMIN_CONFIG.DASHBOARD_CACHE_TTL);

        return overview;
    }
}
