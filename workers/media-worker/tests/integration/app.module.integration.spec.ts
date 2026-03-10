import './integration.env';

import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../src/app.module';
import { QueuePublisherService, QueueConsumerService, DlqService } from '@nestlancer/queue';
import { PrismaWriteService } from '@nestlancer/database';
import { StorageService } from '@nestlancer/storage';

describe('AppModule (Integration)', () => {
  let app: any;

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider('QUEUE_OPTIONS')
      .useValue({})
      .overrideProvider(QueuePublisherService)
      .useValue({})
      .overrideProvider(QueueConsumerService)
      .useValue({ consume: jest.fn() })
      .overrideProvider(DlqService)
      .useValue({})
      .overrideProvider(PrismaWriteService)
      .useValue({
        media: { update: jest.fn() },
      })
      .overrideProvider(StorageService)
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

  it('should initialize the worker application context successfully', () => {
    expect(app).toBeDefined();
  });

  it('should resolve AppModule dependencies', () => {
    const appModule = app.get(AppModule);
    expect(appModule).toBeDefined();
  });
});
