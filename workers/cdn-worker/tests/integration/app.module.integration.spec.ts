import './integration.env';

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../../src/app.module';
import { QueuePublisherService, QueueConsumerService, DlqService } from '@nestlancer/queue';

describe('AppModule (Integration)', () => {
    let app: INestApplication;

    beforeAll(async () => {
        const moduleRef: TestingModule = await Test.createTestingModule({
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

