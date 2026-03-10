import './integration.env';

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';
import { AppModule } from '../../src/app.module';
import { OutboxPollerService } from '../../src/services/outbox-poller.service';
import { OutboxPublisherService } from '../../src/services/outbox-publisher.service';
import { LeaderElectionService } from '../../src/services/leader-election.service';
import { StaleEventMonitorService } from '../../src/services/stale-event-monitor.service';
import { QueuePublisherService, QueueConsumerService, DlqService } from '@nestlancer/queue';
import { PrismaWriteService, PrismaReadService } from '@nestlancer/database';

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

describe('Outbox Poller (Integration)', () => {
  let app: INestApplication;

  jest.setTimeout(30000);

  beforeAll(async () => {
    loadDevEnv();
    process.env.NODE_ENV = 'test';

    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider('QUEUE_OPTIONS')
      .useValue({ url: 'amqp://localhost:5672' })
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
        outboxEvent: { findMany: jest.fn(), updateMany: jest.fn(), deleteMany: jest.fn() },
        $transaction: jest.fn(),
      })
      .overrideProvider(PrismaReadService)
      .useValue({
        $connect: jest.fn(),
        $disconnect: jest.fn(),
        outboxEvent: { findMany: jest.fn(), findFirst: jest.fn() },
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
    it('should initialize the outbox poller application context successfully', () => {
      expect(app).toBeDefined();
    });

    it('should resolve AppModule', () => {
      const appModule = app.get(AppModule);
      expect(appModule).toBeDefined();
    });
  });

  describe('Service Resolution', () => {
    it('should resolve OutboxPollerService', () => {
      const service = app.get(OutboxPollerService);
      expect(service).toBeDefined();
    });

    it('should resolve OutboxPublisherService', () => {
      const service = app.get(OutboxPublisherService);
      expect(service).toBeDefined();
    });

    it('should resolve LeaderElectionService', () => {
      const service = app.get(LeaderElectionService);
      expect(service).toBeDefined();
    });

    it('should resolve StaleEventMonitorService', () => {
      const service = app.get(StaleEventMonitorService);
      expect(service).toBeDefined();
    });
  });
});
