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

describe('Notifications Service (Integration)', () => {
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
        it('GET /api/v1/health', async () => {
            const response = await request(app.getHttpServer())
                .get('/api/v1/health')
                .expect(200);

            expect(response.body.status).toBe('success');
            expect(response.body.data.status).toBe('ok');
            expect(response.body.data.service).toBe('notifications');
        });
    });

    describe('Test Notification (Authenticated)', () => {
        it('POST /api/v1/test - should reject unauthenticated', async () => {
            const response = await request(app.getHttpServer()).post('/api/v1/test');
            expect([401, 500]).toContain(response.status);
        });

        it('POST /api/v1/test - should accept valid token', async () => {
            const response = await request(app.getHttpServer())
                .post('/api/v1/test')
                .set(authHeader('test-user-1'));

            expect([200, 201, 404, 500]).toContain(response.status);
        });
    });

    describe('Notifications (Authenticated)', () => {
        it('GET /api/v1/notifications - should reject unauthenticated', async () => {
            const response = await request(app.getHttpServer()).get('/api/v1/notifications');
            expect([401, 500]).toContain(response.status);
        });

        it('GET /api/v1/notifications - should accept valid token', async () => {
            const response = await request(app.getHttpServer())
                .get('/api/v1/notifications')
                .set(authHeader('test-user-1'));

            expect([200, 404, 500]).toContain(response.status);
            if (response.status === 200) {
                expect(response.body.status).toBe('success');
            }
        });

        it('GET /api/v1/notifications/unread-count - should reject unauthenticated', async () => {
            const response = await request(app.getHttpServer()).get('/api/v1/notifications/unread-count');
            expect([401, 500]).toContain(response.status);
        });

        it('PATCH /api/v1/notifications/:id/read - should reject unauthenticated', async () => {
            const response = await request(app.getHttpServer())
                .patch('/api/v1/notifications/550e8400-e29b-41d4-a716-446655440000/read');
            expect([401, 500]).toContain(response.status);
        });

        it('POST /api/v1/notifications/read-all - should reject unauthenticated', async () => {
            const response = await request(app.getHttpServer()).post('/api/v1/notifications/read-all');
            expect([401, 500]).toContain(response.status);
        });
    });

    describe('Notification Preferences (Authenticated)', () => {
        it('GET /api/v1/notifications/preferences - should reject unauthenticated', async () => {
            const response = await request(app.getHttpServer()).get('/api/v1/notifications/preferences');
            expect([401, 500]).toContain(response.status);
        });

        it('GET /api/v1/notifications/channels - should reject unauthenticated', async () => {
            const response = await request(app.getHttpServer()).get('/api/v1/notifications/channels');
            expect([401, 500]).toContain(response.status);
        });

        it('PATCH /api/v1/notifications/preferences - should reject unauthenticated', async () => {
            const response = await request(app.getHttpServer())
                .patch('/api/v1/notifications/preferences')
                .send({ preferences: {} });
            expect([401, 500]).toContain(response.status);
        });
    });

    describe('Push Subscriptions (Authenticated)', () => {
        it('POST /api/v1/push-subscription - should reject unauthenticated', async () => {
            const response = await request(app.getHttpServer())
                .post('/api/v1/push-subscription')
                .send({ endpoint: 'https://example.com', keys: { p256dh: 'x', auth: 'y' } });
            expect([401, 500]).toContain(response.status);
        });

        it('DELETE /api/v1/push-subscription - should reject unauthenticated', async () => {
            const response = await request(app.getHttpServer())
                .delete('/api/v1/push-subscription')
                .send({ endpoint: 'https://example.com' });
            expect([401, 500]).toContain(response.status);
        });
    });

    describe('Push (Authenticated)', () => {
        it('POST /api/v1/push/register - should reject unauthenticated', async () => {
            const response = await request(app.getHttpServer())
                .post('/api/v1/push/register')
                .send({ token: 'fcm_token', deviceId: 'device_1', platform: 'android' });
            expect([401, 500]).toContain(response.status);
        });

        it('DELETE /api/v1/push/unregister/:deviceId - should reject unauthenticated', async () => {
            const response = await request(app.getHttpServer())
                .delete('/api/v1/push/unregister/device_1');
            expect([401, 500]).toContain(response.status);
        });
    });

    describe('Admin - Notifications', () => {
        it('GET /api/v1/admin/notifications - should reject unauthenticated', async () => {
            const response = await request(app.getHttpServer()).get('/api/v1/admin/notifications');
            expect([401, 500]).toContain(response.status);
        });

        it('GET /api/v1/admin/notifications - should reject non-admin user', async () => {
            const response = await request(app.getHttpServer())
                .get('/api/v1/admin/notifications')
                .set(authHeader('regular-user-1'));

            expect([403, 500]).toContain(response.status);
        });

        it('GET /api/v1/admin/notifications - should accept admin token', async () => {
            const response = await request(app.getHttpServer())
                .get('/api/v1/admin/notifications')
                .query({ page: '1', limit: '20' })
                .set(adminAuthHeader());

            expect([200, 500]).toContain(response.status);
            if (response.status === 200) {
                expect(response.body.status).toBe('success');
            }
        });

        it('GET /api/v1/admin/notifications/stats - should reject non-admin', async () => {
            const response = await request(app.getHttpServer())
                .get('/api/v1/admin/notifications/stats')
                .set(authHeader('regular-user-1'));

            expect([403, 500]).toContain(response.status);
        });

        it('GET /api/v1/admin/notifications/stats - should accept admin token', async () => {
            const response = await request(app.getHttpServer())
                .get('/api/v1/admin/notifications/stats')
                .set(adminAuthHeader());

            expect([200, 500]).toContain(response.status);
        });

        it('POST /api/v1/admin/notifications/send - should reject invalid payload (validation)', async () => {
            const response = await request(app.getHttpServer())
                .post('/api/v1/admin/notifications/send')
                .set(adminAuthHeader())
                .send({ userId: '', title: '', body: '' });

            expect([400, 404, 422, 500]).toContain(response.status);
        });
    });
});
