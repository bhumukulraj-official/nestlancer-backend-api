import { Injectable } from '@nestjs/common';
import { ImageProcessingService } from '../services/image-processing.service';
import { StorageService } from '@nestlancer/storage';
import { ConfigService } from '@nestjs/config';
import { ImageVariant } from '../interfaces/processing-options.interface';

@Injectable()
export class ImageResizeProcessor {
    constructor(
        private readonly imageService: ImageProcessingService,
        private readonly storage: StorageService,
        private readonly configService: ConfigService,
    ) { }

    async process(s3Key: string, bucket: string): Promise<Record<string, string>> {
        const variants = this.configService.get<ImageVariant[]>('media-worker.imageVariants', []);
        const originalBuffer = await this.storage.download(bucket, s3Key);
        const variantKeys: Record<string, string> = {};

        for (const variant of variants) {
            const resizedBuffer = await this.imageService.resize(originalBuffer, variant);
            const variantKey = `${variant.name}_${s3Key}`;
            await this.storage.upload(bucket, variantKey, resizedBuffer, 'image/webp');
            variantKeys[variant.name] = variantKey;
        }

        return variantKeys;
    }
}
