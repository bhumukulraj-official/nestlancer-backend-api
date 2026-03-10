import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { PrismaReadService } from '@nestlancer/database';
import { RevenueQueryDto } from '../dto/revenue-query.dto';
import { RevenueData } from '../interfaces/dashboard.interface';

@Injectable()
export class DashboardRevenueService {
  constructor(
    private readonly httpService: HttpService,
    private readonly prismaRead: PrismaReadService,
  ) {}

  async getRevenue(query: RevenueQueryDto): Promise<RevenueData> {
    const sumResult = await this.prismaRead.payment.aggregate({
      where: { status: 'COMPLETED' },
      _sum: { amount: true },
    });
    const total = sumResult._sum.amount || 0;

    return {
      total,
      currency: 'INR',
      trends: { current: total, previous: total, change: 0, trend: 'up' },
      byCategory: [],
      chartData: [],
    };
  }

  async getRevenueOverview(period: string): Promise<any> {
    const sumResult = await this.prismaRead.payment.aggregate({
      where: { status: 'COMPLETED' },
      _sum: { amount: true },
    });
    const total = sumResult._sum.amount || 0;

    return {
      total,
      trend: { current: total, previous: total, change: 0, trend: 'up' },
      chartData: [],
    };
  }
}
