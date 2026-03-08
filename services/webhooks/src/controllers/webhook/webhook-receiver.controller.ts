import { Controller, Post, Param, Headers, Req, HttpCode, HttpStatus, Logger, RawBodyRequest } from '@nestjs/common';
import { Request } from 'express';
import { WebhookIngestionService } from '../../services/webhook-ingestion.service';
import { Public } from '@nestlancer/common';

@Controller()
export class WebhookReceiverController {
    private readonly logger = new Logger(WebhookReceiverController.name);

    constructor(private readonly webhookIngestionService: WebhookIngestionService) { }

    @Public()
    @Post('razorpay')
    @HttpCode(HttpStatus.OK)
    async handleRazorpay(
        @Headers() headers: Record<string, string>,
        @Req() req: RawBodyRequest<Request>,
    ): Promise<void> {
        await this.processWebhook('razorpay', req.rawBody, headers);
    }

    @Public()
    @Post('cloudflare')
    @HttpCode(HttpStatus.OK)
    async handleCloudflare(
        @Headers() headers: Record<string, string>,
        @Req() req: RawBodyRequest<Request>,
    ): Promise<void> {
        await this.processWebhook('cloudflare', req.rawBody, headers);
    }

    @Public()
    @Post('github')
    @HttpCode(HttpStatus.OK)
    async handleGitHub(
        @Headers() headers: Record<string, string>,
        @Req() req: RawBodyRequest<Request>,
    ): Promise<void> {
        await this.processWebhook('github', req.rawBody, headers);
    }

    @Public()
    @Post('stripe')
    @HttpCode(HttpStatus.OK)
    async handleStripe(
        @Headers() headers: Record<string, string>,
        @Req() req: RawBodyRequest<Request>,
    ): Promise<void> {
        await this.processWebhook('stripe', req.rawBody, headers);
    }

    @Public()
    @Post(':provider')
    @HttpCode(HttpStatus.OK)
    async handleProvider(
        @Param('provider') provider: string,
        @Headers() headers: Record<string, string>,
        @Req() req: RawBodyRequest<Request>,
    ): Promise<void> {
        await this.processWebhook(provider, req.rawBody, headers);
    }

    private async processWebhook(provider: string, rawBody: Buffer | undefined, headers: Record<string, string>): Promise<void> {
        if (!rawBody) {
            this.logger.warn(`No raw body found for webhook from provider: ${provider}`);
        }

        // According to tracker: Returns 200 immediately (async processing), but we need to record to DB first
        // which is what handleIncoming does synchronously, then it dispatches to queue synchronously, 
        // which takes very little time.
        await this.webhookIngestionService.handleIncoming(
            provider,
            rawBody || Buffer.from(''),
            headers,
        );
    }
}
