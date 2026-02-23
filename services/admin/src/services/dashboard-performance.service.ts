import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { PerformanceMetrics } from '../interfaces/dashboard.interface';

@Injectable()
export class DashboardPerformanceService {
    constructor(private readonly httpService: HttpService) { }

    async getPerformance(): Promise<PerformanceMetrics> {
        // In actual implementation, queries Prometheus/Metrics service
        return {
            responseTime: { p50: 45, p95: 120, p99: 250 },
            errorRate: 0.15,
            uptime: 99.99,
            memoryUsage: 45.2,
            cpuUsage: 12.5,
        };
    }

    async getSystemPerformance(): Promise<any> {
        return {
            health: 'healthy',
            p50: 45,
            p99: 250,
            errorRate: 0.15,
        };
    }
}
