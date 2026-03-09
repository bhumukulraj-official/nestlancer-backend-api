import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConsumeMessage } from 'amqplib';
import { QueueConsumerService } from '@nestlancer/queue';
import { LoggerService } from '@nestlancer/logger';
import { ConfigService } from '@nestjs/config';
import { WebhookWorkerService } from '../services/webhook-worker.service';
import { PrismaWriteService } from '@nestlancer/database';
import { IncomingWebhookJob } from '../interfaces/webhook-job.interface';
import { WEBHOOK_QUEUE_PAYMENTS, WEBHOOK_QUEUE_SYSTEM } from '../config/webhook-worker.config';

/**
 * Consumes webhook jobs from RabbitMQ (payments.webhook.queue, system.webhook.queue).
 * Message shape from webhooks service: { provider, eventType, eventId, timestamp, rawPayloadId, data }
 */
@Injectable()
export class WebhookConsumer implements OnModuleInit {
    constructor(
        private readonly logger: LoggerService,
        private readonly queueConsumer: QueueConsumerService,
        private readonly webhookWorkerService: WebhookWorkerService,
        private readonly prisma: PrismaWriteService,
        private readonly configService: ConfigService,
    ) {}

    async onModuleInit(): Promise<void> {
        const queues: string[] = this.configService.get<string[]>('webhook-worker.queues') ?? [
            WEBHOOK_QUEUE_PAYMENTS,
            WEBHOOK_QUEUE_SYSTEM,
        ];

        for (const queueName of queues) {
            this.logger.log(`[WebhookConsumer] Subscribing to queue: ${queueName}`);
            await this.queueConsumer.consume(queueName, (msg: ConsumeMessage) => this.handleMessage(queueName, msg));
        }
    }

    private async handleMessage(queueName: string, msg: ConsumeMessage): Promise<void> {
        const raw = msg.content.toString();
        let body: { provider: string; eventType: string; eventId?: string; rawPayloadId: string; data: Record<string, any> };

        try {
            body = JSON.parse(raw);
        } catch (e: any) {
            this.logger.error(`[WebhookConsumer] Invalid JSON on ${queueName}: ${e.message}`);
            throw e;
        }

        const { provider, eventType, eventId, rawPayloadId, data } = body;
        if (!provider || !eventType || !rawPayloadId) {
            this.logger.warn(`[WebhookConsumer] Skipping message missing provider/eventType/rawPayloadId`);
            return;
        }

        const job: IncomingWebhookJob = {
            provider,
            eventType,
            eventId: eventId ?? '',
            payload: data ?? {},
            incomingWebhookId: rawPayloadId,
        };

        this.logger.log(`[WebhookConsumer] Processing ${provider} ${eventType} (log ${rawPayloadId})`);

        try {
            await this.webhookWorkerService.dispatch(provider, eventType, job.payload);

            await this.prisma.webhookLog.update({
                where: { id: rawPayloadId },
                data: { status: 'PROCESSED', processedAt: new Date() },
            });
        } catch (error: any) {
            this.logger.error(`[WebhookConsumer] Failed ${provider} ${eventType}: ${error.message}`, error.stack);
            await this.prisma.webhookLog.update({
                where: { id: rawPayloadId },
                data: { status: 'FAILED', error: error.message },
            }).catch((err) => this.logger.error(`[WebhookConsumer] Failed to update webhook log: ${err.message}`));
            throw error;
        }
    }
}
