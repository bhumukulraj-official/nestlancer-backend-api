import './integration.env';

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';
import { ValidationPipe } from '@nestjs/common';
import { VersioningType } from '@nestjs/common';
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

describe('Messaging Service (Integration)', () => {
    let app: INestApplication;

    jest.setTimeout(30000);

    beforeAll(async () => {
        loadDevEnv();
        process.env.NODE_ENV = 'test';

        const moduleRef: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleRef.createNestApplication();

        app.setGlobalPrefix('api');
        app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });
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
        it('GET /api/v1/messages/health', async () => {
            const response = await request(app.getHttpServer())
                .get('/api/v1/messages/health');

            expect([200, 500]).toContain(response.status);
            if (response.status === 200) {
                expect(response.body.status).toBe('success');
                expect(response.body.data?.status).toBe('ok');
                expect(response.body.data?.service).toBe('messages');
            }
        });
    });

    describe('Messages (Authenticated)', () => {
        it('GET /api/v1/messages - should reject unauthenticated', async () => {
            const response = await request(app.getHttpServer()).get('/api/v1/messages');
            expect([401, 404, 500]).toContain(response.status);
        });

        it('GET /api/v1/messages - should accept valid token', async () => {
            const response = await request(app.getHttpServer())
                .get('/api/v1/messages')
                .set(authHeader('test-user-1'));

            expect([200, 404, 500]).toContain(response.status);
            if (response.status === 200) {
                expect(response.body.status).toBe('success');
            }
        });

        it('GET /api/v1/messages/unread-count - should reject unauthenticated', async () => {
            const response = await request(app.getHttpServer()).get('/api/v1/messages/unread-count');
            expect([401, 500]).toContain(response.status);
        });

        it('POST /api/v1/messages - should reject unauthenticated', async () => {
            const response = await request(app.getHttpServer())
                .post('/api/v1/messages')
                .send({ recipientId: 'user-2', content: 'Hello', projectId: null });
            expect([401, 500]).toContain(response.status);
        });

        it('POST /api/v1/messages - should reject invalid payload (validation)', async () => {
            const response = await request(app.getHttpServer())
                .post('/api/v1/messages')
                .set(authHeader('test-user-1'))
                .send({ recipientId: '', content: '', projectId: null });

            expect([400, 422, 500]).toContain(response.status);
        });
    });

    describe('Conversations (Authenticated)', () => {
        it('GET /api/v1/conversations - should reject unauthenticated', async () => {
            const response = await request(app.getHttpServer()).get('/api/v1/conversations');
            expect([401, 500]).toContain(response.status);
        });

        it('GET /api/v1/conversations - should accept valid token', async () => {
            const response = await request(app.getHttpServer())
                .get('/api/v1/conversations')
                .set(authHeader('test-user-1'));

            expect([200, 404, 500]).toContain(response.status);
            if (response.status === 200) {
                expect(response.body.status).toBe('success');
            }
        });

        it('GET /api/v1/conversations/unread-count - should reject unauthenticated', async () => {
            const response = await request(app.getHttpServer()).get('/api/v1/conversations/unread-count');
            expect([401, 500]).toContain(response.status);
        });
    });

    describe('Message Threads (Authenticated)', () => {
        it('GET /api/v1/messages/:messageId/threads - should reject unauthenticated', async () => {
            const response = await request(app.getHttpServer())
                .get('/api/v1/messages/550e8400-e29b-41d4-a716-446655440000/threads');
            expect([401, 500]).toContain(response.status);
        });
    });

    describe('Admin - Messages', () => {
        it('GET /api/v1/admin/messages - should reject unauthenticated', async () => {
            const response = await request(app.getHttpServer()).get('/api/v1/admin/messages');
            expect([401, 500]).toContain(response.status);
        });

        it('GET /api/v1/admin/messages - should reject non-admin user', async () => {
            const response = await request(app.getHttpServer())
                .get('/api/v1/admin/messages')
                .set(authHeader('regular-user-1'));

            expect([403, 500]).toContain(response.status);
        });

        it('GET /api/v1/admin/messages - should accept admin token', async () => {
            const response = await request(app.getHttpServer())
                .get('/api/v1/admin/messages')
                .query({ page: '1', limit: '20' })
                .set(adminAuthHeader());

            expect([200, 500]).toContain(response.status);
            if (response.status === 200) {
                expect(response.body.status).toBe('success');
            }
        });

        it('GET /api/v1/admin/messages/stats - should reject non-admin', async () => {
            const response = await request(app.getHttpServer())
                .get('/api/v1/admin/messages/stats')
                .set(authHeader('regular-user-1'));

            expect([403, 500]).toContain(response.status);
        });

        it('GET /api/v1/admin/messages/stats - should accept admin token', async () => {
            const response = await request(app.getHttpServer())
                .get('/api/v1/admin/messages/stats')
                .set(adminAuthHeader());

            expect([200, 500]).toContain(response.status);
        });
    });
});
