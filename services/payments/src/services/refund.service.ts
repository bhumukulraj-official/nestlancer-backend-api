import { Injectable, BadRequestException, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { PrismaWriteService } from '@nestlancer/database/prisma/prisma-write.service';
import { PrismaReadService } from '@nestlancer/database/prisma/prisma-read.service';
import { RazorpayService } from './razorpay.service';
import { ProcessRefundDto } from '../dto/process-refund.dto';
import { PaymentStatus } from '../interfaces/payments.interface';

@Injectable()
export class RefundService {
    constructor(
        private readonly prismaWrite: PrismaWriteService,
        private readonly prismaRead: PrismaReadService,
        private readonly razorpayService: RazorpayService,
    ) { }

    async processRefund(paymentId: string, adminId: string, dto: ProcessRefundDto) {
        const payment = await this.prismaRead.payment.findUnique({
            where: { id: paymentId },
        });

        if (!payment) throw new NotFoundException('Payment not found');
        if (payment.status !== PaymentStatus.COMPLETED) {
            throw new BadRequestException('Only completed payments can be refunded');
        }

        if (!payment.externalId) {
            throw new BadRequestException('Payment external ID missing, cannot process refund');
        }

        const amountToRefund = dto.amount || payment.amount;

        if (payment.amountRefunded + amountToRefund > payment.amount) {
            throw new BadRequestException('Refund amount exceeds total payment amount');
        }

        try {
            // Intitiate refund via Razorpay
            const razorpayRefund = await this.razorpayService.initiateRefund(payment.externalId, amountToRefund, {
                reason: dto.reason,
            });

            // Update Database
            const updated = await this.prismaWrite.$transaction(async (tx) => {
                await tx.refund.create({
                    data: {
                        paymentId: payment.id,
                        amount: amountToRefund,
                        currency: payment.currency,
                        type: dto.amount ? 'PARTIAL' : 'FULL',
                        reason: dto.reason,
                        status: 'PROCESSED',
                        providerDetails: razorpayRefund,
                    },
                });

                const newAmountRefunded = payment.amountRefunded + amountToRefund;
                const newStatus = newAmountRefunded >= payment.amount ? PaymentStatus.REFUNDED : PaymentStatus.COMPLETED;

                return tx.payment.update({
                    where: { id: payment.id },
                    data: {
                        amountRefunded: newAmountRefunded,
                        status: newStatus,
                        refundStatus: dto.amount ? 'PARTIAL' : 'FULL',
                    },
                });
            });

            return updated;
        } catch (error: any) {
            throw new InternalServerErrorException(`Refund failed: ${error.message}`);
        }
    }
}
