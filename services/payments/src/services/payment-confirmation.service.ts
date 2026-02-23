import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaWriteService } from '@nestlancer/database/prisma/prisma-write.service';
import { PrismaReadService } from '@nestlancer/database/prisma/prisma-read.service';
import { RazorpayService } from './razorpay.service';
import { ConfirmPaymentDto } from '../dto/confirm-payment.dto';
import { PaymentStatus } from '../interfaces/payments.interface';
import { OutboxService } from '@nestlancer/outbox';

@Injectable()
export class PaymentConfirmationService {
    constructor(
        private readonly prismaWrite: PrismaWriteService,
        private readonly prismaRead: PrismaReadService,
        private readonly razorpayService: RazorpayService,
        private readonly outbox: OutboxService,
    ) { }

    async confirm(userId: string, dto: ConfirmPaymentDto) {
        // Verify signature
        const isValid = this.razorpayService.verifyPaymentSignature(
            dto.paymentIntentId, // Order ID
            dto.externalPaymentId, // Payment ID
            dto.signature,
        );

        if (!isValid) {
            throw new BadRequestException('Invalid payment signature');
        }

        const payment = await this.prismaRead.payment.findUnique({
            where: { intentId: dto.paymentIntentId },
        });

        if (!payment) {
            throw new BadRequestException('Payment intent not found');
        }

        if (payment.status === PaymentStatus.COMPLETED) {
            return payment; // Already processed
        }

        const updated = await this.prismaWrite.$transaction(async (tx) => {
            const p = await tx.payment.update({
                where: { id: payment.id },
                data: {
                    status: PaymentStatus.COMPLETED,
                    externalId: dto.externalPaymentId,
                    paidAt: new Date(),
                },
            });

            // Optionally update Milestone if milestoneId is present
            if (p.milestoneId) {
                // Find existing progress or just emit outbox event to be handled by Progress Service
            }

            await tx.outbox.create({
                data: {
                    eventType: 'PAYMENT_COMPLETED',
                    payload: {
                        paymentId: p.id,
                        projectId: p.projectId,
                        milestoneId: p.milestoneId,
                        amount: p.amount,
                        currency: p.currency,
                    }
                },
            });

            return p;
        });

        return updated;
    }
}
