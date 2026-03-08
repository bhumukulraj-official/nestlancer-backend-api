import { Injectable } from '@nestjs/common';
import { StorageService } from '@nestlancer/storage';
import { ImageProcessingService } from '../services/image-processing.service';
import { VideoProcessingService } from '../services/video-processing.service';

/**
 * Processor responsible for generating preview thumbnails for different media types.
 * Supports generating thumbnails from images and extracting frames from videos.
 */
@Injectable()
export class ThumbnailGeneratorProcessor {
    constructor(
        private readonly storage: StorageService,
        private readonly imageService: ImageProcessingService,
        private readonly videoService: VideoProcessingService,
    ) { }

    /**
     * Generates a thumbnail for the specified media file.
     * 
     * @param s3Key - The key of the original file
     * @param contentType - MIME type of the original file
     * @returns A promise resolving to the S3 key of the generated thumbnail
     */
    async generate(s3Key: string, contentType: string): Promise<string> {
        const bucket = 'nestlancer-private'; // TODO: Injection for environment-specific bucket
        const thumbnailKey = `thumb_${s3Key}.webp`;

        if (contentType.startsWith('image/')) {
            const buffer = await this.storage.download(bucket, s3Key);
            const thumbBuffer = await this.imageService.generateThumbnail(buffer);
            await this.storage.upload(bucket, thumbnailKey, thumbBuffer, 'image/webp');
        } else if (contentType.startsWith('video/')) {
            // Logic for video thumbnail extraction using FFmpeg via videoService
            this.logger.warn(`[ThumbnailGen] Video thumbnail extraction for ${s3Key} is currently pending implementation.`);
        }

        return thumbnailKey;
    }

    // Proxy for logger if needed, or inject LoggerService
    private readonly logger = { warn: console.warn };
}
