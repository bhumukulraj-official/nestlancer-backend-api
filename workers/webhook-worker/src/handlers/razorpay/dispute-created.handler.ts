import { Injectable } from '@nestjs/common';
import { WebhookHandler } from '../../interfaces/webhook-handler.interface';
import { PrismaWriteService } from '@nestlancer/database';
import { LoggerService } from '@nestlancer/logger';

@Injectable()
export class DisputeCreatedHandler implements WebhookHandler {
    constructor(
        private readonly prisma: PrismaWriteService,
        private readonly logger: LoggerService,
    ) { }

    canHandle(provider: string, eventType: string): boolean {
        return provider === 'razorpay' && eventType === 'dispute.created';
    }

    async handle(payload: any): Promise<void> {
        const razorpayDisputeId = payload.dispute.entity.id;
        const razorpayPaymentId = payload.dispute.entity.payment_id;

        const payment = await this.prisma.payment.findFirst({
            where: { externalId: razorpayPaymentId },
        });

        if (!payment) return;

        await this.prisma.$transaction([
            this.prisma.payment.update({
                where: { id: payment.id },
                data: { status: 'DISPUTED' },
            }),
            this.prisma.dispute.create({
                data: {
                    externalId: razorpayDisputeId,
                    paymentId: payment.id,
                    reason: payload.dispute.entity.reason,
                    amount: payload.dispute.entity.amount / 100,
                    status: 'OPEN',
                    evidenceDueBy: new Date(payload.dispute.entity.respond_by * 1000),
                },
            }),
        ]);

        this.logger.warn(`Dispute created for payment: ${razorpayPaymentId}`);
    }
}
