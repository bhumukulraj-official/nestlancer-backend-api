import './integration.env';

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from '../../src/app.module';
import { QueuePublisherService, QueueConsumerService, DlqService } from '@nestlancer/queue';
import { CdnWorkerService } from '../../src/services/cdn-worker.service';
import { CloudflareInvalidationService } from '../../src/services/cloudflare-invalidation.service';
import { CloudFrontInvalidationService } from '../../src/services/cloudfront-invalidation.service';
import { BatchCollectorService } from '../../src/services/batch-collector.service';
import { CdnConsumer } from '../../src/consumers/cdn.consumer';
import { PathInvalidationProcessor } from '../../src/processors/path-invalidation.processor';
import { BatchInvalidationProcessor } from '../../src/processors/batch-invalidation.processor';

describe('AppModule (Integration)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(QueuePublisherService)
      .useValue({ publish: jest.fn() })
      .overrideProvider(QueueConsumerService)
      .useValue({ consume: jest.fn(), getChannel: jest.fn(), onModuleInit: jest.fn() })
      .overrideProvider(DlqService)
      .useValue({})
      .compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  describe('Configuration & Dependencies', () => {
    it('should initialize the worker application context successfully', () => {
      expect(app).toBeDefined();
    });

    it('should resolve AppModule dependencies', () => {
      const appModule = app.get(AppModule);
      expect(appModule).toBeDefined();
    });

    it('should load cdn configuration', () => {
      const configService = app.get(ConfigService);
      expect(configService).toBeDefined();
      const cdnConfig = configService.get('cdn');
      expect(cdnConfig).toBeDefined();
    });

    it('should resolve all cdn processors and services', () => {
      const providers = [
        CdnWorkerService,
        CloudflareInvalidationService,
        CloudFrontInvalidationService,
        BatchCollectorService,
        CdnConsumer,
        PathInvalidationProcessor,
        BatchInvalidationProcessor,
      ];

      for (const provider of providers) {
        const instance = app.get(provider);
        expect(instance).toBeDefined();
      }
    });
  });
});
