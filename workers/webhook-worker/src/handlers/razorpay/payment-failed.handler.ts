import { Injectable } from '@nestjs/common';
import { WebhookHandler } from '../../interfaces/webhook-handler.interface';
import { PrismaWriteService } from '@nestlancer/database';
import { LoggerService } from '@nestlancer/logger';
import { QueuePublisherService } from '@nestlancer/queue';

@Injectable()
export class PaymentFailedHandler implements WebhookHandler {
  constructor(
    private readonly prisma: PrismaWriteService,
    private readonly logger: LoggerService,
    private readonly queue: QueuePublisherService,
  ) {}

  canHandle(provider: string, eventType: string): boolean {
    return provider === 'razorpay' && eventType === 'payment.failed';
  }

  async handle(payload: any): Promise<void> {
    const razorpayPaymentId = payload.payment.entity.id;
    const reason = payload.payment.entity.error_description;

    const payment = await this.prisma.payment.findFirst({
      where: { externalId: razorpayPaymentId },
    });

    if (!payment) return;

    await this.prisma.payment.update({
      where: { id: payment.id },
      data: { status: 'FAILED', failureReason: reason },
    });

    await this.queue.publish('events', 'notification.payment.failed', {
      type: 'payment.failed',
      userId: payment.clientId,
      payload: { paymentId: payment.id, reason },
    });
  }
}
