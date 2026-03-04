process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/testdb';
process.env.JWT_ACCESS_SECRET = 'test-secret-123456';
process.env.JWT_REFRESH_SECRET = 'test-secret-123456';
process.env.TURNSTILE_SECRET_KEY = 'test-turnstile-secret';

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../../src/app.module';

describe('AppModule (Integration)', () => {
    let app: INestApplication;

    beforeAll(async () => {
        process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/testdb';
        process.env.JWT_ACCESS_SECRET = 'test-secret';
        process.env.JWT_REFRESH_SECRET = 'test-secret';
        const moduleRef: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

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
