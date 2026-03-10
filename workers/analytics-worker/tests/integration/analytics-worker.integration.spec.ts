import './integration.env';

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';
import { AppModule } from '../../src/app.module';
import { AnalyticsWorkerService } from '../../src/services/analytics-worker.service';
import { AnalyticsConsumer } from '../../src/consumers/analytics.consumer';
import { UserAnalyticsProcessor } from '../../src/processors/user-analytics.processor';
import { QueuePublisherService, QueueConsumerService, DlqService } from '@nestlancer/queue';
import { PrismaWriteService, PrismaReadService } from '@nestlancer/database';
import { CacheService } from '@nestlancer/cache';
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

describe('Analytics Worker (Integration)', () => {
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
        analyticsEvent: { createMany: jest.fn(), create: jest.fn() },
        analyticsAggregation: { upsert: jest.fn(), findMany: jest.fn() },
      })
      .overrideProvider(PrismaReadService)
      .useValue({
        $connect: jest.fn(),
        $disconnect: jest.fn(),
        analyticsEvent: { findMany: jest.fn(), aggregate: jest.fn() },
        analyticsAggregation: { findMany: jest.fn(), findUnique: jest.fn() },
      })
      .overrideProvider(CacheService)
      .useValue({
        getClient: jest.fn().mockReturnValue({ get: jest.fn(), set: jest.fn(), del: jest.fn() }),
      })
      .overrideProvider(StorageService)
      .useValue({
        upload: jest.fn(),
        getSignedUrl: jest.fn(),
        delete: jest.fn(),
        exists: jest.fn(),
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
    it('should initialize the analytics worker application context successfully', () => {
      expect(app).toBeDefined();
    });

    it('should resolve AppModule', () => {
      const appModule = app.get(AppModule);
      expect(appModule).toBeDefined();
    });
  });

  describe('Service Resolution', () => {
    it('should resolve AnalyticsWorkerService', () => {
      const service = app.get(AnalyticsWorkerService);
      expect(service).toBeDefined();
    });

    it('should resolve AnalyticsConsumer', () => {
      const consumer = app.get(AnalyticsConsumer);
      expect(consumer).toBeDefined();
    });

    it('should resolve UserAnalyticsProcessor', () => {
      const processor = app.get(UserAnalyticsProcessor);
      expect(processor).toBeDefined();
    });
  });
});
