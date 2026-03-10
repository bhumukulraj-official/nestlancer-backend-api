import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaWriteService } from '@nestlancer/database';
import { RazorpayService } from './razorpay.service';
import { CreatePaymentIntentDto } from '../dto/create-payment-intent.dto';
import { PaymentStatus } from '../interfaces/payments.interface';

@Injectable()
export class PaymentIntentService {
  constructor(
    private readonly prismaWrite: PrismaWriteService,
    private readonly razorpayService: RazorpayService,
  ) {}

  async createIntent(userId: string, dto: CreatePaymentIntentDto) {
    // Determine the amount and currency from DTO or Project/Milestone logic
    // For now, we take it from DTO
    const currency = dto.currency || 'INR';

    // Create a temporary tracking record in DB
    const payment = await this.prismaWrite.payment.create({
      data: {
        projectId: dto.projectId,
        milestoneId: dto.milestoneId,
        clientId: userId,
        amount: dto.amount,
        currency,
        status: PaymentStatus.CREATED,
      },
    });

    // Call Razorpay to create an order
    const order = await this.razorpayService.createOrder(
      dto.amount,
      currency,
      `rcpt_${payment.id}`,
    );

    if (!order || !order.id) {
      await this.prismaWrite.payment.update({
        where: { id: payment.id },
        data: { status: PaymentStatus.FAILED },
      });
      throw new InternalServerErrorException('Failed to create payment intent');
    }

    // Update DB with Razorpay Order ID (intentId)
    const updatedPayment = await this.prismaWrite.payment.update({
      where: { id: payment.id },
      data: {
        intentId: order.id,
        status: PaymentStatus.PENDING,
      },
    });

    return {
      id: updatedPayment.id,
      projectId: updatedPayment.projectId,
      amount: updatedPayment.amount,
      currency: updatedPayment.currency,
      clientSecret: order.id, // Frontend uses Razorpay Order ID to open checkout
      status: updatedPayment.status,
    };
  }
}
