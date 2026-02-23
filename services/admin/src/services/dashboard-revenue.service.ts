import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { RevenueQueryDto } from '../dto/revenue-query.dto';
import { RevenueData } from '../interfaces/dashboard.interface';

@Injectable()
export class DashboardRevenueService {
    constructor(private readonly httpService: HttpService) { }

    async getRevenue(query: RevenueQueryDto): Promise<RevenueData> {
        // In actual implementation, makes HTTP call to Payments service
        return {
            total: 1250000,
            currency: 'INR',
            trends: { current: 1250000, previous: 1100000, change: 13.64, trend: 'up' },
            byCategory: [
                { category: 'Web Development', amount: 800000 },
                { category: 'Mobile App', amount: 450000 },
            ],
            chartData: [
                { date: '2024-01-01', amount: 1100000 },
                { date: '2024-02-01', amount: 1250000 },
            ],
        };
    }

    async getRevenueOverview(period: string): Promise<any> {
        return {
            total: 125000,
            trend: { current: 125000, previous: 110000, change: 13.64, trend: 'up' },
            chartData: [
                { month: '2024-01', revenue: 110000 },
                { month: '2024-02', revenue: 125000 },
            ],
        };
    }
}
