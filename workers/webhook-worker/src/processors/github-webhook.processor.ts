import { Injectable } from '@nestjs/common';
import { Processor, Process } from '@nestlancer/queue';
import { LoggerService } from '@nestlancer/logger';
import { WebhookWorkerService } from '../services/webhook-worker.service';
import { IncomingWebhookJob } from '../interfaces/webhook-job.interface';

@Processor('github.webhook') // Example additional queue
@Injectable()
export class GithubWebhookProcessor {
    constructor(
        private readonly logger: LoggerService,
        private readonly webhookService: WebhookWorkerService,
    ) { }

    @Process()
    async handleGithub(job: IncomingWebhookJob): Promise<void> {
        this.logger.log(`Processing GitHub event: ${job.eventType}`);
        await this.webhookService.dispatch('github', job.eventType, job.payload);
    }
}
