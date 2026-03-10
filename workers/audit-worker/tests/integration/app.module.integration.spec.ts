import './integration.env';

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AuditModule } from '../../src/app.module';
import { QueuePublisherService, QueueConsumerService, DlqService } from '@nestlancer/queue';
import { PrismaWriteService, PrismaReadService } from '@nestlancer/database';

describe('AuditModule (Integration)', () => {
  let app: INestApplication;

  beforeAll(async () => {
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
        auditLog: { createMany: jest.fn() },
      })
      .overrideProvider(PrismaReadService)
      .useValue({ $connect: jest.fn(), $disconnect: jest.fn(), auditLog: { findMany: jest.fn() } })
      .compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  it('should initialize the audit worker application context successfully', () => {
    expect(app).toBeDefined();
  });

  it('should resolve AuditModule dependencies', () => {
    const auditModule = app.get(AuditModule);
    expect(auditModule).toBeDefined();
  });
});
