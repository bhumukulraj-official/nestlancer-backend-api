import { Injectable, OnModuleInit } from '@nestjs/common';
import { VirusScanProcessor } from '../processors/virus-scan.processor';
import { ImageResizeProcessor } from '../processors/image-resize.processor';
import { MetadataExtractorProcessor } from '../processors/metadata-extractor.processor';
import { ThumbnailGeneratorProcessor } from '../processors/thumbnail-generator.processor';
import { PrismaWriteService } from '@nestlancer/database';
import { LoggerService } from '@nestlancer/logger';
import { MediaJob } from '../interfaces/media-job.interface';
import { MediaStatus } from '@prisma/client';

import { ConfigService } from '@nestjs/config';

/**
 * Orchestrator service for the Media Worker.
 * Coordinates virus scanning, metadata extraction, thumbnail generation, and image processing.
 * Manages media lifecycle by updating database status throughout the processing pipeline.
 */
@Injectable()
export class MediaWorkerService {
    constructor(
        private readonly virusScan: VirusScanProcessor,
        private readonly imageResize: ImageResizeProcessor,
        private readonly metadataExtractor: MetadataExtractorProcessor,
        private readonly thumbnailGenerator: ThumbnailGeneratorProcessor,
        private readonly prisma: PrismaWriteService,
        private readonly logger: LoggerService,
        private readonly configService: ConfigService,
    ) { }

    /**
     * Processes a single media job from the queue.
     * Transitions media status from PENDING to PROCESSING, then to READY, FAILED, or QUARANTINED.
     * 
     * @param job - The media job payload containing file location and metadata
     * @returns A promise that resolves when all processing steps are complete
     */
    async processJob(job: MediaJob): Promise<void> {
        this.logger.log(`[MediaWorker] Starting processing pipeline for Media ID: ${job.mediaId}`);

        try {
            // 1. Update status to PROCESSING
            await this.prisma.media.update({
                where: { id: job.mediaId },
                data: { status: MediaStatus.PROCESSING },
            });

            // 2. Virus Scan
            const scanResult = await this.virusScan.scanFile(job.s3Key);
            if (scanResult.isInfected) {
                this.logger.warn(`[MediaWorker] Security alert: Virus detected in ${job.s3Key}. Quarantining.`);
                await this.prisma.media.update({
                    where: { id: job.mediaId },
                    data: { status: MediaStatus.QUARANTINED, metadata: { virus: scanResult.virusName } },
                });
                return;
            }

            // 3. Extract Metadata
            const metadata = await this.metadataExtractor.extract(job.s3Key, job.contentType);

            // 4. Generate Thumbnail
            const thumbnailKey = await this.thumbnailGenerator.generate(job.s3Key, job.contentType);

            // 5. Context-specific processing (e.g. image variants)
            let variants: Record<string, string> = {};
            if (job.contentType.startsWith('image/')) {
                const privateBucket = this.configService.get<string>('storage.privateBucket') || 'nestlancer-private';
                variants = await this.imageResize.process(job.s3Key, privateBucket);
            }

            // 6. Final Status Update
            await this.prisma.media.update({
                where: { id: job.mediaId },
                data: {
                    status: MediaStatus.READY,
                    metadata: { ...metadata, variants },
                    urls: { thumbnail: thumbnailKey },
                },
            });

            this.logger.log(`[MediaWorker] Processing complete for ID: ${job.mediaId}. Status: READY`);
        } catch (error: any) {
            this.logger.error(`[MediaWorker] Pipeline failed for media ${job.mediaId}: ${error.message}`, error.stack);
            await this.prisma.media.update({
                where: { id: job.mediaId },
                data: { status: MediaStatus.FAILED },
            });
            throw error;
        }
    }
}
