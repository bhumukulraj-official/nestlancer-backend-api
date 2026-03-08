import { Injectable } from '@nestjs/common';
import { StorageService } from '@nestlancer/storage';
import { ImageProcessingService } from '../services/image-processing.service';
import { VideoProcessingService } from '../services/video-processing.service';
import { MediaMetadata } from '../interfaces/processing-options.interface';

/**
 * Processor responsible for extracting technical metadata from media files.
 * Supports image properties (dimensions, EXIF) and video properties (duration, resolution).
 */
@Injectable()
export class MetadataExtractorProcessor {
    constructor(
        private readonly storage: StorageService,
        private readonly imageService: ImageProcessingService,
        private readonly videoService: VideoProcessingService,
    ) { }

    /**
     * Extracts metadata based on the media content type.
     * 
     * @param s3Key - The key of the file in storage
     * @param contentType - The MIME type of the file
     * @returns A promise resolving to the extracted metadata object
     */
    async extract(s3Key: string, contentType: string): Promise<MediaMetadata> {
        const bucket = 'nestlancer-private'; // TODO: Make dynamic based on environment

        if (contentType.startsWith('image/')) {
            const buffer = await this.storage.download(bucket, s3Key);
            return await this.imageService.extractMetadata(buffer);
        } else if (contentType.startsWith('video/')) {
            // Placeholder: Future integration with FFmpeg probe via videoService
            return { duration: 0 };
        }

        return {};
    }
}
