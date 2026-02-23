import { Injectable } from '@nestjs/common';
import { StorageService } from '@nestlancer/storage';
import { ImageProcessingService } from '../services/image-processing.service';
import { VideoProcessingService } from '../services/video-processing.service';
import { MediaMetadata } from '../interfaces/processing-options.interface';

@Injectable()
export class MetadataExtractorProcessor {
    constructor(
        private readonly storage: StorageService,
        private readonly imageService: ImageProcessingService,
        private readonly videoService: VideoProcessingService,
    ) { }

    async extract(s3Key: string, contentType: string): Promise<MediaMetadata> {
        const bucket = 'nestlancer-private'; // Should be dynamic

        if (contentType.startsWith('image/')) {
            const buffer = await this.storage.getFileBuffer(bucket, s3Key);
            return this.imageService.extractMetadata(buffer);
        } else if (contentType.startsWith('video/')) {
            // FFmpeg probe
            return { duration: 0 }; // Placeholder
        }

        return {};
    }
}
