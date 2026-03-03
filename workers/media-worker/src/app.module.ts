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
import { VirusScanProcessor } from './processors/virus-scan.processor';
import { ImageResizeProcessor } from './processors/image-resize.processor';
import { ThumbnailGeneratorProcessor } from './processors/thumbnail-generator.processor';
import { MetadataExtractorProcessor } from './processors/metadata-extractor.processor';
import { mediaWorkerConfig } from './config/media-worker.config';

@Module({
    imports: [
        ConfigModule,
        LoggerModule,
        MetricsModule,
        TracingModule,
        DatabaseModule,
        StorageModule,
        QueueModule.forRoot(),
    ],
    providers: [
        MediaConsumer,
        MediaWorkerService,
        ImageProcessingService,
        VideoProcessingService,
        VirusScanProcessor,
        ImageResizeProcessor,
        ThumbnailGeneratorProcessor,
        MetadataExtractorProcessor,
    ],
})
export class MediaModule { }
