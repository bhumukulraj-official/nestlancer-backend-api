import { Test, TestingModule } from '@nestjs/testing';
import { INestApplicationContext } from '@nestjs/common';
import { AppModule } from '../../src/app.module';
import { PrismaWriteService, PrismaReadService } from '@nestlancer/database';
import { SchedulerRegistry } from '@nestjs/schedule';

describe('AppModule (Integration)', () => {
    let app: INestApplicationContext;

    beforeAll(async () => {
        const moduleRef: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        })
            .overrideProvider('QUEUE_OPTIONS')
            .useValue({})
            .overrideProvider(PrismaWriteService)
            .useValue({})
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
