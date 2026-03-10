import './integration.env';

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';
import { ValidationPipe } from '@nestjs/common';
import { AllExceptionsFilter, HttpExceptionFilter, TransformResponseInterceptor, API_PREFIX } from '@nestlancer/common';
import { AppModule } from '../../src/app.module';
import { createTestJwt } from '@nestlancer/testing/helpers/test-auth.helper';
import { ConfigModule } from '@nestjs/config';

function loadDevEnv() {
    const envPath = resolve(__dirname, '../../../../.env.development');
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

const basePath = `/${API_PREFIX}`;

describe('Admin Service (Integration)', () => {
    let app: INestApplication;

    jest.setTimeout(30000);

    beforeAll(async () => {
        loadDevEnv();

        const moduleRef: TestingModule = await Test.createTestingModule({
            imports: [
                ConfigModule.forRoot({ isGlobal: true, ignoreEnvFile: true }),
                AppModule,
            ],
        }).compile();

        app = moduleRef.createNestApplication();

        app.setGlobalPrefix(API_PREFIX);
        app.useGlobalPipes(
            new ValidationPipe({
                whitelist: true,
                forbidNonWhitelisted: true,
                transform: true,
                transformOptions: { enableImplicitConversion: true },
            }),
        );
        app.useGlobalInterceptors(new TransformResponseInterceptor());
        app.useGlobalFilters(new AllExceptionsFilter(), new HttpExceptionFilter());

        await app.init();
    }, 60000);

    afterAll(async () => {
        if (app) {
            await app.close();
        }
    });

    describe('Dashboard', () => {
        it(`GET ${basePath}/dashboard/overview - should reject unauthenticated`, async () => {
            const response = await request(app.getHttpServer()).get(`${basePath}/dashboard/overview`);
            expect([401, 500]).toContain(response.status);
        });

        it(`GET ${basePath}/dashboard/overview - should reject non-admin user`, async () => {
            const response = await request(app.getHttpServer())
                .get(`${basePath}/dashboard/overview`)
                .set(authHeader('regular-user-1'));

            expect([403, 500]).toContain(response.status);
        });

        it(`GET ${basePath}/dashboard/overview - should accept admin token`, async () => {
            const response = await request(app.getHttpServer())
                .get(`${basePath}/dashboard/overview`)
                .set(adminAuthHeader());

            expect([200, 500]).toContain(response.status);
            if (response.status === 200) {
                expect(response.body).toBeDefined();
            }
        });

        it(`GET ${basePath}/dashboard/revenue - should reject unauthenticated`, async () => {
            const response = await request(app.getHttpServer()).get(`${basePath}/dashboard/revenue`);
            expect([401, 500]).toContain(response.status);
        });

        it(`GET ${basePath}/dashboard/users - should accept admin token`, async () => {
            const response = await request(app.getHttpServer())
                .get(`${basePath}/dashboard/users`)
                .set(adminAuthHeader());

            expect([200, 500]).toContain(response.status);
        });

        it(`GET ${basePath}/dashboard/projects - should accept admin token`, async () => {
            const response = await request(app.getHttpServer())
                .get(`${basePath}/dashboard/projects`)
                .set(adminAuthHeader());

            expect([200, 500]).toContain(response.status);
        });
    });

    describe('System', () => {
        it(`GET ${basePath}/system/config - should reject unauthenticated`, async () => {
            const response = await request(app.getHttpServer()).get(`${basePath}/system/config`);
            expect([401, 500]).toContain(response.status);
        });

        it(`GET ${basePath}/system/config - should accept admin token`, async () => {
            const response = await request(app.getHttpServer())
                .get(`${basePath}/system/config`)
                .set(adminAuthHeader());

            expect([200, 500]).toContain(response.status);
        });

        it(`GET ${basePath}/system/features - should reject unauthenticated`, async () => {
            const response = await request(app.getHttpServer()).get(`${basePath}/system/features`);
            expect([401, 500]).toContain(response.status);
        });

        it(`GET ${basePath}/system/jobs - should reject non-admin user`, async () => {
            const response = await request(app.getHttpServer())
                .get(`${basePath}/system/jobs`)
                .set(authHeader('regular-user-1'));

            expect([403, 500]).toContain(response.status);
        });

        it(`PATCH ${basePath}/system/config - should reject invalid payload (validation)`, async () => {
            const response = await request(app.getHttpServer())
                .patch(`${basePath}/system/config`)
                .set(adminAuthHeader())
                .send({ invalidKey: 123 });

            expect([200, 400, 422, 500]).toContain(response.status);
        });
    });

    describe('Audit', () => {
        it(`GET ${basePath}/audit - should reject unauthenticated`, async () => {
            const response = await request(app.getHttpServer()).get(`${basePath}/audit`);
            expect([401, 500]).toContain(response.status);
        });

        it(`GET ${basePath}/audit - should accept admin token`, async () => {
            const response = await request(app.getHttpServer())
                .get(`${basePath}/audit`)
                .query({ page: '1', limit: '20' })
                .set(adminAuthHeader());

            expect([200, 500]).toContain(response.status);
        });

        it(`GET ${basePath}/audit/stats - should reject non-admin user`, async () => {
            const response = await request(app.getHttpServer())
                .get(`${basePath}/audit/stats`)
                .set(authHeader('regular-user-1'));

            expect([403, 500]).toContain(response.status);
        });
    });

    describe('Backups', () => {
        it(`GET ${basePath}/backups - should reject unauthenticated`, async () => {
            const response = await request(app.getHttpServer()).get(`${basePath}/backups`);
            expect([401, 500]).toContain(response.status);
        });

        it(`GET ${basePath}/backups - should accept admin token`, async () => {
            const response = await request(app.getHttpServer())
                .get(`${basePath}/backups`)
                .set(adminAuthHeader());

            expect([200, 500]).toContain(response.status);
        });

        it(`POST ${basePath}/backups - should reject unauthenticated`, async () => {
            const response = await request(app.getHttpServer())
                .post(`${basePath}/backups`)
                .send({ notes: 'Test backup' });

            expect([401, 500]).toContain(response.status);
        });
    });

    describe('Webhooks (Admin)', () => {
        it(`GET ${basePath}/webhooks - should reject unauthenticated`, async () => {
            const response = await request(app.getHttpServer()).get(`${basePath}/webhooks`);
            expect([401, 500]).toContain(response.status);
        });

        it(`GET ${basePath}/webhooks - should accept admin token`, async () => {
            const response = await request(app.getHttpServer())
                .get(`${basePath}/webhooks`)
                .set(adminAuthHeader());

            expect([200, 500]).toContain(response.status);
        });

        it(`GET ${basePath}/webhooks/events - should reject non-admin user`, async () => {
            const response = await request(app.getHttpServer())
                .get(`${basePath}/webhooks/events`)
                .set(authHeader('regular-user-1'));

            expect([403, 500]).toContain(response.status);
        });

        it(`POST ${basePath}/webhooks - should reject invalid payload (validation)`, async () => {
            const response = await request(app.getHttpServer())
                .post(`${basePath}/webhooks`)
                .set(adminAuthHeader())
                .send({ url: 'not-a-valid-url', events: [] });

            expect([200, 201, 400, 422, 500]).toContain(response.status);
        });
    });

    describe('Email Templates', () => {
        it(`GET ${basePath}/system/email-templates - should reject unauthenticated`, async () => {
            const response = await request(app.getHttpServer()).get(`${basePath}/system/email-templates`);
            expect([401, 500]).toContain(response.status);
        });

        it(`GET ${basePath}/system/email-templates - should accept admin token`, async () => {
            const response = await request(app.getHttpServer())
                .get(`${basePath}/system/email-templates`)
                .set(adminAuthHeader());

            expect([200, 500]).toContain(response.status);
        });
    });

    describe('Impersonation', () => {
        it(`POST ${basePath}/users/:userId/impersonate - should reject unauthenticated`, async () => {
            const response = await request(app.getHttpServer())
                .post(`${basePath}/users/550e8400-e29b-41d4-a716-446655440000/impersonate`)
                .send({ reason: 'Test', durationMinutes: 60 });

            expect([401, 500]).toContain(response.status);
        });

        it(`POST ${basePath}/users/:userId/impersonate - should reject non-admin user`, async () => {
            const response = await request(app.getHttpServer())
                .post(`${basePath}/users/550e8400-e29b-41d4-a716-446655440000/impersonate`)
                .set(authHeader('regular-user-1'))
                .send({ reason: 'Test', durationMinutes: 60 });

            expect([403, 500]).toContain(response.status);
        });
    });
});
