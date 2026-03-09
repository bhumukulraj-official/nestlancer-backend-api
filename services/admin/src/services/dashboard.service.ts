import { Injectable } from '@nestjs/common';
import { CacheService } from '@nestlancer/cache';
import { PrismaReadService } from '@nestlancer/database';
import { ADMIN_CONFIG } from '../config/admin.config';
import { DashboardOverview, ActivityItem } from '../interfaces/dashboard.interface';
import { DashboardQueryDto } from '../dto/dashboard-query.dto';
import { DashboardRevenueService } from './dashboard-revenue.service';
import { DashboardUsersService } from './dashboard-users.service';
import { DashboardProjectsService } from './dashboard-projects.service';
import { DashboardPerformanceService } from './dashboard-performance.service';
import { AuditService } from './audit.service';
import { HttpService } from '@nestjs/axios';

@Injectable()
export class DashboardService {
    constructor(
        private readonly cacheService: CacheService,
        private readonly revenueService: DashboardRevenueService,
        private readonly usersService: DashboardUsersService,
        private readonly projectsService: DashboardProjectsService,
        private readonly performanceService: DashboardPerformanceService,
        private readonly auditService: AuditService,
        private readonly prismaRead: PrismaReadService,
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

        const [revenue, users, projects, performance, recentActivityRaw, alerts, pendingRequests, openQuotes] = await Promise.all([
            this.revenueService.getRevenueOverview(period),
            this.usersService.getUserOverview(period),
            this.projectsService.getProjectOverview(period),
            this.performanceService.getSystemPerformance(),
            this.auditService.getRecentActivity(10),
            this.performanceService.getAlerts(),
            this.prismaRead.projectRequest.count({ where: { status: 'SUBMITTED' } }).catch(() => 0),
            this.prismaRead.quote.count({ where: { status: { in: ['PENDING', 'SENT', 'VIEWED'] } } }).catch(() => 0),
        ]);

        const periodDays = period === 'WEEK' ? 7 : period === 'TODAY' ? 1 : 30;
        const periodStart = new Date();
        periodStart.setDate(periodStart.getDate() - periodDays);

        const recentActivity: ActivityItem[] = recentActivityRaw.map((a: any) => ({
            id: a.id,
            type: a.type,
            title: a.title,
            description: a.description,
            user: a.user ? { id: a.user.id, name: a.user.name } : undefined,
            timestamp: a.timestamp,
        }));

        const overview: DashboardOverview = {
            period: {
                start: periodStart.toISOString(),
                end: new Date().toISOString(),
                days: periodDays,
            },
            summary: {
                totalUsers: users.total,
                newUsers: users.newThisMonth,
                activeProjects: projects.active,
                completedProjects: projects.completed,
                pendingRequests,
                openQuotes,
                revenueThisMonth: revenue.total,
                currency: 'INR',
            },
            trends: {
                users: users.trend,
                revenue: revenue.trend,
                projects: projects.trend,
                requests: projects.trend,
            },
            recentActivity,
            alerts,
            charts: {
                revenueByMonth: revenue.chartData,
                usersByDay: users.chartData,
                projectsByStatus: projects.byStatus,
            },
            quickStats: {
                avgProjectValue: revenue.chartData?.length ? Math.round(revenue.total / (projects.completed || 1) / 100) * 100 : 12500,
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
