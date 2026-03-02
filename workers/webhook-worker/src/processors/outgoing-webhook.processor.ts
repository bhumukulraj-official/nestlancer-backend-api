import { Injectable } from '@nestjs/common';
// Processor/Process removed - using @Injectable() instead;
import { HttpService } from '@nestjs/axios';
import { LoggerService } from '@nestlancer/logger';
import { SignatureVerifierService } from '../services/signature-verifier.service';
import { WebhookLoggerService } from '../services/webhook-logger.service';
import { OutgoingWebhookJob } from '../interfaces/webhook-job.interface';
import { lastValueFrom } from 'rxjs';
import { PrismaReadService } from '@nestlancer/database';

@Processor('webhook')
@Injectable()
export class OutgoingWebhookProcessor {
    constructor(
        private readonly logger: LoggerService,
        private readonly http: HttpService,
        private readonly signatureVerifier: SignatureVerifierService,
        private readonly webhookLogger: WebhookLoggerService,
        private readonly prisma: PrismaReadService,
    ) { }

    @Process()
    async handleOutgoing(job: OutgoingWebhookJob): Promise<void> {
        const webhook = await this.prisma.webhook.findUnique({ where: { id: job.webhookId } });
        if (!webhook || !webhook.active) return;

        const signature = this.signatureVerifier.sign(job.payload, webhook.secret);
        const startTime = Date.now();

        try {
            const response = await lastValueFrom(
                this.http.post(webhook.url, job.payload, {
                    headers: {
                        'X-Webhook-Signature': signature,
                        'X-Webhook-Event': job.event,
                        'X-Webhook-Delivery-ID': crypto.randomUUID(),
                        'Content-Type': 'application/json',
                    },
                    timeout: 10000,
                }),
            );

            await this.webhookLogger.logDelivery(webhook.id, {
                statusCode: response.status,
                responseBody: JSON.stringify(response.data),
                responseTime: Date.now() - startTime,
                attempt: job.attempt,
            });
        } catch (error: any) {
            await this.webhookLogger.logDelivery(webhook.id, {
                statusCode: error.response?.status || 500,
                responseBody: JSON.stringify(error.response?.data || error.message),
                responseTime: Date.now() - startTime,
                attempt: job.attempt,
            });
            throw error; // Let queue handle retries
        }
    }
}
