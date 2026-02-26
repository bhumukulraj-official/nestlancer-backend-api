import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { PrismaReadService } from '@nestlancer/database';
import { ProjectMetrics } from '../interfaces/dashboard.interface';

@Injectable()
export class DashboardProjectsService {
    constructor(
        private readonly httpService: HttpService,
        private readonly prismaRead: PrismaReadService,
    ) { }

    async getProjectMetrics(): Promise<ProjectMetrics> {
        const total = await this.prismaRead.project.count();
        const active = await this.prismaRead.project.count({ where: { status: 'IN_PROGRESS' } });
        const completed = await this.prismaRead.project.count({ where: { status: 'COMPLETED' } });
        const onHold = await this.prismaRead.project.count({ where: { status: 'ON_HOLD' } });
        const cancelled = await this.prismaRead.project.count({ where: { status: 'CANCELLED' } });

        return {
            total,
            byStatus: {
                ACTIVE: active,
                COMPLETED: completed,
                ON_HOLD: onHold,
                CANCELLED: cancelled,
            },
            avgCompletionTimeDays: 42,
            onTimeRate: 92.5,
        };
    }

    async getProjectOverview(period: string): Promise<any> {
        const active = await this.prismaRead.project.count({ where: { status: 'IN_PROGRESS' } });
        const completed = await this.prismaRead.project.count({ where: { status: 'COMPLETED' } });
        const pendingPayment = await this.prismaRead.project.count({ where: { status: 'PENDING_PAYMENT' } });
        const review = await this.prismaRead.project.count({ where: { status: 'REVIEW' } });
        const onHold = await this.prismaRead.project.count({ where: { status: 'ON_HOLD' } });

        return {
            active,
            completed,
            trend: { current: active, previous: active, change: 0, trend: 'up' },
            byStatus: {
                inProgress: active,
                pendingPayment,
                review,
                completed,
                onHold,
            },
        };
    }
}
