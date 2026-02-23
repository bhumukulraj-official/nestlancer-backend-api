import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ProjectMetrics } from '../interfaces/dashboard.interface';

@Injectable()
export class DashboardProjectsService {
    constructor(private readonly httpService: HttpService) { }

    async getProjectMetrics(): Promise<ProjectMetrics> {
        // In actual implementation, makes HTTP call to Projects service
        return {
            total: 150,
            byStatus: {
                ACTIVE: 45,
                COMPLETED: 80,
                ON_HOLD: 10,
                CANCELLED: 15,
            },
            avgCompletionTimeDays: 42,
            onTimeRate: 92.5,
        };
    }

    async getProjectOverview(period: string): Promise<any> {
        return {
            active: 45,
            completed: 12,
            trend: { current: 45, previous: 42, change: 7.14, trend: 'up' },
            byStatus: {
                inProgress: 45,
                pendingPayment: 8,
                review: 5,
                completed: 12,
                onHold: 3,
            },
        };
    }
}
