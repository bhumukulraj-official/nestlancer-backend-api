import { Injectable } from '@nestjs/common';
import { StorageService } from '@nestlancer/storage';
import { ImageProcessingService } from '../services/image-processing.service';
import { VideoProcessingService } from '../services/video-processing.service';

@Injectable()
export class ThumbnailGeneratorProcessor {
    constructor(
        private readonly storage: StorageService,
        private readonly imageService: ImageProcessingService,
        private readonly videoService: VideoProcessingService,
    ) { }

    async generate(s3Key: string, contentType: string): Promise<string> {
        const bucket = 'nestlancer-private'; // Should be dynamic
        const thumbnailKey = `thumb_${s3Key}.webp`;

        if (contentType.startsWith('image/')) {
            const buffer = await this.storage.download(bucket, s3Key);
            const thumbBuffer = await this.imageService.generateThumbnail(buffer);
            await this.storage.upload(bucket, thumbnailKey, thumbBuffer, 'image/webp');
        } else if (contentType.startsWith('video/')) {
            // Logic for video thumbnail extraction using FFmpeg
            // For now, let's assume it saves to /tmp and we upload it
            // In a real scenario, we'd use VideoProcessingService.extractFrame
        }

        return thumbnailKey;
    }
}
