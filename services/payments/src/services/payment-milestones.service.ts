import { Injectable } from '@nestjs/common';
import { PrismaReadService } from '@nestlancer/database';

@Injectable()
export class PaymentMilestonesService {
    constructor(private readonly prismaRead: PrismaReadService) { }

    /** List all milestones that have at least one payment (admin). */
    async listMilestones(projectId?: string) {
        const where: any = { milestoneId: { not: null } };
        if (projectId) where.projectId = projectId;
        const payments = await this.prismaRead.payment.findMany({
            where,
            select: { milestoneId: true, projectId: true, amount: true, status: true },
        });
        const byId = new Map<string, { milestoneId: string; projectId: string; totalAmount: number; paymentsCount: number }>();
        for (const p of payments) {
            const mid = (p as any).milestoneId!;
            if (!byId.has(mid)) {
                byId.set(mid, { milestoneId: mid, projectId: (p as any).projectId, totalAmount: 0, paymentsCount: 0 });
            }
            const e = byId.get(mid)!;
            e.totalAmount += (p as any).amount;
            e.paymentsCount += 1;
        }
        return Array.from(byId.values());
    }

    async getMilestoneById(milestoneId: string) {
        const payments = await this.prismaRead.payment.findMany({
            where: { milestoneId },
            orderBy: { createdAt: 'desc' },
        });
        if (!payments.length) return null;
        const totalAmount = payments.reduce((s, p) => s + (p as any).amount, 0);
        return { milestoneId, payments, totalAmount };
    }

    async getPaymentsByMilestone(milestoneId: string) {
        return this.prismaRead.payment.findMany({
            where: { milestoneId },
            orderBy: { createdAt: 'desc' }
        });
    }

    async getMilestonePaymentStatus(milestoneId: string) {
        const payments = await this.prismaRead.payment.findMany({
            where: { milestoneId },
            select: { amount: true, status: true, amountRefunded: true }
        });

        const totalPaid = payments
            .filter(p => p.status === 'COMPLETED' || p.status === 'REFUNDED')
            .reduce((sum, p) => sum + p.amount - p.amountRefunded, 0);

        return { milestoneId, totalPaid, paymentsCount: payments.length };
    }
}
