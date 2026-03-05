import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../src/app.module';
import { QueueModule, QueuePublisherService, QueueConsumerService, DlqService } from '@nestlancer/queue';
import { PrismaWriteService, PrismaReadService } from '@nestlancer/database';

describe('AppModule (Integration)', () => {
    let app: any;

    beforeAll(async () => {
        const moduleRef: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        })
            .overrideProvider('QUEUE_OPTIONS')
            .useValue({ url: 'amqp://localhost' })
            .overrideProvider(QueuePublisherService)
            .useValue({})
            .overrideProvider(QueueConsumerService)
            .useValue({ consume: jest.fn() })
            .overrideProvider(DlqService)
            .useValue({})
            .overrideProvider(PrismaWriteService)
            .useValue({
                notification: { create: jest.fn() },
                userPushSubscription: { findMany: jest.fn(), delete: jest.fn() }
            })
            .overrideProvider(PrismaReadService)
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
