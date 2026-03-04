import { Test, TestingModule } from '@nestjs/testing';
import { INestApplicationContext } from '@nestjs/common';
import { AppModule } from '../../src/app.module';

describe('AppModule (Integration)', () => {
    let app: INestApplicationContext;

    beforeAll(async () => {
        const moduleRef: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleRef.createNestApplicationContext();
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
