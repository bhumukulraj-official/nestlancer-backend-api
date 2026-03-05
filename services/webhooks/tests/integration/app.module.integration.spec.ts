import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../../src/app.module';
import { JwtStrategy } from '@nestlancer/auth-lib';
import { ConfigService } from '@nestjs/config';
import { PrismaWriteService, PrismaReadService } from '@nestlancer/database';

process.env.NODE_ENV = 'test';
process.env.JWT_ACCESS_SECRET = 'test-secret';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';
process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/db';

describe('AppModule (Integration)', () => {
    let app: INestApplication;

    beforeAll(async () => {
        const moduleRef: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        })
            .overrideProvider('QUEUE_OPTIONS').useValue({ url: 'redis://localhost:6379' })
            .overrideProvider(ConfigService).useValue({ get: jest.fn().mockReturnValue('test-secret') })
            .overrideProvider(PrismaWriteService).useValue({})
            .overrideProvider(PrismaReadService).useValue({})
            .overrideProvider(JwtStrategy).useValue({ validate: jest.fn() })
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
