import { Injectable, Logger, UnauthorizedException, BadRequestException, UnprocessableEntityException } from '@nestjs/common';
import { PrismaWriteService } from '@nestlancer/database';
import { WebhookDispatcherService } from './webhook-dispatcher.service';
import { RazorpayProvider } from '../providers/razorpay.provider';
import { CloudflareProvider } from '../providers/cloudflare.provider';
import { WebhookProvider } from '../interfaces/webhook-provider.interface';
import { WebhookEvent } from '../interfaces/webhook-event.interface';
import { WebhookLogStatus } from '@prisma/client';

@Injectable()
export class WebhookIngestionService {
    private readonly logger = new Logger(WebhookIngestionService.name);
    private providers: Map<string, WebhookProvider> = new Map();

    constructor(
        private readonly prismaWrite: PrismaWriteService,
        private readonly dispatcherService: WebhookDispatcherService,
        private readonly razorpayProvider: RazorpayProvider,
        private readonly cloudflareProvider: CloudflareProvider,
    ) {
        this.providers.set(this.razorpayProvider.name, this.razorpayProvider);
        this.providers.set(this.cloudflareProvider.name, this.cloudflareProvider);
    }

    async handleIncoming(providerId: string, rawBody: Buffer, headers: Record<string, string>): Promise<void> {
        const provider = this.providers.get(providerId);
        if (!provider) {
            throw new BadRequestException(`Provider ${providerId} not supported`);
        }

        if (!provider.verifySignature(rawBody, headers)) {
            this.logger.warn(`Signature verification failed for ${providerId}`);
            throw new UnauthorizedException({
                code: 'WEBHOOK_001',
                message: 'Invalid webhook signature',
            });
        }

        let payloadUrlDecoded: Record<string, any>;
        try {
            payloadUrlDecoded = JSON.parse(rawBody.toString('utf8'));
        } catch (e) {
            throw new UnprocessableEntityException({
                code: 'WEBHOOK_003',
                message: 'Unprocessable webhook payload',
            });
        }

        const event = provider.parseEvent(payloadUrlDecoded, headers);

        const webhookLog = await this.prismaWrite.webhookLog.create({
            data: {
                provider: providerId,
                event: event.eventType,
                payload: payloadUrlDecoded,
                headers: headers as any,
                status: WebhookLogStatus.RECEIVED,
            },
        });

        try {
            await this.dispatcherService.dispatch(event, webhookLog.id);

            await this.prismaWrite.webhookLog.update({
                where: { id: webhookLog.id },
                data: {
                    status: WebhookLogStatus.PROCESSED,
                    processedAt: new Date(),
                },
            });
        } catch (err) {
            this.logger.error(`Error processing webhook ${webhookLog.id}`, err);
            await this.prismaWrite.webhookLog.update({
                where: { id: webhookLog.id },
                data: {
                    status: WebhookLogStatus.FAILED,
                    error: err instanceof Error ? err.message : 'Unknown error',
                },
            });
            throw err;
        }
    }

    async processStoredWebhook(webhookLog: any): Promise<void> {
        const provider = this.providers.get(webhookLog.provider);
        if (!provider) {
            throw new Error(`Provider ${webhookLog.provider} not supported`);
        }

        let event: WebhookEvent;
        try {
            let payloadData = typeof webhookLog.payload === 'string' ? JSON.parse(webhookLog.payload) : webhookLog.payload;
            event = provider.parseEvent(payloadData, (webhookLog.headers as Record<string, string>) || {});
        } catch (e) {
            this.logger.error('Failed to parse event from payload', e);
            throw e;
        }

        try {
            await this.dispatcherService.dispatch(event, webhookLog.id);

            await this.prismaWrite.webhookLog.update({
                where: { id: webhookLog.id },
                data: {
                    status: WebhookLogStatus.PROCESSED,
                    processedAt: new Date(),
                    error: null,
                },
            });
        } catch (err) {
            this.logger.error(`Error processing stored webhook ${webhookLog.id}`, err);
            await this.prismaWrite.webhookLog.update({
                where: { id: webhookLog.id },
                data: {
                    status: WebhookLogStatus.FAILED,
                    error: err instanceof Error ? err.message : 'Unknown error',
                },
            });
            throw err;
        }
    }
}
