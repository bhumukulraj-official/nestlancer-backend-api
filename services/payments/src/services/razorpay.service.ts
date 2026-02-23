import { Injectable, Inject, InternalServerErrorException } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import * as crypto from 'crypto';
import paymentsConfig from '../config/payments.config';

// Require is used because razorpay types might be problematic with ES imports
const Razorpay = require('razorpay');

@Injectable()
export class RazorpayService {
    private instance: any;

    constructor(
        @Inject(paymentsConfig.KEY)
        private readonly config: ConfigType<typeof paymentsConfig>,
    ) {
        this.instance = new Razorpay({
            key_id: this.config.razorpayKeyId,
            key_secret: this.config.razorpayKeySecret,
        });
    }

    async createOrder(amount: number, currency: string, receipt: string, notes?: any) {
        try {
            const options = {
                amount: amount * 100, // Razorpay expects amount in subunits (e.g., paise, cents)
                currency,
                receipt,
                notes,
            };
            const order = await this.instance.orders.create(options);
            return order;
        } catch (error: any) {
            throw new InternalServerErrorException(`Failed to create Razorpay order: ${error.message}`);
        }
    }

    async fetchOrder(orderId: string) {
        try {
            return await this.instance.orders.fetch(orderId);
        } catch (error: any) {
            throw new InternalServerErrorException(`Failed to fetch Razorpay order: ${error.message}`);
        }
    }

    async fetchPayment(paymentId: string) {
        try {
            return await this.instance.payments.fetch(paymentId);
        } catch (error: any) {
            throw new InternalServerErrorException(`Failed to fetch Razorpay payment: ${error.message}`);
        }
    }

    verifyWebhookSignature(body: string, signature: string): boolean {
        const expectedSignature = crypto
            .createHmac('sha256', this.config.razorpayWebhookSecret)
            .update(body)
            .digest('hex');

        return expectedSignature === signature;
    }

    verifyPaymentSignature(orderId: string, paymentId: string, signature: string): boolean {
        const text = orderId + '|' + paymentId;
        const expectedSignature = crypto
            .createHmac('sha256', this.config.razorpayKeySecret)
            .update(text)
            .digest('hex');

        return expectedSignature === signature;
    }

    async initiateRefund(paymentId: string, amount?: number, notes?: any) {
        try {
            const options: any = { notes };
            if (amount) {
                options.amount = amount * 100;
            }
            return await this.instance.payments.refund(paymentId, options);
        } catch (error: any) {
            throw new InternalServerErrorException(`Failed to initiate refund: ${error.message}`);
        }
    }
}
