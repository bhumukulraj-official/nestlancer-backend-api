import { Injectable } from '@nestjs/common';
import { WebhookHandler } from '../../interfaces/webhook-handler.interface';
import { PrismaWriteService } from '@nestlancer/database';
import { LoggerService } from '@nestlancer/logger';

@Injectable()
export class RefundProcessedHandler implements WebhookHandler {
    constructor(
        private readonly prisma: PrismaWriteService,
        private readonly logger: LoggerService,
    ) { }

    canHandle(provider: string, eventType: string): boolean {
        return provider === 'razorpay' && eventType === 'refund.processed';
    }

    async handle(payload: any): Promise<void> {
        const razorpayRefundId = payload.refund.entity.id;
        const razorpayPaymentId = payload.refund.entity.payment_id;

        const refund = await this.prisma.refund.findFirst({
            where: { externalId: razorpayRefundId },
        });

        if (!refund) return;

        await this.prisma.$transaction(async (tx: any) => {
            await tx.refund.update({
                where: { id: refund.id },
                data: { status: 'PROCESSED', processedAt: new Date() },
            });

            const payment = await tx.payment.findUnique({ where: { id: refund.paymentId } });
            if (payment) {
                await tx.payment.update({
                    where: { id: payment.id },
                    data: { refundedAmount: (payment.refundedAmount || 0) + refund.amount },
                });
            }
        });

        this.logger.log(`Processed refund for payment: ${razorpayPaymentId}`);
    }
}
