import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaWriteService, PrismaReadService } from '@nestlancer/database';
import { QueryPaymentsDto } from '../dto/query-payments.dto';

@Injectable()
export class PaymentsService {
    constructor(
        private readonly prismaWrite: PrismaWriteService,
        private readonly prismaRead: PrismaReadService,
    ) { }

    async getMyPayments(userId: string, query: QueryPaymentsDto) {
        const { page = 1, limit = 20, status, projectId } = query;
        const skip = (page - 1) * limit;

        const where: any = { clientId: userId };
        if (status) where.status = status;
        if (projectId) where.projectId = projectId;

        const [items, total] = await Promise.all([
            this.prismaRead.payment.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
            }),
            this.prismaRead.payment.count({ where }),
        ]);

        return {
            items,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async getPaymentById(userId: string, id: string) {
        const payment = await this.prismaRead.payment.findFirst({
            where: { id, clientId: userId },
            include: { refunds: true },
        });
        if (!payment) throw new NotFoundException('Payment not found');
        return payment;
    }

    /** Get payment milestones for a project (user-facing). Returns payments for project with milestone info. */
    async getProjectMilestones(userId: string, projectId: string) {
        const payments = await this.prismaRead.payment.findMany({
            where: { projectId, clientId: userId },
            orderBy: { createdAt: 'desc' },
        });
        const byMilestone = new Map<string, { milestoneId: string; payments: any[]; totalAmount: number; status: string }>();
        for (const p of payments) {
            const mid = (p as any).milestoneId || 'unknown';
            if (!byMilestone.has(mid)) {
                byMilestone.set(mid, { milestoneId: mid, payments: [], totalAmount: 0, status: (p as any).status });
            }
            const entry = byMilestone.get(mid)!;
            entry.payments.push(p);
            entry.totalAmount += (p as any).amount;
        }
        return { projectId, milestones: Array.from(byMilestone.values()) };
    }

    async getAdminPayments(query: QueryPaymentsDto) {
        const { page = 1, limit = 20, status, projectId } = query;
        const skip = (page - 1) * limit;

        const where: any = {};
        if (status) where.status = status;
        if (projectId) where.projectId = projectId;

        const [items, total] = await Promise.all([
            this.prismaRead.payment.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: { client: { select: { id: true } } },
            }),
            this.prismaRead.payment.count({ where }),
        ]);

        return {
            items,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async getUserPaymentStats(userId: string) {
        // TODO: Implement user payment stats
        return { totalSpent: 0, pending: 0 };
    }

    async fileDispute(userId: string, id: string, body: any) {
        // TODO: Implement file dispute logic
        return { id, status: 'disputed', reason: body.reason };
    }

    async cancelPayment(userId: string, id: string) {
        // TODO: Implement cancel payment logic
        return { id, status: 'cancelled' };
    }
}
