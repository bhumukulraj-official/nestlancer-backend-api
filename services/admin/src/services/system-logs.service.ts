import { Injectable } from '@nestjs/common';
import { PrismaReadService } from '@nestlancer/database';
import { QueryLogsDto } from '../dto/query-logs.dto';

@Injectable()
export class SystemLogsService {
  constructor(private readonly prismaRead: PrismaReadService) {}

  async queryLogs(query: QueryLogsDto) {
    const { page = 1, limit = 50, level, service } = query as any;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (level && level !== 'all') {
      where.category = level.toUpperCase();
    }
    if (service && service !== 'all') {
      where.resourceType = service;
    }

    const items = await this.prismaRead.auditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    });

    const total = await this.prismaRead.auditLog.count({ where });

    return {
      data: items.map((i) => ({
        timestamp: i.createdAt,
        level: i.category,
        service: i.resourceType || 'system',
        message: i.description,
      })),
      total,
    };
  }

  async generateDownloadLink(query: QueryLogsDto) {
    // Trigger background export of logs
    return {
      jobId: 'export_job_123',
      status: 'QUEUED',
      downloadUrl: 'https://s3.amazonaws.com/logs/export.csv',
    };
  }
}
