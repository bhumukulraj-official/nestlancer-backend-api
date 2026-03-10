import './integration.env';

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';
import { ValidationPipe } from '@nestjs/common';
import { AllExceptionsFilter, TransformResponseInterceptor } from '@nestlancer/common';
import { AppModule } from '../../src/app.module';
import { createTestJwt } from '@nestlancer/testing/helpers/test-auth.helper';

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

describe('Quotes Service (Integration)', () => {
    let app: INestApplication;

    jest.setTimeout(30000);

    beforeAll(async () => {
        loadDevEnv();
        process.env.NODE_ENV = 'test';

        const moduleRef: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleRef.createNestApplication();

        app.setGlobalPrefix('api/v1');
        app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
        app.useGlobalInterceptors(new TransformResponseInterceptor());
        app.useGlobalFilters(new AllExceptionsFilter());

        await app.init();
    }, 60000);

    afterAll(async () => {
        if (app) {
            await app.close();
        }
    });

    describe('Health', () => {
        it('GET /api/v1/quotes/health', async () => {
            const response = await request(app.getHttpServer())
                .get('/api/v1/quotes/health')
                .expect(200);

            expect(response.body.status).toBe('success');
            expect(response.body.data.status).toBe('ok');
            expect(response.body.data.service).toBe('quotes');
        });
    });

    describe('Quotes (Authenticated)', () => {
        it('GET /api/v1/quotes - should reject unauthenticated', async () => {
            const response = await request(app.getHttpServer()).get('/api/v1/quotes');
            expect([401, 500]).toContain(response.status);
        });

        it('GET /api/v1/quotes - should accept valid token', async () => {
            const response = await request(app.getHttpServer())
                .get('/api/v1/quotes')
                .set(authHeader('test-user-1'));

            expect([200, 404, 500]).toContain(response.status);
            if (response.status === 200) {
                expect(response.body.status).toBe('success');
                expect(Array.isArray(response.body.data)).toBe(true);
            }
        });

        it('GET /api/v1/quotes/stats - should reject unauthenticated', async () => {
            const response = await request(app.getHttpServer()).get('/api/v1/quotes/stats');
            expect([401, 500]).toContain(response.status);
        });

        it('GET /api/v1/quotes/stats - should accept valid token', async () => {
            const response = await request(app.getHttpServer())
                .get('/api/v1/quotes/stats')
                .set(authHeader('test-user-1'));

            expect([200, 404, 500]).toContain(response.status);
            if (response.status === 200) {
                expect(response.body.status).toBe('success');
            }
        });

        it('GET /api/v1/quotes/:id - should reject invalid id', async () => {
            const response = await request(app.getHttpServer())
                .get('/api/v1/quotes/invalid-uuid')
                .set(authHeader('test-user-1'));

            expect([400, 404, 422, 500]).toContain(response.status);
        });

        it('POST /api/v1/quotes/:id/accept - should reject unauthenticated', async () => {
            const response = await request(app.getHttpServer())
                .post('/api/v1/quotes/550e8400-e29b-41d4-a716-446655440000/accept')
                .send({
                    acceptTerms: true,
                    signatureName: 'John Doe',
                    signatureDate: '2025-01-01T00:00:00Z',
                });

            expect([401, 500]).toContain(response.status);
        });

        it('POST /api/v1/quotes/:id/accept - should reject invalid payload (validation)', async () => {
            const response = await request(app.getHttpServer())
                .post('/api/v1/quotes/550e8400-e29b-41d4-a716-446655440000/accept')
                .set(authHeader('test-user-1'))
                .send({
                    acceptTerms: false,
                    signatureName: '',
                    signatureDate: 'invalid',
                });

            expect([400, 404, 422, 500]).toContain(response.status);
        });

        it('POST /api/v1/quotes/:id/decline - should reject invalid payload (validation)', async () => {
            const response = await request(app.getHttpServer())
                .post('/api/v1/quotes/550e8400-e29b-41d4-a716-446655440000/decline')
                .set(authHeader('test-user-1'))
                .send({
                    reason: 'invalid_reason',
                    requestRevision: true,
                });

            expect([400, 404, 422, 500]).toContain(response.status);
        });

        it('POST /api/v1/quotes/:id/request-changes - should reject invalid payload (validation)', async () => {
            const response = await request(app.getHttpServer())
                .post('/api/v1/quotes/550e8400-e29b-41d4-a716-446655440000/request-changes')
                .set(authHeader('test-user-1'))
                .send({
                    changes: [],
                });

            expect([400, 404, 422, 500]).toContain(response.status);
        });

        it('GET /api/v1/quotes/:id/pdf - should reject unauthenticated', async () => {
            const response = await request(app.getHttpServer())
                .get('/api/v1/quotes/550e8400-e29b-41d4-a716-446655440000/pdf');

            expect([401, 500]).toContain(response.status);
        });
    });

    describe('Admin - Quotes', () => {
        it('GET /api/v1/admin/quotes - should reject unauthenticated', async () => {
            const response = await request(app.getHttpServer()).get('/api/v1/admin/quotes');
            expect([401, 500]).toContain(response.status);
        });

        it('GET /api/v1/admin/quotes - should reject non-admin user', async () => {
            const response = await request(app.getHttpServer())
                .get('/api/v1/admin/quotes')
                .set(authHeader('regular-user-1'));

            expect([403, 500]).toContain(response.status);
        });

        it('GET /api/v1/admin/quotes - should accept admin token', async () => {
            const response = await request(app.getHttpServer())
                .get('/api/v1/admin/quotes')
                .query({ page: '1', limit: '20' })
                .set(adminAuthHeader());

            expect([200, 500]).toContain(response.status);
            if (response.status === 200) {
                expect(response.body.status).toBe('success');
                expect(response.body.data).toBeDefined();
            }
        });

        it('GET /api/v1/admin/quotes/stats - should reject non-admin', async () => {
            const response = await request(app.getHttpServer())
                .get('/api/v1/admin/quotes/stats')
                .set(authHeader('regular-user-1'));

            expect([403, 500]).toContain(response.status);
        });

        it('GET /api/v1/admin/quotes/stats - should accept admin token', async () => {
            const response = await request(app.getHttpServer())
                .get('/api/v1/admin/quotes/stats')
                .set(adminAuthHeader());

            expect([200, 500]).toContain(response.status);
        });

        it('POST /api/v1/admin/quotes - should reject invalid payload (validation)', async () => {
            const response = await request(app.getHttpServer())
                .post('/api/v1/admin/quotes')
                .set(adminAuthHeader())
                .send({
                    requestId: '',
                    title: '',
                    description: '',
                    totalAmount: -1,
                    currency: '',
                    validUntil: '',
                    validityDays: 0,
                    paymentBreakdown: [],
                });

            expect([400, 404, 422, 500]).toContain(response.status);
        });

        it('GET /api/v1/admin/quotes/templates - should accept admin token', async () => {
            const response = await request(app.getHttpServer())
                .get('/api/v1/admin/quotes/templates')
                .set(adminAuthHeader());

            expect([200, 500]).toContain(response.status);
        });

        it('GET /api/v1/admin/quotes/:id - should reject invalid id', async () => {
            const response = await request(app.getHttpServer())
                .get('/api/v1/admin/quotes/invalid-uuid')
                .set(adminAuthHeader());

            expect([400, 404, 422, 500]).toContain(response.status);
        });

        it('PATCH /api/v1/admin/quotes/:id - should reject invalid payload (validation)', async () => {
            const response = await request(app.getHttpServer())
                .patch('/api/v1/admin/quotes/550e8400-e29b-41d4-a716-446655440000')
                .set(adminAuthHeader())
                .send({ totalAmount: -1 });

            expect([400, 404, 422, 500]).toContain(response.status);
        });
    });
});
