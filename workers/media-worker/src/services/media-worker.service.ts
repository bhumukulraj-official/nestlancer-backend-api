import { Injectable, OnModuleInit } from '@nestjs/common';
import { VirusScanProcessor } from '../processors/virus-scan.processor';
import { ImageResizeProcessor } from '../processors/image-resize.processor';
import { MetadataExtractorProcessor } from '../processors/metadata-extractor.processor';
import { ThumbnailGeneratorProcessor } from '../processors/thumbnail-generator.processor';
import { PrismaWriteService } from '@nestlancer/database';
import { LoggerService } from '@nestlancer/logger';
import { MediaJob } from '../interfaces/media-job.interface';
import { MediaStatus } from '@prisma/client';

@Injectable()
export class MediaWorkerService {
    constructor(
        private readonly virusScan: VirusScanProcessor,
        private readonly imageResize: ImageResizeProcessor,
        private readonly metadataExtractor: MetadataExtractorProcessor,
        private readonly thumbnailGenerator: ThumbnailGeneratorProcessor,
        private readonly prisma: PrismaWriteService,
        private readonly logger: LoggerService,
    ) { }

    async processJob(job: MediaJob): Promise<void> {
        this.logger.log(`Starting media processing for ID: ${job.mediaId}`);

        try {
            // 1. Update status to PROCESSING
            await this.prisma.media.update({
                where: { id: job.mediaId },
                data: { status: MediaStatus.PROCESSING },
            });

            // 2. Virus Scan
            const scanResult = await this.virusScan.scanFile(job.s3Key);
            if (scanResult.isInfected) {
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

            // 5. Context-specific processing
            let variants: Record<string, string> = {};
            if (job.contentType.startsWith('image/')) {
                variants = await this.imageResize.process(job.s3Key, 'nestlancer-private'); // Should be dynamic
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

            this.logger.log(`Media processing complete for ID: ${job.mediaId}`);
        } catch (error) {
            this.logger.error(`Error processing media ${job.mediaId}: ${error.message}`, error.stack);
            await this.prisma.media.update({
                where: { id: job.mediaId },
                data: { status: MediaStatus.FAILED },
            });
            throw error;
        }
    }
}
