import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaWriteService, PrismaReadService } from '@nestlancer/database';
import { QueryAuditDto } from '../dto/query-audit.dto';
import { AuditLogResponseDto } from '../dto/audit-response.dto';

@Injectable()
export class AuditService {
    constructor(
        private readonly prismaWrite: PrismaWriteService,
        private readonly prismaRead: PrismaReadService,
    ) { }

    async findAll(query: QueryAuditDto) {
        const page = query.page || 1;
        const limit = query.limit || 50;
        const skip = (page - 1) * limit;

        const where: any = {};
        if (query.userId) where.userId = query.userId;
        if (query.action) where.action = query.action;
        if (query.resourceType) where.resourceType = query.resourceType;
        if (query.from || query.to) {
            where.createdAt = {};
            if (query.from) where.createdAt.gte = new Date(query.from);
            if (query.to) where.createdAt.lte = new Date(query.to);
        }

        const [data, total] = await Promise.all([
            this.prismaRead.auditLog.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
            }),
            this.prismaRead.auditLog.count({ where }),
        ]);

        const totalPages = Math.ceil(total / limit);

        return {
            data,
            pagination: {
                page,
                limit,
                total,
                totalPages,
                hasNext: page < totalPages,
                hasPrev: page > 1,
            },
        };
    }

    async findOne(id: string) {
        const log = await this.prismaRead.auditLog.findUnique({ where: { id } });
        if (!log) throw new NotFoundException('Audit log not found');
        return log;
    }

    async getResourceTrail(type: string, id: string) {
        return this.prismaRead.auditLog.findMany({
            where: { resourceType: type, resourceId: id },
            orderBy: { createdAt: 'desc' },
        });
    }

    async getUserTrail(userId: string) {
        return this.prismaRead.auditLog.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });
    }

    async getStats() {
        // Generate some basic statistics (e.g. actions by type)
        return {
            totalLogs: await this.prismaRead.auditLog.count(),
            byAction: { 'LOGIN': 150, 'UPDATE': 400 }, // Mock aggregation
        };
    }
}
