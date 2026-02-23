import { Injectable } from '@nestjs/common';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { MediaWorkerService } from '../services/media-worker.service';
import { MediaJob } from '../interfaces/media-job.interface';
import { LoggerService } from '@nestlancer/logger';

@Injectable()
@Processor('media')
export class MediaConsumer extends WorkerHost {
    constructor(
        private readonly mediaWorkerService: MediaWorkerService,
        private readonly logger: LoggerService,
    ) {
        super();
    }

    async process(job: Job<MediaJob, any, string>): Promise<void> {
        try {
            await this.mediaWorkerService.processJob(job.data);
        } catch (error) {
            this.logger.error(`Error processing media job ${job.id}: ${error.message}`, error.stack);
            throw error;
        }
    }
}
