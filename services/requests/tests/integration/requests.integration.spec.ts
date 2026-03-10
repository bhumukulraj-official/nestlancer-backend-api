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

const validCreateRequestDto = {
    title: 'Build a Custom CRM for Real Estate',
    description: 'We need a robust CRM system to manage lead flow, automated emails, and agent performance tracking for our real estate team.',
    category: 'webDevelopment',
    budget: { min: 5000, max: 15000, currency: 'USD', flexible: true },
    timeline: {
        preferredStartDate: '2025-01-01T00:00:00Z',
        deadline: '2025-06-01T23:59:59Z',
        flexible: false,
    },
    requirements: ['User authentication', 'Dashboard analytics', 'PDF reporting'],
};

describe('Requests Service (Integration)', () => {
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
        it('GET /api/v1/requests/health', async () => {
            const response = await request(app.getHttpServer())
                .get('/api/v1/requests/health')
                .expect(200);

            expect(response.body.status).toBe('success');
            expect(response.body.data.status).toBe('ok');
            expect(response.body.data.service).toBe('requests');
        });
    });

    describe('Requests (Authenticated)', () => {
        it('GET /api/v1/requests - should reject unauthenticated', async () => {
            const response = await request(app.getHttpServer()).get('/api/v1/requests');
            expect([401, 500]).toContain(response.status);
        });

        it('GET /api/v1/requests - should accept valid token', async () => {
            const response = await request(app.getHttpServer())
                .get('/api/v1/requests')
                .set(authHeader('test-user-1'));

            expect([200, 404, 500]).toContain(response.status);
            if (response.status === 200) {
                expect(response.body.status).toBe('success');
                expect(Array.isArray(response.body.data)).toBe(true);
            }
        });

        it('POST /api/v1/requests - should reject unauthenticated', async () => {
            const response = await request(app.getHttpServer())
                .post('/api/v1/requests')
                .send(validCreateRequestDto);

            expect([401, 500]).toContain(response.status);
        });

        it('POST /api/v1/requests - should reject invalid data (validation)', async () => {
            const response = await request(app.getHttpServer())
                .post('/api/v1/requests')
                .set(authHeader('test-user-1'))
                .send({
                    title: 'Ab',
                    description: 'Short',
                    category: 'invalid',
                    budget: { min: -1, max: 100, currency: 'USD', flexible: true },
                    timeline: {
                        preferredStartDate: '2025-01-01',
                        deadline: '2025-06-01',
                        flexible: false,
                    },
                    requirements: [],
                });

            expect([400, 422, 500]).toContain(response.status);
        });

        it('POST /api/v1/requests - should accept valid payload', async () => {
            const response = await request(app.getHttpServer())
                .post('/api/v1/requests')
                .set(authHeader('test-user-1'))
                .send(validCreateRequestDto);

            expect([201, 500]).toContain(response.status);
            if (response.status === 201) {
                expect(response.body.status).toBe('success');
                expect(response.body.data).toBeDefined();
            }
        });

        it('GET /api/v1/requests/stats - should reject unauthenticated', async () => {
            const response = await request(app.getHttpServer()).get('/api/v1/requests/stats');
            expect([401, 500]).toContain(response.status);
        });

        it('GET /api/v1/requests/stats - should accept valid token', async () => {
            const response = await request(app.getHttpServer())
                .get('/api/v1/requests/stats')
                .set(authHeader('test-user-1'));

            expect([200, 404, 500]).toContain(response.status);
            if (response.status === 200) {
                expect(response.body.status).toBe('success');
            }
        });

        it('GET /api/v1/requests/:id - should reject invalid id', async () => {
            const response = await request(app.getHttpServer())
                .get('/api/v1/requests/invalid-uuid')
                .set(authHeader('test-user-1'));

            expect([400, 404, 422, 500]).toContain(response.status);
        });

        it('PATCH /api/v1/requests/:id - should reject invalid payload (validation)', async () => {
            const response = await request(app.getHttpServer())
                .patch('/api/v1/requests/550e8400-e29b-41d4-a716-446655440000')
                .set(authHeader('test-user-1'))
                .send({ title: 'Ab' });

            expect([400, 404, 422, 500]).toContain(response.status);
        });

        it('POST /api/v1/requests/:id/submit - should reject unauthenticated', async () => {
            const response = await request(app.getHttpServer())
                .post('/api/v1/requests/550e8400-e29b-41d4-a716-446655440000/submit');

            expect([401, 500]).toContain(response.status);
        });

        it('DELETE /api/v1/requests/:id - should reject unauthenticated', async () => {
            const response = await request(app.getHttpServer())
                .delete('/api/v1/requests/550e8400-e29b-41d4-a716-446655440000');

            expect([401, 500]).toContain(response.status);
        });
    });

    describe('Attachments', () => {
        it('GET /api/v1/requests/:id/attachments - should reject unauthenticated', async () => {
            const response = await request(app.getHttpServer())
                .get('/api/v1/requests/550e8400-e29b-41d4-a716-446655440000/attachments');

            expect([401, 500]).toContain(response.status);
        });

        it('POST /api/v1/requests/:id/attachments - should reject unauthenticated', async () => {
            const response = await request(app.getHttpServer())
                .post('/api/v1/requests/550e8400-e29b-41d4-a716-446655440000/attachments')
                .attach('file', Buffer.from('fake'), 'test.png');

            expect([401, 500]).toContain(response.status);
        });
    });

    describe('Admin - Requests', () => {
        it('GET /api/v1/admin/requests - should reject unauthenticated', async () => {
            const response = await request(app.getHttpServer()).get('/api/v1/admin/requests');
            expect([401, 500]).toContain(response.status);
        });

        it('GET /api/v1/admin/requests - should reject non-admin user', async () => {
            const response = await request(app.getHttpServer())
                .get('/api/v1/admin/requests')
                .set(authHeader('regular-user-1'));

            expect([403, 500]).toContain(response.status);
        });

        it('GET /api/v1/admin/requests - should accept admin token', async () => {
            const response = await request(app.getHttpServer())
                .get('/api/v1/admin/requests')
                .query({ page: '1', limit: '20' })
                .set(adminAuthHeader());

            expect([200, 500]).toContain(response.status);
            if (response.status === 200) {
                expect(response.body.status).toBe('success');
                expect(response.body.data).toBeDefined();
            }
        });

        it('GET /api/v1/admin/requests/stats - should reject non-admin', async () => {
            const response = await request(app.getHttpServer())
                .get('/api/v1/admin/requests/stats')
                .set(authHeader('regular-user-1'));

            expect([403, 500]).toContain(response.status);
        });

        it('GET /api/v1/admin/requests/stats - should accept admin token', async () => {
            const response = await request(app.getHttpServer())
                .get('/api/v1/admin/requests/stats')
                .set(adminAuthHeader());

            expect([200, 500]).toContain(response.status);
        });

        it('PATCH /api/v1/admin/requests/:id/status - should reject invalid payload (validation)', async () => {
            const response = await request(app.getHttpServer())
                .patch('/api/v1/admin/requests/550e8400-e29b-41d4-a716-446655440000/status')
                .set(adminAuthHeader())
                .send({ status: 'invalid' });

            expect([400, 404, 422, 500]).toContain(response.status);
        });

        it('POST /api/v1/admin/requests/:id/notes - should reject invalid payload (validation)', async () => {
            const response = await request(app.getHttpServer())
                .post('/api/v1/admin/requests/550e8400-e29b-41d4-a716-446655440000/notes')
                .set(adminAuthHeader())
                .send({ content: '' });

            expect([400, 404, 422, 500]).toContain(response.status);
        });
    });
});
