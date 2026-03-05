import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { ConfigModule } from '@nestlancer/config';
import { AppModule } from '../../src/app.module';

describe('AppModule (Integration)', () => {
    let app: INestApplication;

    beforeAll(async () => {
        process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/nestlancer_test';
        process.env.JWT_ACCESS_SECRET = 'test-secret-that-is-long-enough';
        process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-that-is-long';

        const moduleRef: TestingModule = await Test.createTestingModule({
            imports: [
                ConfigModule.forRoot(),
                AppModule
            ],
        })
            .overrideProvider('QueueConsumerService').useValue({ start: jest.fn(), stop: jest.fn() })
            .overrideProvider('OutboxPollerService').useValue({ start: jest.fn(), stop: jest.fn() })
            .compile();

        app = moduleRef.createNestApplication();
        await app.init();
    });

    afterAll(async () => {
        if (app) {
            await app.close();
        }
    });

    it('should initialize the HTTP service application successfully', () => {
        expect(app).toBeDefined();
    });

    it('should resolve AppModule dependencies', () => {
        const appModule = app.get(AppModule);
        expect(appModule).toBeDefined();
    });
});
