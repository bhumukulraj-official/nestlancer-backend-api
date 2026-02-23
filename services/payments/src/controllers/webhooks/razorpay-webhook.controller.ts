import { Controller, Post, Headers, Body, Req, RawBodyRequest } from '@nestjs/common';
import { RazorpayWebhookService } from '../../services/razorpay-webhook.service';

@Controller('webhooks/razorpay')
export class RazorpayWebhookController {
    constructor(private readonly webhookService: RazorpayWebhookService) { }

    @Post()
    async handleWebhook(
        @Headers('x-razorpay-signature') signature: string,
        @Req() req: RawBodyRequest<Request>,
        @Body() payload: any,
    ) {
        const rawBody = req.rawBody?.toString('utf8');
        if (!rawBody) {
            throw new Error('Raw body not found. Make sure rawBody is enabled in NestJS app.');
        }
        return this.webhookService.handleWebhook(signature, rawBody, payload);
    }
}
