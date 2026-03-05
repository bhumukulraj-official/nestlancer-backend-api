process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/db';
process.env.JWT_ACCESS_SECRET = 'test-access-secret';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../../src/app.module';
import { PrismaWriteService, PrismaReadService } from '@nestlancer/database';
import { QueuePublisherService } from '@nestlancer/queue';
import { LoggerService } from '@nestlancer/logger';

describe('AppModule (Integration)', () => {
    let app: INestApplication;

    beforeAll(async () => {
        const moduleRef: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        })
            .overrideProvider('QUEUE_OPTIONS')
            .useValue({})
            .overrideProvider('LOGGER_OPTIONS')
            .useValue({})
            .overrideProvider(QueuePublisherService)
            .useValue({ publish: jest.fn() })
            .overrideProvider(PrismaWriteService)
            .useValue({
                payment: { findFirst: jest.fn(), update: jest.fn() },
                refund: { findFirst: jest.fn() },
                dispute: { create: jest.fn() },
                webhookLog: { update: jest.fn() },
                webhookDelivery: { create: jest.fn() },
                $transaction: jest.fn(),
                $connect: jest.fn(),
                $disconnect: jest.fn(),
            })
            .overrideProvider(PrismaReadService)
            .useValue({
                webhook: { findUnique: jest.fn() },
                $connect: jest.fn(),
                $disconnect: jest.fn(),
            })
            .overrideProvider(LoggerService)
            .useValue({ log: jest.fn(), error: jest.fn(), warn: jest.fn() })
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
