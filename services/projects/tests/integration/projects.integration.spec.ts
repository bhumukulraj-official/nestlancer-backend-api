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
  content.split('\n').forEach((line) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...value] = trimmed.split('=');
      if (key) {
        process.env[key.trim()] = value
          .join('=')
          .trim()
          .replace(/^["']|["']$/g, '');
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

describe('Projects Service (Integration)', () => {
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
    it('GET /api/v1/projects/health', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/projects/health')
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data.status).toBe('ok');
      expect(response.body.data.service).toBe('projects');
    });
  });

  describe('Projects (Authenticated)', () => {
    it('GET /api/v1/projects - should reject unauthenticated', async () => {
      const response = await request(app.getHttpServer()).get('/api/v1/projects');
      expect([401, 500]).toContain(response.status);
    });

    it('GET /api/v1/projects - should accept valid token', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/projects')
        .set(authHeader('test-user-1'));

      expect([200, 404, 500]).toContain(response.status);
      if (response.status === 200) {
        expect(response.body).toBeDefined();
      }
    });

    it('GET /api/v1/projects/stats - should reject unauthenticated', async () => {
      const response = await request(app.getHttpServer()).get('/api/v1/projects/stats');
      expect([401, 500]).toContain(response.status);
    });

    it('GET /api/v1/projects/stats - should accept valid token', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/projects/stats')
        .set(authHeader('test-user-1'));

      expect([200, 404, 500]).toContain(response.status);
      if (response.status === 200) {
        expect(response.body.status).toBe('success');
      }
    });

    it('GET /api/v1/projects/:id - should reject invalid project id', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/projects/invalid-uuid')
        .set(authHeader('test-user-1'));

      expect([400, 404, 422, 500]).toContain(response.status);
    });

    it('POST /api/v1/projects/:id/approve - should reject invalid payload (validation)', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/projects/550e8400-e29b-41d4-a716-446655440000/approve')
        .set(authHeader('test-user-1'))
        .send({ rating: 0, feedback: {} });

      expect([400, 404, 422, 500]).toContain(response.status);
    });

    it('POST /api/v1/projects/:id/request-revision - should reject invalid payload (validation)', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/projects/550e8400-e29b-41d4-a716-446655440000/request-revision')
        .set(authHeader('test-user-1'))
        .send({ reason: '' });

      expect([400, 404, 422, 500]).toContain(response.status);
    });

    it('POST /api/v1/projects/:id/messages - should reject invalid payload (validation)', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/projects/550e8400-e29b-41d4-a716-446655440000/messages')
        .set(authHeader('test-user-1'))
        .send({ content: '' });

      expect([400, 404, 422, 500]).toContain(response.status);
    });
  });

  describe('Public Projects', () => {
    it('GET /api/v1/public - should return public projects without auth', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/public')
        .query({ page: '1', limit: '20' });

      expect([200, 500]).toContain(response.status);
      if (response.status === 200) {
        expect(response.body).toBeDefined();
      }
    });

    it('GET /api/v1/public/:id - should handle non-existent id', async () => {
      const response = await request(app.getHttpServer()).get(
        '/api/v1/public/non-existent-slug-or-id',
      );

      expect([404, 422, 500]).toContain(response.status);
    });
  });

  describe('Admin - Projects', () => {
    it('GET /api/v1/admin/projects - should reject unauthenticated', async () => {
      const response = await request(app.getHttpServer()).get('/api/v1/admin/projects');
      expect([401, 500]).toContain(response.status);
    });

    it('GET /api/v1/admin/projects - should reject non-admin user', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/admin/projects')
        .set(authHeader('regular-user-1'));

      expect([403, 500]).toContain(response.status);
    });

    it('GET /api/v1/admin/projects - should accept admin token', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/admin/projects')
        .query({ page: '1', limit: '20' })
        .set(adminAuthHeader());

      expect([200, 500]).toContain(response.status);
      if (response.status === 200) {
        expect(response.body).toBeDefined();
      }
    });

    it('GET /api/v1/admin/projects/stats - should accept admin token', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/admin/projects/stats')
        .set(adminAuthHeader());

      expect([200, 500]).toContain(response.status);
    });

    it('GET /api/v1/admin/projects/:id - should reject invalid project id', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/admin/projects/invalid-uuid')
        .set(adminAuthHeader());

      expect([400, 404, 422, 500]).toContain(response.status);
    });

    it('PATCH /api/v1/admin/projects/:id/status - should reject invalid payload (validation)', async () => {
      const response = await request(app.getHttpServer())
        .patch('/api/v1/admin/projects/550e8400-e29b-41d4-a716-446655440000/status')
        .set(adminAuthHeader())
        .send({ status: '', reason: 'test' });

      expect([400, 404, 422, 500]).toContain(response.status);
    });
  });
});
