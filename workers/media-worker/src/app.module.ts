import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LoggerModule } from '@nestlancer/logger';
import { MetricsModule } from '@nestlancer/metrics';
import { TracingModule } from '@nestlancer/tracing';
import { DatabaseModule } from '@nestlancer/database';
import { QueueModule } from '@nestlancer/queue';
import { StorageModule } from '@nestlancer/storage';
import { MediaConsumer } from './consumers/media.consumer';
import { MediaWorkerService } from './services/media-worker.service';
import { ImageProcessingService } from './services/image-processing.service';
import { VideoProcessingService } from './services/video-processing.service';
import { CdnInvalidationEmitterService } from './services/cdn-invalidation-emitter.service';
import { VirusScanProcessor } from './processors/virus-scan.processor';
import { ImageResizeProcessor } from './processors/image-resize.processor';
import { ImageCompressProcessor } from './processors/image-compress.processor';
import { ThumbnailGeneratorProcessor } from './processors/thumbnail-generator.processor';
import { VideoTranscodeProcessor } from './processors/video-transcode.processor';
import { DocumentThumbnailProcessor } from './processors/document-thumbnail.processor';
import { MetadataExtractorProcessor } from './processors/metadata-extractor.processor';
import { mediaWorkerConfig } from './config/media-worker.config';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            load: [mediaWorkerConfig],
        }),
        LoggerModule.forRoot({ serviceName: 'media-worker' }),
        MetricsModule.forRoot(),
        TracingModule.forRoot({ serviceName: 'media-worker' }),
        DatabaseModule.forRoot(),
        StorageModule.forRoot(),
        QueueModule.forConsumer('media'),
    ],
    providers: [
        MediaConsumer,
        MediaWorkerService,
        ImageProcessingService,
        VideoProcessingService,
        CdnInvalidationEmitterService,
        VirusScanProcessor,
        ImageResizeProcessor,
        ImageCompressProcessor,
        ThumbnailGeneratorProcessor,
        VideoTranscodeProcessor,
        DocumentThumbnailProcessor,
        MetadataExtractorProcessor,
    ],
})
export class MediaModule { }
