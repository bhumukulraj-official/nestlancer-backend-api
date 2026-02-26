import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { PrismaReadService } from '@nestlancer/database';
import { UserMetrics } from '../interfaces/dashboard.interface';

@Injectable()
export class DashboardUsersService {
    constructor(
        private readonly httpService: HttpService,
        private readonly prismaRead: PrismaReadService,
    ) { }

    async getUserMetrics(): Promise<UserMetrics> {
        const total = await this.prismaRead.user.count();
        const active = await this.prismaRead.user.count({ where: { status: 'ACTIVE' } });

        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const newThisMonth = await this.prismaRead.user.count({
            where: { createdAt: { gte: startOfMonth } }
        });

        const users = await this.prismaRead.user.count({ where: { role: 'USER' } });
        const admins = await this.prismaRead.user.count({ where: { role: 'ADMIN' } });

        return {
            total,
            active,
            newThisMonth,
            byRole: { user: users, admin: admins },
            chartData: [],
        };
    }

    async getUserOverview(period: string): Promise<any> {
        const total = await this.prismaRead.user.count();

        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const newThisMonth = await this.prismaRead.user.count({
            where: { createdAt: { gte: startOfMonth } }
        });

        return {
            total,
            newThisMonth,
            trend: { current: total, previous: total, change: 0, trend: 'up' },
            chartData: [],
        };
    }
}
