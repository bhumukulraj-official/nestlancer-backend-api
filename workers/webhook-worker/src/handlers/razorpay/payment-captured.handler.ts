import { Injectable } from '@nestjs/common';
import { WebhookHandler } from '../../interfaces/webhook-handler.interface';
import { ResourceNotFoundException } from '@nestlancer/common';
import { PrismaWriteService } from '@nestlancer/database';
import { LoggerService } from '@nestlancer/logger';
import { QueuePublisherService } from '@nestlancer/queue';

@Injectable()
export class PaymentCapturedHandler implements WebhookHandler {
    constructor(
        private readonly prisma: PrismaWriteService,
        private readonly logger: LoggerService,
        private readonly queue: QueuePublisherService,
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
            this.logger.error(`Payment not found for external ID: ${razorpayPaymentId}`);
            return;
        }

        if (payment.status === 'COMPLETED') {
            this.logger.warn(`Payment ${payment.id} already captured, skipping.`);
            return;
        }

        await this.prisma.$transaction([
            this.prisma.payment.update({
                where: { id: payment.id },
                data: { status: 'COMPLETED', paidAt: new Date() },
            }),
            // Invoice update removed as invoiceId doesn't exist on payment model
        ]);

        await this.queue.publish('events', 'notification.payment.completed', {
            type: 'payment.completed',
            userId: payment.clientId,
            payload: { paymentId: payment.id, amount: payment.amount },
        });
    }
}
