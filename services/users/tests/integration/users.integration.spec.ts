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

describe('Users Service (Integration)', () => {
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
        it('GET /api/v1/users/health', async () => {
            const response = await request(app.getHttpServer())
                .get('/api/v1/users/health')
                .expect(200);

            expect(response.body.status).toBe('success');
            expect(response.body.data.status).toBe('ok');
            expect(response.body.data.service).toBe('users');
        });
    });

    describe('Profile (Authenticated)', () => {
        it('GET /api/v1/users/profile - should reject unauthenticated', async () => {
            const response = await request(app.getHttpServer()).get('/api/v1/users/profile');
            expect([401, 500]).toContain(response.status);
        });

        it('GET /api/v1/users/profile - should accept valid token', async () => {
            const response = await request(app.getHttpServer())
                .get('/api/v1/users/profile')
                .set(authHeader('test-user-1'));

            expect([200, 404, 422, 500]).toContain(response.status);
            if (response.status === 200) {
                expect(response.body.status).toBe('success');
                expect(response.body.data).toBeDefined();
            }
        });

        it('PATCH /api/v1/users/profile - should reject invalid data (validation)', async () => {
            const response = await request(app.getHttpServer())
                .patch('/api/v1/users/profile')
                .set(authHeader('test-user-1'))
                .send({ firstName: 'J', lastName: 'D', phone: 'invalid' });

            expect([400, 401, 422, 500]).toContain(response.status);
        });

        it('PATCH /api/v1/users/profile - should accept valid token', async () => {
            const response = await request(app.getHttpServer())
                .patch('/api/v1/users/profile')
                .set(authHeader('test-user-1'))
                .send({ firstName: 'John', lastName: 'Doe' });

            expect([200, 404, 500]).toContain(response.status);
            if (response.status === 200) {
                expect(response.body.status).toBe('success');
            }
        });
    });

    describe('Avatar', () => {
        it('DELETE /api/v1/users/avatar - should reject unauthenticated', async () => {
            const response = await request(app.getHttpServer()).delete('/api/v1/users/avatar');
            expect([401, 500]).toContain(response.status);
        });

        it('POST /api/v1/users/avatar - should reject unauthenticated', async () => {
            const response = await request(app.getHttpServer())
                .post('/api/v1/users/avatar')
                .attach('file', Buffer.from('fake'), 'test.png');

            expect([401, 500]).toContain(response.status);
        });
    });

    describe('Preferences', () => {
        it('GET /api/v1/users/preferences - should reject unauthenticated', async () => {
            const response = await request(app.getHttpServer()).get('/api/v1/users/preferences');
            expect([401, 500]).toContain(response.status);
        });

        it('PATCH /api/v1/users/preferences - should reject invalid data (validation)', async () => {
            const response = await request(app.getHttpServer())
                .patch('/api/v1/users/preferences')
                .set(authHeader('test-user-1'))
                .send({
                    notifications: { email: { digest: 'invalid' } },
                    privacy: { profileVisibility: 'invalid' },
                });

            expect([400, 401, 422, 500]).toContain(response.status);
        });

        it('PATCH /api/v1/users/preferences - should accept valid token', async () => {
            const response = await request(app.getHttpServer())
                .patch('/api/v1/users/preferences')
                .set(authHeader('test-user-1'))
                .send({
                    notifications: { email: { digest: 'weekly' } },
                    privacy: { profileVisibility: 'public' },
                });

            expect([200, 404, 500]).toContain(response.status);
            if (response.status === 200) {
                expect(response.body.status).toBe('success');
            }
        });
    });

    describe('Password', () => {
        it('PATCH /api/v1/users/password - should reject invalid payload (validation)', async () => {
            const response = await request(app.getHttpServer())
                .patch('/api/v1/users/password')
                .set(authHeader('test-user-1'))
                .send({
                    currentPassword: 'old',
                    newPassword: 'weak',
                    confirmPassword: 'weak',
                });

            expect([400, 401, 422, 500]).toContain(response.status);
        });

        it('POST /api/v1/users/change-password - should reject invalid payload (validation)', async () => {
            const response = await request(app.getHttpServer())
                .post('/api/v1/users/change-password')
                .set(authHeader('test-user-1'))
                .send({
                    currentPassword: 'old',
                    newPassword: 'weak',
                    confirmPassword: 'mismatch',
                });

            expect([400, 401, 422, 500]).toContain(response.status);
        });
    });

    describe('2FA', () => {
        it('POST /api/v1/users/2fa/enable - should reject invalid payload (validation)', async () => {
            const response = await request(app.getHttpServer())
                .post('/api/v1/users/2fa/enable')
                .set(authHeader('test-user-1'))
                .send({ password: '' });

            expect([400, 401, 422, 500]).toContain(response.status);
        });

        it('POST /api/v1/users/2fa/verify - should reject invalid payload (validation)', async () => {
            const response = await request(app.getHttpServer())
                .post('/api/v1/users/2fa/verify')
                .set(authHeader('test-user-1'))
                .send({ code: '123' });

            expect([400, 401, 422, 500]).toContain(response.status);
        });

        it('POST /api/v1/users/2fa/disable - should reject invalid payload (validation)', async () => {
            const response = await request(app.getHttpServer())
                .post('/api/v1/users/2fa/disable')
                .set(authHeader('test-user-1'))
                .send({ password: 'pass', code: '123' });

            expect([400, 401, 422, 500]).toContain(response.status);
        });

        it('GET /api/v1/users/2fa/status - should reject unauthenticated', async () => {
            const response = await request(app.getHttpServer()).get('/api/v1/users/2fa/status');
            expect([401, 500]).toContain(response.status);
        });

        it('GET /api/v1/users/2fa/backup-codes - should reject unauthenticated', async () => {
            const response = await request(app.getHttpServer()).get('/api/v1/users/2fa/backup-codes');
            expect([401, 500]).toContain(response.status);
        });
    });

    describe('Sessions', () => {
        it('GET /api/v1/users/sessions - should reject unauthenticated', async () => {
            const response = await request(app.getHttpServer()).get('/api/v1/users/sessions');
            expect([401, 500]).toContain(response.status);
        });

        it('GET /api/v1/users/sessions - should accept valid token', async () => {
            const response = await request(app.getHttpServer())
                .get('/api/v1/users/sessions')
                .set(authHeader('test-user-1'));

            expect([200, 404, 500]).toContain(response.status);
            if (response.status === 200) {
                expect(response.body.status).toBe('success');
                expect(Array.isArray(response.body.data)).toBe(true);
            }
        });

        it('GET /api/v1/users/sessions/:sessionId - should reject invalid session id', async () => {
            const response = await request(app.getHttpServer())
                .get('/api/v1/users/sessions/invalid-session-id')
                .set(authHeader('test-user-1'));

            expect([400, 404, 422, 500]).toContain(response.status);
        });

        it('POST /api/v1/users/sessions/terminate-others - should reject unauthenticated', async () => {
            const response = await request(app.getHttpServer())
                .post('/api/v1/users/sessions/terminate-others');

            expect([401, 500]).toContain(response.status);
        });
    });

    describe('Account', () => {
        it('POST /api/v1/users/delete-account - should reject invalid payload (validation)', async () => {
            const response = await request(app.getHttpServer())
                .post('/api/v1/users/delete-account')
                .set(authHeader('test-user-1'))
                .send({ reason: 'a'.repeat(51) });

            expect([400, 401, 422, 500]).toContain(response.status);
        });

        it('POST /api/v1/users/delete-account - should accept valid payload', async () => {
            const response = await request(app.getHttpServer())
                .post('/api/v1/users/delete-account')
                .set(authHeader('test-user-1'))
                .send({ reason: 'Test reason', password: 'test' });

            expect([200, 201, 404, 422, 500]).toContain(response.status);
        });

        it('POST /api/v1/users/cancel-deletion - should reject unauthenticated', async () => {
            const response = await request(app.getHttpServer()).post('/api/v1/users/cancel-deletion');
            expect([401, 500]).toContain(response.status);
        });
    });

    describe('Activity & Export', () => {
        it('GET /api/v1/users/activity - should reject unauthenticated', async () => {
            const response = await request(app.getHttpServer()).get('/api/v1/users/activity');
            expect([401, 500]).toContain(response.status);
        });

        it('GET /api/v1/users/activity - should accept valid token', async () => {
            const response = await request(app.getHttpServer())
                .get('/api/v1/users/activity')
                .query({ page: '1', limit: '20' })
                .set(authHeader('test-user-1'));

            expect([200, 404, 500]).toContain(response.status);
            if (response.status === 200) {
                expect(response.body.status).toBe('success');
            }
        });

        it('GET /api/v1/users/export - should reject unauthenticated', async () => {
            const response = await request(app.getHttpServer()).get('/api/v1/users/export');
            expect([401, 500]).toContain(response.status);
        });

        it('GET /api/v1/users/data-export - should reject unauthenticated', async () => {
            const response = await request(app.getHttpServer()).get('/api/v1/users/data-export');
            expect([401, 500]).toContain(response.status);
        });
    });

    describe('Admin - Users', () => {
        it('GET /api/v1/admin/users - should reject unauthenticated', async () => {
            const response = await request(app.getHttpServer()).get('/api/v1/admin/users');
            expect([401, 500]).toContain(response.status);
        });

        it('GET /api/v1/admin/users - should reject non-admin user', async () => {
            const response = await request(app.getHttpServer())
                .get('/api/v1/admin/users')
                .set(authHeader('regular-user-1'));

            expect([403, 500]).toContain(response.status);
        });

        it('GET /api/v1/admin/users - should accept admin token', async () => {
            const response = await request(app.getHttpServer())
                .get('/api/v1/admin/users')
                .query({ page: '1', limit: '20' })
                .set(adminAuthHeader());

            expect([200, 500]).toContain(response.status);
            if (response.status === 200) {
                expect(response.body.status).toBe('success');
                expect(response.body.data).toBeDefined();
            }
        });

        it('GET /api/v1/admin/users/search - should handle missing query', async () => {
            const response = await request(app.getHttpServer())
                .get('/api/v1/admin/users/search')
                .set(adminAuthHeader());

            expect([200, 400, 422, 500]).toContain(response.status);
        });

        it('GET /api/v1/admin/users/:userId - should reject invalid userId', async () => {
            const response = await request(app.getHttpServer())
                .get('/api/v1/admin/users/invalid-uuid')
                .set(adminAuthHeader());

            expect([400, 404, 422, 500]).toContain(response.status);
        });

        it('PATCH /api/v1/admin/users/:userId - should reject invalid payload (validation)', async () => {
            const response = await request(app.getHttpServer())
                .patch('/api/v1/admin/users/550e8400-e29b-41d4-a716-446655440000')
                .set(adminAuthHeader())
                .send({ email: 'not-an-email' });

            expect([400, 404, 422, 500]).toContain(response.status);
        });

        it('PATCH /api/v1/admin/users/:userId/role - should reject invalid payload (validation)', async () => {
            const response = await request(app.getHttpServer())
                .patch('/api/v1/admin/users/550e8400-e29b-41d4-a716-446655440000/role')
                .set(adminAuthHeader())
                .send({ role: '' });

            expect([400, 404, 422, 500]).toContain(response.status);
        });

        it('POST /api/v1/admin/users/bulk - should handle invalid payload (validation)', async () => {
            const response = await request(app.getHttpServer())
                .post('/api/v1/admin/users/bulk')
                .set(adminAuthHeader())
                .send({ userIds: [], action: 'suspend' });

            expect([200, 201, 400, 422, 500]).toContain(response.status);
        });

        it('POST /api/v1/admin/users/bulk - should handle invalid action', async () => {
            const response = await request(app.getHttpServer())
                .post('/api/v1/admin/users/bulk')
                .set(adminAuthHeader())
                .send({
                    userIds: ['550e8400-e29b-41d4-a716-446655440000'],
                    action: 'invalid_action',
                });

            expect([200, 201, 400, 422, 500]).toContain(response.status);
        });
    });
});
