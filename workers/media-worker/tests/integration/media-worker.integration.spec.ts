import './integration.env';

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';
import { AppModule } from '../../src/app.module';
import { MediaWorkerService } from '../../src/services/media-worker.service';
import { MediaConsumer } from '../../src/consumers/media.consumer';
import { VirusScanProcessor } from '../../src/processors/virus-scan.processor';
import { ImageResizeProcessor } from '../../src/processors/image-resize.processor';
import { ThumbnailGeneratorProcessor } from '../../src/processors/thumbnail-generator.processor';
import { MetadataExtractorProcessor } from '../../src/processors/metadata-extractor.processor';
import { QueuePublisherService, QueueConsumerService, DlqService } from '@nestlancer/queue';
import { PrismaWriteService, PrismaReadService } from '@nestlancer/database';
import { StorageService } from '@nestlancer/storage';

function loadDevEnv() {
  const envPath = resolve(__dirname, '../../../../.env.development');
  if (!existsSync(envPath)) return;
  const content = readFileSync(envPath, 'utf8');
  content.split('\n').forEach((line) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...value] = trimmed.split('=');
      if (key) {
        process.env[key.trim()] = value
          .join('=')
          .trim()
          .replace(/^["']|["']$/g, '');
      }
    }
  });
}

describe('Media Worker (Integration)', () => {
  let app: INestApplication;

  jest.setTimeout(30000);

  beforeAll(async () => {
    loadDevEnv();
    process.env.NODE_ENV = 'test';

    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(QueuePublisherService)
      .useValue({ publish: jest.fn() })
      .overrideProvider(QueueConsumerService)
      .useValue({ consume: jest.fn(), getChannel: jest.fn(), onModuleInit: jest.fn() })
      .overrideProvider(DlqService)
      .useValue({})
      .overrideProvider(PrismaWriteService)
      .useValue({
        $connect: jest.fn(),
        $disconnect: jest.fn(),
        media: { update: jest.fn(), findMany: jest.fn() },
      })
      .overrideProvider(PrismaReadService)
      .useValue({
        $connect: jest.fn(),
        $disconnect: jest.fn(),
        media: { findUnique: jest.fn(), findMany: jest.fn() },
      })
      .overrideProvider(StorageService)
      .useValue({
        upload: jest.fn(),
        getSignedUrl: jest.fn(),
        delete: jest.fn(),
        exists: jest.fn(),
        download: jest.fn(),
      })
      .compile();

    app = moduleRef.createNestApplication();
    await app.init();
  }, 60000);

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  describe('Module Initialization', () => {
    it('should initialize the media worker application context successfully', () => {
      expect(app).toBeDefined();
    });

    it('should resolve AppModule', () => {
      const appModule = app.get(AppModule);
      expect(appModule).toBeDefined();
    });
  });

  describe('Service Resolution', () => {
    it('should resolve MediaWorkerService', () => {
      const service = app.get(MediaWorkerService);
      expect(service).toBeDefined();
    });

    it('should resolve MediaConsumer', () => {
      const consumer = app.get(MediaConsumer);
      expect(consumer).toBeDefined();
    });

    it('should resolve VirusScanProcessor', () => {
      const processor = app.get(VirusScanProcessor);
      expect(processor).toBeDefined();
    });

    it('should resolve ImageResizeProcessor', () => {
      const processor = app.get(ImageResizeProcessor);
      expect(processor).toBeDefined();
    });

    it('should resolve ThumbnailGeneratorProcessor', () => {
      const processor = app.get(ThumbnailGeneratorProcessor);
      expect(processor).toBeDefined();
    });

    it('should resolve MetadataExtractorProcessor', () => {
      const processor = app.get(MetadataExtractorProcessor);
      expect(processor).toBeDefined();
    });
  });
});
