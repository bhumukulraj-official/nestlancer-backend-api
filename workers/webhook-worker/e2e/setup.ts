process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://user:pass@localhost:5432/testdb';
process.env.RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost:5672';

import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { QueuePublisherService, QueueConsumerService, DlqService } from '@nestlancer/queue';
import { PrismaWriteService, PrismaReadService } from '@nestlancer/database';
import { WebhookConsumer } from '../src/consumers/webhook.consumer';
import { WebhookWorkerService } from '../src/services/webhook-worker.service';

let app: INestApplication;

const mockPrismaWrite = () => ({
  payment: { findFirst: jest.fn(), update: jest.fn() },
  refund: { findFirst: jest.fn() },
  dispute: { create: jest.fn() },
  webhookLog: { update: jest.fn() },
  webhookDelivery: { create: jest.fn() },
  $transaction: jest.fn(),
  $connect: jest.fn(),
  $disconnect: jest.fn(),
});

const mockPrismaRead = () => ({
  webhook: { findUnique: jest.fn() },
  $connect: jest.fn(),
  $disconnect: jest.fn(),
});

export async function setupApp(): Promise<INestApplication> {
  const moduleRef = await Test.createTestingModule({
    imports: [AppModule],
  })
    .overrideProvider(QueuePublisherService)
    .useValue({ publish: jest.fn() })
    .overrideProvider(QueueConsumerService)
    .useValue({ consume: jest.fn(), getChannel: jest.fn(), onModuleInit: jest.fn() })
    .overrideProvider(DlqService)
    .useValue({})
    .overrideProvider(PrismaWriteService)
    .useValue(mockPrismaWrite())
    .overrideProvider(PrismaReadService)
    .useValue(mockPrismaRead())
    .compile();

  app = moduleRef.createNestApplication();
  await app.init();
  return app;
}

export async function teardownApp(): Promise<void> {
  await app?.close();
}

export function getApp(): INestApplication {
  return app;
}
