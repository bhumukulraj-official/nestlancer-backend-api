process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://user:pass@localhost:5432/testdb';
process.env.RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost:5672';

import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { QueuePublisherService, QueueConsumerService, DlqService } from '@nestlancer/queue';
import { PrismaWriteService, PrismaReadService } from '@nestlancer/database';
import { OutboxPollerService } from '../src/services/outbox-poller.service';
import { OutboxPublisherService } from '../src/services/outbox-publisher.service';

let app: INestApplication;

const mockPrisma = () => ({
  $connect: jest.fn(),
  $disconnect: jest.fn(),
  outboxEvent: { findMany: jest.fn().mockResolvedValue([]) },
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
    .useValue(mockPrisma())
    .overrideProvider(PrismaReadService)
    .useValue(mockPrisma())
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
