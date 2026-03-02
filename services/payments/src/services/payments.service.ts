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
}
