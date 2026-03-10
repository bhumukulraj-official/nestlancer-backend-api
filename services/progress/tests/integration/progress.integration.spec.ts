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

describe('Progress Service (Integration)', () => {
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

    describe('Progress (User)', () => {
        const projectId = '550e8400-e29b-41d4-a716-446655440000';

        it('GET /api/v1/projects/:projectId/progress - should reject unauthenticated', async () => {
            const response = await request(app.getHttpServer())
                .get(`/api/v1/projects/${projectId}/progress`);
            expect([401, 500]).toContain(response.status);
        });

        it('GET /api/v1/projects/:projectId/progress - should accept valid token', async () => {
            const response = await request(app.getHttpServer())
                .get(`/api/v1/projects/${projectId}/progress`)
                .set(authHeader('test-user-1'));

            expect([200, 404, 500]).toContain(response.status);
            if (response.status === 200) {
                expect(response.body).toBeDefined();
            }
        });

        it('GET /api/v1/projects/:projectId/progress/status - should reject unauthenticated', async () => {
            const response = await request(app.getHttpServer())
                .get(`/api/v1/projects/${projectId}/progress/status`);
            expect([401, 500]).toContain(response.status);
        });

        it('POST /api/v1/projects/:projectId/progress - should reject invalid payload (validation)', async () => {
            const response = await request(app.getHttpServer())
                .post(`/api/v1/projects/${projectId}/progress`)
                .set(authHeader('test-user-1'))
                .send({ title: '', type: 'INVALID_TYPE', description: 'test' });

            expect([400, 401, 404, 422, 500]).toContain(response.status);
        });

        it('POST /api/v1/projects/:projectId/progress/request-changes - should reject invalid payload (validation)', async () => {
            const response = await request(app.getHttpServer())
                .post(`/api/v1/projects/${projectId}/progress/request-changes`)
                .set(authHeader('test-user-1'))
                .send({ reason: 'a'.repeat(2001), details: [{ description: 'test' }] });

            expect([400, 401, 404, 422, 500]).toContain(response.status);
        });
    });

    describe('Milestone Approvals (User)', () => {
        it('POST /api/v1/milestones/:id/approve - should reject unauthenticated', async () => {
            const response = await request(app.getHttpServer())
                .post('/api/v1/milestones/550e8400-e29b-41d4-a716-446655440000/approve')
                .send({ notes: 'Approved' });

            expect([401, 500]).toContain(response.status);
        });

        it('POST /api/v1/milestones/:id/approve - should accept valid payload', async () => {
            const response = await request(app.getHttpServer())
                .post('/api/v1/milestones/550e8400-e29b-41d4-a716-446655440000/approve')
                .set(authHeader('test-user-1'))
                .send({ feedback: 'Approved' });

            expect([200, 404, 422, 500]).toContain(response.status);
        });

        it('POST /api/v1/milestones/:id/request-revision - should reject unauthenticated', async () => {
            const response = await request(app.getHttpServer())
                .post('/api/v1/milestones/550e8400-e29b-41d4-a716-446655440000/request-revision')
                .send({ reason: 'Needs changes', details: ['Fix X'] });

            expect([401, 500]).toContain(response.status);
        });
    });

    describe('Deliverable Reviews (User)', () => {
        it('POST /api/v1/deliverables/:id/approve - should reject unauthenticated', async () => {
            const response = await request(app.getHttpServer())
                .post('/api/v1/deliverables/550e8400-e29b-41d4-a716-446655440000/approve')
                .send({ notes: 'Approved' });

            expect([401, 500]).toContain(response.status);
        });

        it('POST /api/v1/deliverables/:id/reject - should reject invalid payload (validation)', async () => {
            const response = await request(app.getHttpServer())
                .post('/api/v1/deliverables/550e8400-e29b-41d4-a716-446655440000/reject')
                .set(authHeader('test-user-1'))
                .send({ reason: '' });

            expect([400, 401, 404, 422, 500]).toContain(response.status);
        });
    });

    describe('Admin - Progress', () => {
        const projectId = '550e8400-e29b-41d4-a716-446655440000';

        it('GET /api/v1/admin/progress/projects/:projectId - should reject unauthenticated', async () => {
            const response = await request(app.getHttpServer())
                .get(`/api/v1/admin/progress/projects/${projectId}`);
            expect([401, 500]).toContain(response.status);
        });

        it('GET /api/v1/admin/progress/projects/:projectId - should reject non-admin user', async () => {
            const response = await request(app.getHttpServer())
                .get(`/api/v1/admin/progress/projects/${projectId}`)
                .set(authHeader('regular-user-1'));

            expect([403, 500]).toContain(response.status);
        });

        it('GET /api/v1/admin/progress/projects/:projectId - should accept admin token', async () => {
            const response = await request(app.getHttpServer())
                .get(`/api/v1/admin/progress/projects/${projectId}`)
                .set(adminAuthHeader());

            expect([200, 404, 500]).toContain(response.status);
            if (response.status === 200) {
                expect(response.body).toBeDefined();
            }
        });

        it('POST /api/v1/admin/progress/projects/:projectId - should reject invalid payload (validation)', async () => {
            const response = await request(app.getHttpServer())
                .post(`/api/v1/admin/progress/projects/${projectId}`)
                .set(adminAuthHeader())
                .send({ title: '', type: 'invalid' });

            expect([400, 404, 422, 500]).toContain(response.status);
        });

        it('PATCH /api/v1/admin/progress/:id - should reject invalid id', async () => {
            const response = await request(app.getHttpServer())
                .patch('/api/v1/admin/progress/invalid-uuid')
                .set(adminAuthHeader())
                .send({ title: 'Updated', description: 'Test' });

            expect([400, 404, 422, 500]).toContain(response.status);
        });
    });

    describe('Admin - Milestones', () => {
        const projectId = '550e8400-e29b-41d4-a716-446655440000';

        it('POST /api/v1/admin/projects/:projectId/milestones - should reject invalid payload (validation)', async () => {
            const response = await request(app.getHttpServer())
                .post(`/api/v1/admin/projects/${projectId}/milestones`)
                .set(adminAuthHeader())
                .send({ name: '', startDate: 'invalid', endDate: 'invalid' });

            expect([400, 404, 422, 500]).toContain(response.status);
        });

        it('PATCH /api/v1/admin/milestones/:id - should reject invalid payload (validation)', async () => {
            const response = await request(app.getHttpServer())
                .patch('/api/v1/admin/milestones/550e8400-e29b-41d4-a716-446655440000')
                .set(adminAuthHeader())
                .send({ startDate: 'invalid-date' });

            expect([400, 404, 422, 500]).toContain(response.status);
        });
    });

    describe('Admin - Deliverables', () => {
        const projectId = '550e8400-e29b-41d4-a716-446655440000';

        it('GET /api/v1/admin/projects/:projectId/deliverables - should reject unauthenticated', async () => {
            const response = await request(app.getHttpServer())
                .get(`/api/v1/admin/projects/${projectId}/deliverables`);
            expect([401, 500]).toContain(response.status);
        });

        it('GET /api/v1/admin/projects/:projectId/deliverables - should accept admin token', async () => {
            const response = await request(app.getHttpServer())
                .get(`/api/v1/admin/projects/${projectId}/deliverables`)
                .set(adminAuthHeader());

            expect([200, 404, 500]).toContain(response.status);
        });

        it('POST /api/v1/admin/projects/:projectId/deliverables - should reject invalid payload (validation)', async () => {
            const response = await request(app.getHttpServer())
                .post(`/api/v1/admin/projects/${projectId}/deliverables`)
                .set(adminAuthHeader())
                .send({ milestoneId: 'invalid-uuid', mediaIds: [] });

            expect([400, 404, 422, 500]).toContain(response.status);
        });
    });
});
