process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://user:pass@localhost:5432/testdb';
process.env.RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost:5672';

import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { QueuePublisherService, QueueConsumerService, DlqService } from '@nestlancer/queue';
import { EmailConsumer } from '../src/consumers/email.consumer';
import { EmailWorkerService } from '../src/services/email-worker.service';

let app: INestApplication;

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
