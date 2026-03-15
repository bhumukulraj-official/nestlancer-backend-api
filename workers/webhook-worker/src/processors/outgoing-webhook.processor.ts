import { Injectable } from '@nestjs/common';
import { Processor, Process } from '@nestlancer/queue';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { LoggerService } from '@nestlancer/logger';
import { generateUuid } from '@nestlancer/common';
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
    private readonly configService: ConfigService,
    private readonly signatureVerifier: SignatureVerifierService,
    private readonly webhookLogger: WebhookLoggerService,
    private readonly prisma: PrismaReadService,
  ) {}

  @Process()
  async handleOutgoing(job: OutgoingWebhookJob): Promise<void> {
    const webhook = await this.prisma.webhook.findUnique({ where: { id: job.webhookId } });
    if (!webhook || !webhook.enabled) return;

    const timeoutMs =
      this.configService.get<number>('webhook-worker.outgoingTimeoutMs', 10000);

    const signature = this.signatureVerifier.sign(job.payload, webhook.secret);
    const startTime = Date.now();

    try {
      const response = await lastValueFrom(
        this.http.post(webhook.url, job.payload, {
          headers: {
            'X-Webhook-Signature': signature,
            'X-Webhook-Event': job.event,
            'X-Webhook-Delivery-ID': generateUuid(),
            'Content-Type': 'application/json',
          },
          timeout: timeoutMs,
        }),
      );

      await this.webhookLogger.logDelivery(webhook.id, job.event, job.payload, {
        statusCode: response.status,
        responseBody: JSON.stringify(response.data),
        responseTime: Date.now() - startTime,
        attempt: job.attempt,
      });
    } catch (error: any) {
      await this.webhookLogger.logDelivery(webhook.id, job.event, job.payload, {
        statusCode: error.response?.status || 500,
        responseBody: JSON.stringify(error.response?.data || error.message),
        responseTime: Date.now() - startTime,
        attempt: job.attempt,
      });
      throw error; // Let queue handle retries
    }
  }
}
