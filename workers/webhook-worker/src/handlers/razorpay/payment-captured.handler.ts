import { Injectable } from '@nestjs/common';
import { WebhookHandler } from '../../interfaces/webhook-handler.interface';
import { ResourceNotFoundException } from '@nestlancer/common';
import { PrismaWriteService } from '@nestlancer/database';
import { LoggerService } from '@nestlancer/logger';
import { QueueService } from '@nestlancer/queue';

@Injectable()
export class PaymentCapturedHandler implements WebhookHandler {
    constructor(
        private readonly prisma: PrismaWriteService,
        private readonly logger: LoggerService,
        private readonly queue: QueueService,
    ) { }

    canHandle(provider: string, eventType: string): boolean {
        return provider === 'razorpay' && eventType === 'payment.captured';
    }

    async handle(payload: any): Promise<void> {
        const razorpayPaymentId = payload.payment.entity.id;
        this.logger.log(`Handling payment.captured for Razorpay ID: ${razorpayPaymentId}`);

        const payment = await this.prisma.payment.findFirst({
            where: { externalId: razorpayPaymentId },
        });

        if (!payment) {
            throw new ResourceNotFoundException('Payment', razorpayPaymentId);
        }

        if (payment.status === 'CAPTURED') {
            this.logger.warn(`Payment ${payment.id} already captured, skipping.`);
            return;
        }

        await this.prisma.$transaction([
            this.prisma.payment.update({
                where: { id: payment.id },
                data: { status: 'CAPTURED', capturedAt: new Date() },
            }),
            this.prisma.invoice.update({
                where: { id: payment.invoiceId },
                data: { status: 'PAID' },
            }),
        ]);

        await this.queue.publish('notification', {
            type: 'payment.completed',
            userId: payment.userId,
            payload: { paymentId: payment.id, amount: payment.amount },
        });
    }
}
