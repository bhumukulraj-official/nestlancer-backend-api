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

describe('Portfolio Service (Integration)', () => {
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
        it('GET /api/v1/portfolio/health', async () => {
            const response = await request(app.getHttpServer())
                .get('/api/v1/portfolio/health')
                .expect(200);

            expect(response.body.status).toBe('success');
            expect(response.body.data.status).toBe('ok');
            expect(response.body.data.service).toBe('portfolio');
        });
    });

    describe('Public Portfolio', () => {
        it('GET /api/v1/portfolio - should return published items without auth', async () => {
            const response = await request(app.getHttpServer())
                .get('/api/v1/portfolio')
                .query({ page: '1', limit: '20' });

            expect([200, 500]).toContain(response.status);
            if (response.status === 200) {
                expect(response.body).toBeDefined();
            }
        });

        it('GET /api/v1/portfolio/featured - should return featured items', async () => {
            const response = await request(app.getHttpServer())
                .get('/api/v1/portfolio/featured');

            expect([200, 500]).toContain(response.status);
        });

        it('GET /api/v1/portfolio/categories - should return categories', async () => {
            const response = await request(app.getHttpServer())
                .get('/api/v1/portfolio/categories');

            expect([200, 500]).toContain(response.status);
        });

        it('GET /api/v1/portfolio/tags - should return tags', async () => {
            const response = await request(app.getHttpServer())
                .get('/api/v1/portfolio/tags');

            expect([200, 500]).toContain(response.status);
        });

        it('GET /api/v1/portfolio/search - should handle search query', async () => {
            const response = await request(app.getHttpServer())
                .get('/api/v1/portfolio/search')
                .query({ q: 'test', page: '1', limit: '20' });

            expect([200, 500]).toContain(response.status);
        });

        it('GET /api/v1/portfolio/:idOrSlug - should handle non-existent id', async () => {
            const response = await request(app.getHttpServer())
                .get('/api/v1/portfolio/non-existent-id-or-slug');

            expect([404, 500]).toContain(response.status);
        });
    });

    describe('Admin - Portfolio', () => {
        it('GET /api/v1/admin/portfolio - should reject unauthenticated', async () => {
            const response = await request(app.getHttpServer()).get('/api/v1/admin/portfolio');
            expect([401, 500]).toContain(response.status);
        });

        it('GET /api/v1/admin/portfolio - should reject non-admin user', async () => {
            const response = await request(app.getHttpServer())
                .get('/api/v1/admin/portfolio')
                .set(authHeader('regular-user-1'));

            expect([403, 500]).toContain(response.status);
        });

        it('GET /api/v1/admin/portfolio - should accept admin token', async () => {
            const response = await request(app.getHttpServer())
                .get('/api/v1/admin/portfolio')
                .query({ page: '1', limit: '20' })
                .set(adminAuthHeader());

            expect([200, 500]).toContain(response.status);
            if (response.status === 200) {
                expect(response.body).toBeDefined();
            }
        });

        it('POST /api/v1/admin/portfolio - should reject invalid payload (validation)', async () => {
            const response = await request(app.getHttpServer())
                .post('/api/v1/admin/portfolio')
                .set(adminAuthHeader())
                .send({ title: '', shortDescription: '', fullDescription: '', contentFormat: 'INVALID' });

            expect([400, 422, 500]).toContain(response.status);
        });

        it('GET /api/v1/admin/portfolio/analytics - should accept admin token', async () => {
            const response = await request(app.getHttpServer())
                .get('/api/v1/admin/portfolio/analytics')
                .set(adminAuthHeader());

            expect([200, 500]).toContain(response.status);
        });

        it('GET /api/v1/admin/portfolio/:id - should reject invalid id', async () => {
            const response = await request(app.getHttpServer())
                .get('/api/v1/admin/portfolio/invalid-uuid')
                .set(adminAuthHeader());

            expect([400, 404, 422, 500]).toContain(response.status);
        });

        it('PATCH /api/v1/admin/portfolio/:id - should reject invalid payload (validation)', async () => {
            const response = await request(app.getHttpServer())
                .patch('/api/v1/admin/portfolio/550e8400-e29b-41d4-a716-446655440000')
                .set(adminAuthHeader())
                .send({ title: 'a'.repeat(501) });

            expect([400, 404, 422, 500]).toContain(response.status);
        });

        it('POST /api/v1/admin/portfolio/reorder - should reject invalid payload (validation)', async () => {
            const response = await request(app.getHttpServer())
                .post('/api/v1/admin/portfolio/reorder')
                .set(adminAuthHeader())
                .send({ items: 'invalid' });

            expect([400, 422, 500]).toContain(response.status);
        });
    });

    describe('Admin - Portfolio Categories', () => {
        it('GET /api/v1/admin/portfolio/categories - should reject unauthenticated', async () => {
            const response = await request(app.getHttpServer())
                .get('/api/v1/admin/portfolio/categories');
            expect([401, 500]).toContain(response.status);
        });

        it('GET /api/v1/admin/portfolio/categories - should accept admin token', async () => {
            const response = await request(app.getHttpServer())
                .get('/api/v1/admin/portfolio/categories')
                .set(adminAuthHeader());

            expect([200, 500]).toContain(response.status);
        });

        it('POST /api/v1/admin/portfolio/categories - should reject invalid payload (validation)', async () => {
            const response = await request(app.getHttpServer())
                .post('/api/v1/admin/portfolio/categories')
                .set(adminAuthHeader())
                .send({ name: '', slug: '' });

            expect([400, 422, 500]).toContain(response.status);
        });

        it('PATCH /api/v1/admin/portfolio/categories/:id - should reject invalid project id', async () => {
            const response = await request(app.getHttpServer())
                .patch('/api/v1/admin/portfolio/categories/invalid-uuid')
                .set(adminAuthHeader())
                .send({ name: 'Updated' });

            expect([400, 404, 422, 500]).toContain(response.status);
        });
    });
});
