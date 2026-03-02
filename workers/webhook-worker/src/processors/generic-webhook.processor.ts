import { Injectable } from '@nestjs/common';
// Processor/Process removed - using @Injectable() instead;
import { LoggerService } from '@nestlancer/logger';
import { IncomingWebhookJob } from '../interfaces/webhook-job.interface';
import { PrismaWriteService } from '@nestlancer/database';

@Processor('generic.webhook')
@Injectable()
export class GenericWebhookProcessor {
    constructor(
        private readonly logger: LoggerService,
        private readonly prisma: PrismaWriteService,
    ) { }

    @Process()
    async handleGeneric(job: IncomingWebhookJob): Promise<void> {
        this.logger.warn(`Received generic webhook event from ${job.provider}: ${job.eventType}`);

        await this.prisma.incomingWebhook.update({
            where: { id: job.incomingWebhookId },
            data: {
                status: 'MANUAL_REVIEW_REQUIRED',
                errorLog: `Generic processor fallback for ${job.provider}`,
            },
        });
    }
}
