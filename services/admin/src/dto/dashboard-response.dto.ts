import { DashboardOverview } from '../interfaces/dashboard.interface';

export class DashboardResponseDto implements DashboardOverview {
    period: { start: string; end: string; days: number };
    summary: {
        totalUsers: number;
        newUsers: number;
        activeProjects: number;
        completedProjects: number;
        pendingRequests: number;
        openQuotes: number;
        revenueThisMonth: number;
        currency: string;
    };
    trends: any; // Simplified for brevity in class definition, match interface
    recentActivity: any[];
    alerts: any[];
    charts: any;
    quickStats: any;
    systemHealth?: 'healthy' | 'degraded' | 'unhealthy';
}
