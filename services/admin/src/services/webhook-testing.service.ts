import { Injectable, BadRequestException } from '@nestjs/common';
import { WebhooksManagementService } from './webhooks-management.service';
import { QueueProducerService } from '@nestlancer/queue';
import { TestWebhookDto } from '../dto/test-webhook.dto';

@Injectable()
export class WebhookTestingService {
    constructor(
        private readonly webhooksService: WebhooksManagementService,
        private readonly queueService: QueueProducerService,
    ) { }

    async testDelivery(id: string, dto: TestWebhookDto) {
        const webhook = await this.webhooksService.findOne(id);

        if (!webhook.events.includes(dto.event) && !webhook.events.includes('*')) {
            throw new BadRequestException(`Webhook is not subscribed to event ${dto.event}`);
        }

        const testPayload = {
            event: dto.event,
            timestamp: new Date().toISOString(),
            data: { message: 'This is a test delivery from Nestlancer Admin' },
        };

        // In a full implementation, we push to a webhook outbox or queue 
        // to be picked up by the webhook dispatcher.
        await this.queueService.publish('admin', 'WEBHOOK_DISPATCH', {
            webhookId: webhook.id,
            event: dto.event,
            payload: testPayload,
            isTest: true,
        });

        return {
            success: true,
            message: 'Test event queued for delivery',
            event: dto.event,
        };
    }
}
