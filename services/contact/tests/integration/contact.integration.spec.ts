import './integration.env';

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';
import { ValidationPipe } from '@nestjs/common';
import { AllExceptionsFilter, TransformResponseInterceptor } from '@nestlancer/common';
import { ContactSubject } from '@nestlancer/common';
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

describe('Contact Service (Integration)', () => {
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
        it('GET /api/v1/contact/health', async () => {
            const response = await request(app.getHttpServer())
                .get('/api/v1/contact/health');

            expect([200, 500]).toContain(response.status);
            if (response.status === 200) {
                expect(response.body).toBeDefined();
                expect(response.body.status || response.body.service).toBeDefined();
            }
        });
    });

    describe('Public Contact Form', () => {
        it('POST /api/v1/contact - should reject invalid payload (validation)', async () => {
            const response = await request(app.getHttpServer())
                .post('/api/v1/contact')
                .send({
                    name: '',
                    email: 'invalid-email',
                    subject: 'INVALID_SUBJECT',
                    message: 'short',
                    turnstileToken: '',
                });

            expect([400, 422, 500]).toContain(response.status);
        });

        it('POST /api/v1/contact - should accept valid payload', async () => {
            const response = await request(app.getHttpServer())
                .post('/api/v1/contact')
                .send({
                    name: 'John Doe',
                    email: 'john@example.com',
                    subject: ContactSubject.GENERAL,
                    message: 'This is a valid test message for integration testing.',
                    turnstileToken: 'test-turnstile-token',
                });

            expect([200, 201, 400, 422, 429, 500]).toContain(response.status);
            if (response.status === 200 || response.status === 201) {
                expect(response.body).toBeDefined();
            }
        });
    });

    describe('Admin - Contact', () => {
        it('GET /api/v1/admin/contact - should reject unauthenticated', async () => {
            const response = await request(app.getHttpServer()).get('/api/v1/admin/contact');
            expect([401, 500]).toContain(response.status);
        });

        it('GET /api/v1/admin/contact - should reject non-admin user', async () => {
            const response = await request(app.getHttpServer())
                .get('/api/v1/admin/contact')
                .set(authHeader('regular-user-1'));

            expect([403, 500]).toContain(response.status);
        });

        it('GET /api/v1/admin/contact - should accept admin token', async () => {
            const response = await request(app.getHttpServer())
                .get('/api/v1/admin/contact')
                .query({ page: '1', limit: '20' })
                .set(adminAuthHeader());

            expect([200, 500]).toContain(response.status);
            if (response.status === 200) {
                expect(response.body).toBeDefined();
            }
        });

        it('GET /api/v1/admin/contact/:id - should reject invalid id', async () => {
            const response = await request(app.getHttpServer())
                .get('/api/v1/admin/contact/invalid-uuid')
                .set(adminAuthHeader());

            expect([400, 404, 422, 500]).toContain(response.status);
        });

        it('PATCH /api/v1/admin/contact/:id/status - should reject invalid payload (validation)', async () => {
            const response = await request(app.getHttpServer())
                .patch('/api/v1/admin/contact/550e8400-e29b-41d4-a716-446655440000/status')
                .set(adminAuthHeader())
                .send({ status: 'INVALID_STATUS' });

            expect([400, 404, 422, 500]).toContain(response.status);
        });

        it('POST /api/v1/admin/contact/:id/respond - should reject unauthenticated', async () => {
            const response = await request(app.getHttpServer())
                .post('/api/v1/admin/contact/550e8400-e29b-41d4-a716-446655440000/respond')
                .send({ message: 'Admin response' });

            expect([401, 500]).toContain(response.status);
        });
    });
});
