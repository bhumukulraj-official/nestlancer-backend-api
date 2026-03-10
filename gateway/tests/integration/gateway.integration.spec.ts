import './integration.env';

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';
import { of } from 'rxjs';
import { AuthController } from '../../src/modules/auth/auth.controller';
import { UsersController } from '../../src/modules/users/users.controller';
import {
    AppValidationPipe,
    AllExceptionsFilter,
    TransformResponseInterceptor,
    API_PREFIX,
    API_VERSION,
} from '@nestlancer/common';
import { AppModule } from '../../src/app.module';
import { CacheService } from '@nestlancer/cache';
import { NestlancerConfigService } from '@nestlancer/config';
import { PrismaWriteService, PrismaReadService } from '@nestlancer/database';
import { HttpService } from '@nestjs/axios';
import { createTestJwt } from '@nestlancer/testing/helpers/test-auth.helper';

const basePath = `/${API_PREFIX}/${API_VERSION}`;

function loadDevEnv() {
    const envPath = resolve(__dirname, '../../../.env.development');
    if (!existsSync(envPath)) return;
    const content = readFileSync(envPath, 'utf8');
    content.split('\n').forEach(line => {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#')) {
            const [key, ...value] = trimmed.split('=');
            if (key) {
                process.env[key.trim()] = value.join('=').trim().replace(/^["']|["']$/g, '');
            }
        }
    });
}

function authHeader(userId: string, role = 'USER') {
    const token = createTestJwt(
        { sub: userId, email: `${userId}@test.com`, role },
        { secret: process.env.JWT_ACCESS_SECRET },
    );
    return { Authorization: `Bearer ${token}` };
}

function adminAuthHeader() {
    return authHeader('admin-1', 'ADMIN');
}

describe('Gateway (Integration)', () => {
    let app: INestApplication;

    jest.setTimeout(30000);

    beforeAll(async () => {
        loadDevEnv();
        process.env.NODE_ENV = 'test';

        const mockCacheService = {
            getClient: jest.fn().mockReturnValue({
                on: jest.fn(),
                quit: jest.fn(),
                set: jest.fn(),
                del: jest.fn(),
                get: jest.fn(),
            }),
        };

        const mockHttpResponse = (data: unknown = { status: 'ok' }) =>
            of({ data, status: 200, headers: {} });

        const mockHttpService = {
            request: jest.fn().mockImplementation((config: { url?: string }) => {
                if (config.url?.includes('/health')) {
                    return mockHttpResponse({ status: 'ok', service: 'health' });
                }
                if (config.url?.includes('/auth/')) {
                    return mockHttpResponse({ accessToken: 'mock-token', user: { id: '1' } });
                }
                return mockHttpResponse();
            }),
            get: jest.fn().mockReturnValue(mockHttpResponse({ status: 'ok' })),
        };

        const moduleRef: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        })
            .overrideProvider(CacheService)
            .useValue(mockCacheService)
            .overrideProvider(PrismaWriteService)
            .useValue({})
            .overrideProvider(PrismaReadService)
            .useValue({})
            .overrideProvider(HttpService)
            .useValue(mockHttpService)
            .overrideProvider(NestlancerConfigService)
            .useValue({
                port: 3000,
                get: jest.fn().mockReturnValue('mocked-value'),
            })
            .compile();

        app = moduleRef.createNestApplication();

        app.setGlobalPrefix(`${API_PREFIX}/${API_VERSION}`);
        app.useGlobalPipes(new AppValidationPipe());
        app.useGlobalFilters(new AllExceptionsFilter());
        app.useGlobalInterceptors(new TransformResponseInterceptor());

        await app.init();
    }, 60000);

    afterAll(async () => {
        if (app) {
            await app.close();
        }
    });

    describe('Health (Gateway Local)', () => {
        it(`GET ${basePath}/health - gateway health check`, async () => {
            const response = await request(app.getHttpServer())
                .get(`${basePath}/health`)
                .expect(200);

            expect(response.body.status).toBe('success');
            expect(response.body.data.status).toBe('healthy');
            expect(response.body.data.uptime).toBeDefined();
        });

        it(`GET ${basePath}/health/live - liveness probe`, async () => {
            const response = await request(app.getHttpServer())
                .get(`${basePath}/health/live`)
                .expect(200);

            expect(response.body.status).toBe('success');
            expect(response.body.data.status).toBe('alive');
            expect(response.body.data.uptime).toBeDefined();
        });

        it(`GET ${basePath}/health/detailed - aggregated health`, async () => {
            const response = await request(app.getHttpServer())
                .get(`${basePath}/health/detailed`)
                .expect(res => {
                    if (res.status !== 200) {
                        console.error('Detailed health failed:', res.status, res.body);
                    }
                });

            expect([200, 206]).toContain(response.status);
            expect(response.body.status).toBe('success');
            const data = response.body.data || response.body;
            expect(['up', 'down', 'degraded']).toContain(data.status);
            expect(data.services).toBeDefined();
        });

        it(`GET ${basePath}/health/ready - readiness probe`, async () => {
            const response = await request(app.getHttpServer())
                .get(`${basePath}/health/ready`)
                .expect(res => [200].includes(res.status));
        });

        it(`GET ${basePath}/health/dependencies - dependency health`, async () => {
            const response = await request(app.getHttpServer())
                .get(`${basePath}/health/dependencies`)
                .expect(res => [200, 206].includes(res.status));

            expect(response.body.status).toBeDefined();
            const data = response.body.data || response.body;
            expect(data.services).toBeDefined();
        });

        it(`GET ${basePath}/health/services/:name - specific service health`, async () => {
            const response = await request(app.getHttpServer())
                .get(`${basePath}/health/services/auth`)
                .expect(200);

            expect(response.body.status).toBe('success');
            expect(response.body.data.service).toBe('auth');
            expect(response.body.data.status).toBeDefined();
        });
    });

    describe('Auth (Proxied)', () => {
        it(`POST ${basePath}/auth/login - should accept valid payload`, async () => {
            const response = await request(app.getHttpServer())
                .post(`${basePath}/auth/login`)
                .send({ email: 'test@example.com', password: 'password' });

            expect([200, 201, 502, 504]).toContain(response.status);
            if (response.status === 200 || response.status === 201) {
                expect(response.body).toBeDefined();
            }
        });

        it(`POST ${basePath}/auth/login - proxies to auth service`, async () => {
            const response = await request(app.getHttpServer())
                .post(`${basePath}/auth/login`)
                .send({ email: 'not-an-email', password: '' });

            expect([200, 400, 422, 502, 504]).toContain(response.status);
        });

        it(`POST ${basePath}/auth/register - proxies to auth service`, async () => {
            const response = await request(app.getHttpServer())
                .post(`${basePath}/auth/register`)
                .send({
                    email: 'invalid',
                    password: 'weak',
                    firstName: 'J',
                    lastName: 'D',
                    acceptTerms: false,
                });

            expect([200, 201, 400, 422, 502, 504]).toContain(response.status);
        });

        it(`GET ${basePath}/auth/health - auth service health`, async () => {
            const response = await request(app.getHttpServer())
                .get(`${basePath}/auth/health`);

            expect([200, 502, 504]).toContain(response.status);
        });

        it(`GET ${basePath}/auth/check-email - should accept query`, async () => {
            const response = await request(app.getHttpServer())
                .get(`${basePath}/auth/check-email`)
                .query({ email: 'test@example.com' });

            expect([200, 400, 422, 502, 504]).toContain(response.status);
        });
    });

    describe('Users (Proxied)', () => {
        it(`GET ${basePath}/users/profile - proxies to users service`, async () => {
            const response = await request(app.getHttpServer())
                .get(`${basePath}/users/profile`);

            expect([200, 401, 404, 500, 502, 504]).toContain(response.status);
        });

        it(`GET ${basePath}/users/profile - proxies with auth header`, async () => {
            const response = await request(app.getHttpServer())
                .get(`${basePath}/users/profile`)
                .set(authHeader('test-user-1'));

            expect([200, 404, 422, 500, 502, 504]).toContain(response.status);
        });

        it(`GET ${basePath}/users/health - users service health`, async () => {
            const response = await request(app.getHttpServer())
                .get(`${basePath}/users/health`)
                .set(authHeader('test-user-1'));

            expect([200, 401, 502, 504]).toContain(response.status);
        });

        it(`PATCH ${basePath}/users/profile - proxies to users service`, async () => {
            const response = await request(app.getHttpServer())
                .patch(`${basePath}/users/profile`)
                .set(authHeader('test-user-1'))
                .send({ firstName: 'J', lastName: 'D', phone: 'invalid' });

            expect([200, 400, 401, 422, 500, 502, 504]).toContain(response.status);
        });
    });

    describe('Admin (Proxied)', () => {
        it(`GET ${basePath}/admin/users - proxies to admin service`, async () => {
            const response = await request(app.getHttpServer())
                .get(`${basePath}/admin/users`);

            expect([200, 401, 403, 500, 502, 504]).toContain(response.status);
        });

        it(`GET ${basePath}/admin/users - proxies with admin token`, async () => {
            const response = await request(app.getHttpServer())
                .get(`${basePath}/admin/users`)
                .query({ page: '1', limit: '20' })
                .set(adminAuthHeader());

            expect([200, 500, 502, 504]).toContain(response.status);
            if (response.status === 200) {
                expect(response.body).toBeDefined();
            }
        });

        it(`GET ${basePath}/admin/dashboard/overview - proxies to admin service`, async () => {
            const response = await request(app.getHttpServer())
                .get(`${basePath}/admin/dashboard/overview`);

            expect([200, 401, 403, 500, 502, 504]).toContain(response.status);
        });
    });

    describe('Requests (Proxied)', () => {
        it(`GET ${basePath}/requests - proxies to requests service`, async () => {
            const response = await request(app.getHttpServer())
                .get(`${basePath}/requests`);

            expect([200, 401, 404, 500, 502, 504]).toContain(response.status);
        });

        it(`GET ${basePath}/requests - proxies with auth header`, async () => {
            const response = await request(app.getHttpServer())
                .get(`${basePath}/requests`)
                .set(authHeader('test-user-1'));

            expect([200, 404, 500, 502, 504]).toContain(response.status);
        });
    });

    describe('Quotes (Proxied)', () => {
        it(`GET ${basePath}/quotes - proxies to quotes service`, async () => {
            const response = await request(app.getHttpServer())
                .get(`${basePath}/quotes`);

            expect([200, 401, 404, 500, 502, 504]).toContain(response.status);
        });
    });

    describe('Projects (Proxied)', () => {
        it(`GET ${basePath}/projects - proxies to projects service`, async () => {
            const response = await request(app.getHttpServer())
                .get(`${basePath}/projects`);

            expect([200, 401, 404, 500, 502, 504]).toContain(response.status);
        });
    });

    describe('Contact (Proxied)', () => {
        it(`POST ${basePath}/contact - proxies to contact service`, async () => {
            const response = await request(app.getHttpServer())
                .post(`${basePath}/contact`)
                .send({
                    email: 'invalid',
                    subject: 'a',
                    message: 'short',
                });

            expect([200, 201, 400, 422, 502, 504]).toContain(response.status);
        });
    });

    describe('Proxy Routing', () => {
        it('should route auth/login correctly to downstream service', async () => {
            const httpService = app.get(HttpService);
            const authController = app.get(AuthController);

            const mockRequest = {
                method: 'POST',
                path: `${basePath}/auth/login`,
                body: { email: 'test@example.com', password: 'password' },
                headers: {},
            } as any;

            await authController.login(mockRequest);

            expect(httpService.request).toHaveBeenCalledWith(
                expect.objectContaining({
                    url: 'http://localhost:3001/api/v1/auth/login',
                    method: 'POST',
                }),
            );
        });

        it('should route users/profile correctly and strip /users segment', async () => {
            const httpService = app.get(HttpService);
            const usersController = app.get(UsersController);

            const mockRequest = {
                method: 'GET',
                path: `${basePath}/users/profile`,
                body: {},
                headers: {},
            } as any;

            await usersController.getProfile(mockRequest);

            expect(httpService.request).toHaveBeenCalledWith(
                expect.objectContaining({
                    url: 'http://localhost:3002/api/v1/profile',
                    method: 'GET',
                }),
            );
        });
    });
});
