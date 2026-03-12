process.env.NODE_ENV = 'test';
process.env.RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost:5672';

import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { QueuePublisherService, QueueConsumerService, DlqService } from '@nestlancer/queue';
import { CdnConsumer } from '../src/consumers/cdn.consumer';
import { CdnWorkerService } from '../src/services/cdn-worker.service';

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
