import './integration.env';

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';
import { AuditModule } from '../../src/app.module';
import { AuditConsumer } from '../../src/consumers/audit.consumer';
import { AuditWorkerService } from '../../src/services/audit-worker.service';
import { AuditBatchInsertProcessor } from '../../src/processors/audit-batch-insert.processor';
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

describe('Audit Worker (Integration)', () => {
  let app: INestApplication;

  jest.setTimeout(30000);

  beforeAll(async () => {
    loadDevEnv();
    process.env.NODE_ENV = 'test';

    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [AuditModule],
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
        auditLog: { createMany: jest.fn(), create: jest.fn() },
        $transaction: jest.fn(),
      })
      .overrideProvider(PrismaReadService)
      .useValue({
        $connect: jest.fn(),
        $disconnect: jest.fn(),
        auditLog: { findMany: jest.fn() },
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
    it('should initialize the audit worker application context successfully', () => {
      expect(app).toBeDefined();
    });

    it('should resolve AuditModule', () => {
      const auditModule = app.get(AuditModule);
      expect(auditModule).toBeDefined();
    });
  });

  describe('Service Resolution', () => {
    it('should resolve AuditWorkerService', () => {
      const service = app.get(AuditWorkerService);
      expect(service).toBeDefined();
    });

    it('should resolve AuditConsumer', () => {
      const consumer = app.get(AuditConsumer);
      expect(consumer).toBeDefined();
    });

    it('should resolve AuditBatchInsertProcessor', () => {
      const processor = app.get(AuditBatchInsertProcessor);
      expect(processor).toBeDefined();
    });
  });
});
