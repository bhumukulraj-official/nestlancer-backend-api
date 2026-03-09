import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaWriteService, PrismaReadService } from '@nestlancer/database';
import { RazorpayService } from './razorpay.service';
import { PaymentStatus } from '../interfaces/payments.interface';

interface DisputeQueryParams {
    status?: string;
    page?: number;
    limit?: number;
}

interface DisputeResolution {
    action: 'accept' | 'contest';
    notes?: string;
    evidence?: string[];
}

interface ReconciliationQuery {
    startDate?: Date;
    endDate?: Date;
}

interface PaymentMismatch {
    paymentId: string;
    localStatus: string;
    providerStatus: string;
    localAmount: number;
    providerAmount: number;
    discrepancy: string;
}

@Injectable()
export class PaymentDisputesService {
    constructor(
        private readonly prismaWrite: PrismaWriteService,
        private readonly prismaRead: PrismaReadService,
        private readonly razorpayService: RazorpayService,
    ) { }

    async getDisputes(query: DisputeQueryParams) {
        const { status, page = 1, limit = 20 } = query;
        const skip = (page - 1) * limit;

        // Get payments that have disputes (refundStatus contains dispute info)
        const where: Record<string, unknown> = {};
        if (status) {
            where.refundStatus = status;
        } else {
            where.refundStatus = { in: ['DISPUTED', 'DISPUTE_PENDING', 'DISPUTE_WON', 'DISPUTE_LOST'] };
        }

        const [payments, total] = await Promise.all([
            this.prismaRead.payment.findMany({
                where,
                skip,
                take: limit,
                orderBy: { updatedAt: 'desc' },
                include: {
                    client: { select: { id: true, firstName: true, lastName: true, email: true } },
                    project: { select: { id: true, title: true } },
                }
            }),
            this.prismaRead.payment.count({ where })
        ]);

        return {
            items: payments.map(p => ({
                id: p.id,
                amount: p.amount,
                currency: p.currency,
                status: p.refundStatus,
                client: (p as any).client,
                project: (p as any).project,
                externalId: p.externalId,
                createdAt: p.createdAt,
                updatedAt: p.updatedAt,
            })),
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            }
        };
    }

    async resolveDispute(paymentId: string, resolution: DisputeResolution) {
        const payment = await this.prismaRead.payment.findUnique({
            where: { id: paymentId }
        });

        if (!payment) {
            throw new NotFoundException('Payment not found');
        }

        // Update local record with resolution
        const newStatus = resolution.action === 'accept' ? 'DISPUTE_LOST' : 'DISPUTE_CONTESTED';

        await this.prismaWrite.payment.update({
            where: { id: paymentId },
            data: {
                refundStatus: newStatus,
                providerDetails: {
                    ...(payment.providerDetails as object || {}),
                    disputeResolution: {
                        action: resolution.action,
                        notes: resolution.notes,
                        evidence: resolution.evidence,
                        resolvedAt: new Date().toISOString(),
                    }
                }
            }
        });

        // Create outbox event for dispute resolution
        await this.prismaWrite.outboxEvent.create({
            data: {
                type: 'PAYMENT_DISPUTE_RESOLVED',
                aggregateType: 'Payment',
                aggregateId: paymentId,
                payload: {
                    paymentId,
                    action: resolution.action,
                    notes: resolution.notes,
                }
            }
        });

        return {
            success: true,
            paymentId,
            newStatus,
        };
    }

    /**
     * Updates an existing dispute record with new information.
     *
     * @param disputeId - The ID of the payment with the dispute
     * @param body - Fields to update on the dispute record
     * @returns The updated dispute data
     */
    async updateDispute(disputeId: string, body: any): Promise<any> {
        const payment = await this.prismaRead.payment.findUnique({
            where: { id: disputeId },
        });

        if (!payment) {
            throw new NotFoundException('Payment not found');
        }

        const existingDetails = (payment.providerDetails as any) || {};

        const updated = await this.prismaWrite.payment.update({
            where: { id: disputeId },
            data: {
                refundStatus: body.status || payment.refundStatus,
                providerDetails: {
                    ...existingDetails,
                    disputeUpdate: {
                        notes: body.notes,
                        priority: body.priority,
                        updatedAt: new Date().toISOString(),
                    },
                },
            },
        });

        return {
            id: updated.id,
            status: updated.refundStatus,
            updatedAt: updated.updatedAt,
        };
    }
}

@Injectable()
export class PaymentReconciliationService {
    constructor(
        private readonly prismaWrite: PrismaWriteService,
        private readonly prismaRead: PrismaReadService,
        private readonly razorpayService: RazorpayService,
    ) { }

