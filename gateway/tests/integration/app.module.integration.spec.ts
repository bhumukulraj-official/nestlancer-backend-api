process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/db';
process.env.JWT_ACCESS_SECRET = 'super-secret-access-token-minimum-16-chars';
process.env.JWT_REFRESH_SECRET = 'super-secret-refresh-token-minimum-16-chars';

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../../src/app.module';
import { CacheService } from '@nestlancer/cache';
import { NestlancerConfigService } from '@nestlancer/config';
import { PrismaWriteService, PrismaReadService } from '@nestlancer/database';
import { HttpService } from '@nestjs/axios';
import { of } from 'rxjs';
import { AuthController } from '../../src/modules/auth/auth.controller';
import { UsersController } from '../../src/modules/users/users.controller';

describe('AppModule (Integration)', () => {
    let app: INestApplication;

    beforeAll(async () => {
        const mockCacheService = {
            getClient: jest.fn().mockReturnValue({
                on: jest.fn(),
                quit: jest.fn(),
                set: jest.fn(),
                del: jest.fn(),
                get: jest.fn(),
            }),
        };

        const mockHttpService = {
            request: jest.fn().mockReturnValue(of({ data: {}, status: 200, headers: {} })),
        };

        const moduleRef: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        })
            .overrideProvider(CacheService).useValue(mockCacheService)
            .overrideProvider(PrismaWriteService).useValue({})
            .overrideProvider(PrismaReadService).useValue({})
            .overrideProvider(HttpService).useValue(mockHttpService)
            .overrideProvider(NestlancerConfigService).useValue({
                port: 3000,
                get: jest.fn().mockReturnValue('mocked-value'),
            })
            .compile();

        app = moduleRef.createNestApplication();
        await app.init();
    });

    afterAll(async () => {
        if (app) {
            await app.close();
        }
    });

    it('should initialize the Gateway application successfully', () => {
        expect(app).toBeDefined();
    });

    it('should resolve AppModule dependencies', () => {
        const appModule = app.get(AppModule);
        expect(appModule).toBeDefined();
    });

    it('should route auth/login correctly to downstream service', async () => {
        const httpService = app.get(HttpService);
        const authController = app.get(AuthController);

        const mockRequest = {
            method: 'POST',
            path: '/api/v1/auth/login',
            body: { email: 'test@example.com', password: 'password' },
            headers: {},
        } as any;

        await authController.login(mockRequest);

        expect(httpService.request).toHaveBeenCalledWith(expect.objectContaining({
            url: 'http://localhost:3001/api/v1/auth/login',
            method: 'POST',
        }));
    });

    it('should route users/profile correctly and strip /users segment', async () => {
        const httpService = app.get(HttpService);
        const usersController = app.get(UsersController);

        const mockRequest = {
            method: 'GET',
            path: '/api/v1/users/profile',
            body: {},
            headers: {},
        } as any;

        await usersController.getProfile(mockRequest);

        expect(httpService.request).toHaveBeenCalledWith(expect.objectContaining({
            url: 'http://localhost:3002/api/v1/profile',
            method: 'GET',
        }));
    });
});
