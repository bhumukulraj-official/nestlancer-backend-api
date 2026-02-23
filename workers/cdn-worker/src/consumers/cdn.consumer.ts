import { Injectable, Logger } from '@nestjs/common';
import { ConsumeMessage } from 'amqplib';
import { QueueConsumerService, ROUTING_KEYS } from '@nestlancer/queue';
import { CdnWorkerService } from '../services/cdn-worker.service';
import { CdnJob } from '../interfaces/cdn-job.interface';

@Injectable()
export class CdnConsumer extends QueueConsumerService {
    private readonly logger = new Logger(CdnConsumer.name);

    constructor(private readonly cdnWorkerService: CdnWorkerService) {
        super();
    }

    async onModuleInit() {
        await this.setupConsumer('cdn.queue', ROUTING_KEYS.CDN_INVALIDATE, (msg) => this.handleMessage(msg));
    }

    private async handleMessage(msg: ConsumeMessage) {
        const job: CdnJob = JSON.parse(msg.content.toString());
        this.logger.log(`Received CDN job: ${job.type}`);

        try {
            switch (job.type) {
                case 'INVALIDATE_PATH':
                    if (job.paths && job.paths.length > 0) {
                        await Promise.all(job.paths.map((path) => this.cdnWorkerService.invalidatePath(path)));
                    }
                    break;
                case 'INVALIDATE_BATCH':
                    if (job.paths && job.paths.length > 0) {
                        await this.cdnWorkerService.invalidateBatch(job.paths);
                    }
                    break;
                case 'PURGE_ALL':
                    await this.cdnWorkerService.purgeAll();
                    break;
                default:
                    this.logger.warn(`Unknown CDN job type: ${job.type}`);
            }
        } catch (error) {
            this.logger.error(`Error processing CDN job ${job.type}: ${error.message}`, error.stack);
            // Re-throw to allow nack/dlq handled by base class
            throw error;
        }
    }
}
