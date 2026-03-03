import { Injectable, OnModuleInit } from '@nestjs/common';
import { QueueConsumerService } from '@nestlancer/queue';
import { MediaWorkerService } from '../services/media-worker.service';
import { MediaJob } from '../interfaces/media-job.interface';
import { LoggerService } from '@nestlancer/logger';

@Injectable()
export class MediaConsumer implements OnModuleInit {
    constructor(
        private readonly mediaWorkerService: MediaWorkerService,
        private readonly queueConsumer: QueueConsumerService,
        private readonly logger: LoggerService,
    ) { }

    async onModuleInit() {
        this.logger.log('Initializing MediaConsumer...');
        // Match the routing key used in the architecture docs (media.*)
        await this.queueConsumer.consume('media_processing_queue', async (msg) => {
            if (!msg) return;
            try {
                const data: MediaJob = JSON.parse(msg.content.toString());
                await this.mediaWorkerService.processJob(data);
            } catch (error: any) {
                this.logger.error(`Error processing media message: ${error.message}`);
                throw error; // Let QueueConsumerService handle nack
            }
        });
    }
}
