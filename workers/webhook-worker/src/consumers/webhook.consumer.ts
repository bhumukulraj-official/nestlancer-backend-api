import { Injectable } from '@nestjs/common';
import { Processor, Process } from '@nestlancer/queue';
import { LoggerService } from '@nestlancer/logger';
import { OutgoingWebhookProcessor } from '../processors/outgoing-webhook.processor';
import { RazorpayWebhookProcessor } from '../processors/razorpay-webhook.processor';
import { GithubWebhookProcessor } from '../processors/github-webhook.processor';
import { GenericWebhookProcessor } from '../processors/generic-webhook.processor';

@Injectable()
export class WebhookConsumer {
    constructor(
        private readonly logger: LoggerService,
        private readonly outgoingProcessor: OutgoingWebhookProcessor,
        private readonly razorpayProcessor: RazorpayWebhookProcessor,
        private readonly githubProcessor: GithubWebhookProcessor,
        private readonly genericProcessor: GenericWebhookProcessor,
    ) { }

    // This is a consolidated consumer if we use one queue with routing
    // or it just serves as a reference for the individual processors.
    // In our setup, individual processors have @Processor, so this might be redundant 
    // depending on how @nestlancer/queue is implemented.
    // Assuming @Processor on processors is enough.
}
