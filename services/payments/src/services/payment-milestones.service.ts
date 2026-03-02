import { Injectable } from '@nestjs/common';
import { PrismaReadService } from '@nestlancer/database';

@Injectable()
export class PaymentMilestonesService {
    constructor(private readonly prismaRead: PrismaReadService) { }

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
