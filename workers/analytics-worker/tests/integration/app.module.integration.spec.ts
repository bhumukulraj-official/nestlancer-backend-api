process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/db';
process.env.REDIS_URL = 'redis://localhost:6379';
process.env.RABBITMQ_URL = 'amqp://localhost:5672';

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplicationContext } from '@nestjs/common';
import { AppModule } from '../../src/app.module';

describe('AppModule (Integration)', () => {
    let app: INestApplicationContext;

    beforeAll(async () => {
        const moduleRef: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleRef;
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
