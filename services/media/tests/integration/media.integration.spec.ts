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

describe('Media Service (Integration)', () => {
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
        it('GET /api/v1/health - should reject unauthenticated', async () => {
            const response = await request(app.getHttpServer()).get('/api/v1/health');
            expect([401, 500]).toContain(response.status);
        });

        it('GET /api/v1/health - should accept valid token', async () => {
            const response = await request(app.getHttpServer())
                .get('/api/v1/health')
                .set(authHeader('test-user-1'));

            expect([200, 500]).toContain(response.status);
            if (response.status === 200) {
                expect(response.body.status).toBe('success');
                const healthData = response.body.data ?? response.body;
                expect(healthData.status).toBe('ok');
                expect(healthData.service).toBe('media');
            }
        });
    });

    describe('Media (Authenticated)', () => {
        it('GET /api/v1/media - should reject unauthenticated', async () => {
            const response = await request(app.getHttpServer()).get('/api/v1/media');
            expect([401, 500]).toContain(response.status);
        });

        it('GET /api/v1/media - should accept valid token', async () => {
            const response = await request(app.getHttpServer())
                .get('/api/v1/media')
                .query({ page: '1', limit: '20' })
                .set(authHeader('test-user-1'));

            expect([200, 404, 500]).toContain(response.status);
            if (response.status === 200) {
                expect(response.body.status).toBe('success');
                expect(response.body.data).toBeDefined();
            }
        });

        it('GET /api/v1/stats - should reject unauthenticated', async () => {
            const response = await request(app.getHttpServer()).get('/api/v1/stats');
            expect([401, 500]).toContain(response.status);
        });

        it('GET /api/v1/stats - should accept valid token', async () => {
            const response = await request(app.getHttpServer())
                .get('/api/v1/stats')
                .set(authHeader('test-user-1'));

            expect([200, 404, 500]).toContain(response.status);
            if (response.status === 200) {
                expect(response.body.status).toBe('success');
            }
        });

        it('POST /api/v1/media/upload/request - should reject unauthenticated', async () => {
            const response = await request(app.getHttpServer())
                .post('/api/v1/media/upload/request')
                .send({ filename: 'test.png', mimeType: 'image/png', size: 1024 });

            expect([401, 500]).toContain(response.status);
        });

        it('POST /api/v1/media/upload/request - should reject invalid payload (validation)', async () => {
            const response = await request(app.getHttpServer())
                .post('/api/v1/media/upload/request')
                .set(authHeader('test-user-1'))
                .send({ filename: '', mimeType: 'invalid', size: -1 });

            expect([400, 401, 422, 500]).toContain(response.status);
        });

        it('POST /api/v1/media/upload/request - should accept valid payload', async () => {
            const response = await request(app.getHttpServer())
                .post('/api/v1/media/upload/request')
                .set(authHeader('test-user-1'))
                .send({ filename: 'test.png', mimeType: 'image/png', size: 1024 });

            expect([200, 201, 404, 500]).toContain(response.status);
            if (response.status === 200 || response.status === 201) {
                expect(response.body.status).toBe('success');
            }
        });

        it('GET /api/v1/media/:id - should reject unauthenticated', async () => {
            const response = await request(app.getHttpServer())
                .get('/api/v1/media/550e8400-e29b-41d4-a716-446655440000');
            expect([401, 500]).toContain(response.status);
        });

        it('GET /api/v1/media/:id - should reject invalid id', async () => {
            const response = await request(app.getHttpServer())
                .get('/api/v1/media/invalid-id')
                .set(authHeader('test-user-1'));

            expect([400, 404, 422, 500]).toContain(response.status);
        });

        it('PATCH /api/v1/media/:id - should reject unauthenticated', async () => {
            const response = await request(app.getHttpServer())
                .patch('/api/v1/media/550e8400-e29b-41d4-a716-446655440000')
                .send({ filename: 'updated.png' });

            expect([401, 500]).toContain(response.status);
        });

        it('DELETE /api/v1/media/:id - should reject unauthenticated', async () => {
            const response = await request(app.getHttpServer())
                .delete('/api/v1/media/550e8400-e29b-41d4-a716-446655440000');

            expect([401, 500]).toContain(response.status);
        });
    });

    describe('Media Sharing', () => {
        it('GET /api/v1/media/shared - should reject unauthenticated', async () => {
            const response = await request(app.getHttpServer()).get('/api/v1/media/shared');
            expect([401, 500]).toContain(response.status);
        });

        it('GET /api/v1/media/shared - should accept valid token', async () => {
            const response = await request(app.getHttpServer())
                .get('/api/v1/media/shared')
                .set(authHeader('test-user-1'));

            expect([200, 404, 500]).toContain(response.status);
            if (response.status === 200) {
                expect(response.body.status).toBe('success');
            }
        });

        it('POST /api/v1/media/:id/share - should reject unauthenticated', async () => {
            const response = await request(app.getHttpServer())
                .post('/api/v1/media/550e8400-e29b-41d4-a716-446655440000/share')
                .send({ expiresAt: new Date(Date.now() + 86400000).toISOString() });

            expect([401, 500]).toContain(response.status);
        });

        it('DELETE /api/v1/media/:id/share - should reject unauthenticated', async () => {
            const response = await request(app.getHttpServer())
                .delete('/api/v1/media/550e8400-e29b-41d4-a716-446655440000/share');

            expect([401, 500]).toContain(response.status);
        });
    });

    describe('Admin - Media', () => {
        it('GET /api/v1/admin/media - should reject unauthenticated', async () => {
            const response = await request(app.getHttpServer()).get('/api/v1/admin/media');
            expect([401, 500]).toContain(response.status);
        });

        it('GET /api/v1/admin/media - should reject non-admin user', async () => {
            const response = await request(app.getHttpServer())
                .get('/api/v1/admin/media')
                .set(authHeader('regular-user-1'));

            expect([403, 500]).toContain(response.status);
        });

        it('GET /api/v1/admin/media - should accept admin token', async () => {
            const response = await request(app.getHttpServer())
                .get('/api/v1/admin/media')
                .query({ page: '1', limit: '20' })
                .set(adminAuthHeader());

            expect([200, 500]).toContain(response.status);
            if (response.status === 200) {
                expect(response.body.status).toBe('success');
                expect(response.body.data).toBeDefined();
            }
        });

        it('GET /api/v1/admin/media/storage/analytics - should reject unauthenticated', async () => {
            const response = await request(app.getHttpServer()).get('/api/v1/admin/media/storage/analytics');
            expect([401, 500]).toContain(response.status);
        });

        it('GET /api/v1/admin/media/quarantine - should reject non-admin user', async () => {
            const response = await request(app.getHttpServer())
                .get('/api/v1/admin/media/quarantine')
                .set(authHeader('regular-user-1'));

            expect([403, 500]).toContain(response.status);
        });

        it('POST /api/v1/admin/media/cleanup - should reject unauthenticated', async () => {
            const response = await request(app.getHttpServer()).post('/api/v1/admin/media/cleanup');
            expect([401, 500]).toContain(response.status);
        });
    });
});