    /**
     * Returns a read-only reconciliation report: payments with external IDs and status for audit.
     * Optional date range; defaults to last 30 days.
     */
    async getReconciliationReport(query?: { startDate?: Date; endDate?: Date; page?: number; limit?: number }) {
        const page = Math.max(1, query?.page ?? 1);
        const limit = Math.min(100, Math.max(1, query?.limit ?? 50));
        const skip = (page - 1) * limit;
        const where: Record<string, unknown> = { externalId: { not: null } };
        if (query?.startDate || query?.endDate) {
            where.createdAt = {};
            if (query.startDate) (where.createdAt as Record<string, Date>).gte = query.startDate;
            if (query.endDate) (where.createdAt as Record<string, Date>).lte = query.endDate;
        } else {
            const end = new Date();
            const start = new Date();
            start.setDate(start.getDate() - 30);
            where.createdAt = { gte: start, lte: end };
        }

        const [items, total] = await Promise.all([
            this.prismaRead.payment.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    externalId: true,
                    amount: true,
                    currency: true,
                    status: true,
                    externalStatus: true,
                    createdAt: true,
                    paidAt: true,
                },
            }),
            this.prismaRead.payment.count({ where }),
        ]);

        return {
            items,
            pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
        };
    }

    async reconcilePayments(query: ReconciliationQuery) {
        const { startDate, endDate } = query;

        const where: Record<string, unknown> = {
            status: { in: [PaymentStatus.COMPLETED, PaymentStatus.PROCESSING] },
            externalId: { not: null },
        };

        if (startDate || endDate) {
            where.createdAt = {};
            if (startDate) (where.createdAt as Record<string, Date>).gte = startDate;
            if (endDate) (where.createdAt as Record<string, Date>).lte = endDate;
        }

        const payments = await this.prismaRead.payment.findMany({
            where,
            select: {
                id: true,
                externalId: true,
                amount: true,
                status: true,
                externalStatus: true,
            }
        });

        const mismatches: PaymentMismatch[] = [];
        let reconciled = 0;

        for (const payment of payments) {
            if (!payment.externalId) continue;

            try {
                const providerPayment = await this.razorpayService.fetchPayment(payment.externalId);
                const providerAmount = providerPayment.amount / 100; // Convert from paise
                const providerStatus = this.mapRazorpayStatus(providerPayment.status);

                // Check for mismatches
                const hasAmountMismatch = payment.amount !== providerAmount;
                const hasStatusMismatch = payment.status !== providerStatus && payment.externalStatus !== providerPayment.status;

                if (hasAmountMismatch || hasStatusMismatch) {
                    const discrepancies: string[] = [];
                    if (hasAmountMismatch) discrepancies.push('amount');
                    if (hasStatusMismatch) discrepancies.push('status');

                    mismatches.push({
                        paymentId: payment.id,
                        localStatus: payment.status,
                        providerStatus: providerPayment.status,
                        localAmount: payment.amount,
                        providerAmount,
                        discrepancy: discrepancies.join(', '),
                    });
                } else {
                    // Update external status if needed
                    if (payment.externalStatus !== providerPayment.status) {
                        await this.prismaWrite.payment.update({
                            where: { id: payment.id },
                            data: { externalStatus: providerPayment.status }
                        });
                    }
                    reconciled++;
                }
            } catch (error: any) {
                // Log error but continue with other payments
                mismatches.push({
                    paymentId: payment.id,
                    localStatus: payment.status,
                    providerStatus: 'FETCH_ERROR',
                    localAmount: payment.amount,
                    providerAmount: 0,
                    discrepancy: 'provider_fetch_failed',
                });
            }
        }

        return {
            totalChecked: payments.length,
            reconciled,
            mismatches,
        };
    }

    private mapRazorpayStatus(razorpayStatus: string): PaymentStatus {
        const statusMap: Record<string, PaymentStatus> = {
            'created': PaymentStatus.CREATED,
            'authorized': PaymentStatus.PROCESSING,
            'captured': PaymentStatus.COMPLETED,
            'refunded': PaymentStatus.REFUNDED,
            'failed': PaymentStatus.FAILED,
        };
        return statusMap[razorpayStatus] || PaymentStatus.PENDING;
    }
}

@Injectable()
export class PaymentStatsService {
    constructor(private readonly prismaRead: PrismaReadService) { }

    async getStats() {
        const [
            totalPayments,
            completedPayments,
            pendingPayments,
            refundedPayments,
            recentPayments
        ] = await Promise.all([
            this.prismaRead.payment.aggregate({
                _sum: { amount: true },
                _count: { id: true },
            }),
            this.prismaRead.payment.aggregate({
                _sum: { amount: true },
                _count: { id: true },
                where: { status: PaymentStatus.COMPLETED },
            }),
            this.prismaRead.payment.aggregate({
                _sum: { amount: true },
                _count: { id: true },
                where: { status: { in: [PaymentStatus.PENDING, PaymentStatus.PROCESSING] } },
            }),
            this.prismaRead.payment.aggregate({
                _sum: { amountRefunded: true },
                _count: { id: true },
                where: { status: PaymentStatus.REFUNDED },
            }),
            this.prismaRead.payment.findMany({
                where: { status: PaymentStatus.COMPLETED },
                orderBy: { paidAt: 'desc' },
                take: 10,
                select: {
                    id: true,
                    amount: true,
                    currency: true,
                    paidAt: true,
                    client: { select: { firstName: true, lastName: true } },
                    project: { select: { title: true } },
                }
            })
        ]);

        return {
            totalRevenue: completedPayments._sum.amount || 0,
            totalTransactions: totalPayments._count.id || 0,
            completedTransactions: completedPayments._count.id || 0,
            pendingAmount: pendingPayments._sum.amount || 0,
            pendingTransactions: pendingPayments._count.id || 0,
            totalRefunded: refundedPayments._sum.amountRefunded || 0,
            refundedTransactions: refundedPayments._count.id || 0,
            recentTransactions: recentPayments.map(p => ({
                id: p.id,
                amount: p.amount,
                currency: p.currency,
                paidAt: p.paidAt,
                clientName: `${(p as any).client.firstName} ${(p as any).client.lastName}`,
                projectTitle: (p as any).project.title,
            })),
        };
    }
}
