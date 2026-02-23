import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { UserMetrics } from '../interfaces/dashboard.interface';

@Injectable()
export class DashboardUsersService {
    constructor(private readonly httpService: HttpService) { }

    async getUserMetrics(): Promise<UserMetrics> {
        // In actual implementation, makes HTTP call to Users service
        return {
            total: 1250,
            active: 450,
            newThisMonth: 85,
            byRole: { user: 1240, admin: 10 },
            chartData: [
                { date: '2024-02-12', count: 12 },
                { date: '2024-02-13', count: 15 },
            ],
        };
    }

    async getUserOverview(period: string): Promise<any> {
        return {
            total: 1250,
            newThisMonth: 85,
            trend: { current: 1250, previous: 1180, change: 5.93, trend: 'up' },
            chartData: [
                { date: '2024-02-12', new: 12, active: 450 },
                { date: '2024-02-13', new: 15, active: 478 },
            ],
        };
    }
}
