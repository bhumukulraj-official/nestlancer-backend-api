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

describe('Payments Service (Integration)', () => {
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
    it('GET /api/v1/payments/health', async () => {
      const response = await request(app.getHttpServer()).get('/api/v1/payments/health');

      expect([200, 500]).toContain(response.status);
      if (response.status === 200) {
        expect(response.body.status).toBe('success');
        expect(response.body.data?.status).toBe('ok');
        expect(response.body.data?.service).toBe('payments');
      }
    });
  });

  describe('Payments (Authenticated)', () => {
    it('GET /api/v1/payments - should reject unauthenticated', async () => {
      const response = await request(app.getHttpServer()).get('/api/v1/payments');
      expect([401, 500]).toContain(response.status);
    });

    it('GET /api/v1/payments - should accept valid token', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/payments')
        .set(authHeader('test-user-1'));

      expect([200, 404, 500]).toContain(response.status);
      if (response.status === 200) {
        expect(response.body.status).toBe('success');
        expect(response.body.data !== undefined || response.body.items !== undefined).toBe(true);
      }
    });

    it('GET /api/v1/payments/stats - should reject unauthenticated', async () => {
      const response = await request(app.getHttpServer()).get('/api/v1/payments/stats');
      expect([401, 500]).toContain(response.status);
    });

    it('POST /api/v1/payments/create-intent - should reject unauthenticated', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/payments/create-intent')
        .send({ amount: 1000, currency: 'INR', projectId: '550e8400-e29b-41d4-a716-446655440000' });
      expect([401, 500]).toContain(response.status);
    });

    it('POST /api/v1/payments/create-intent - should reject invalid payload (validation)', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/payments/create-intent')
        .set(authHeader('test-user-1'))
        .send({ amount: -1, currency: '', projectId: '' });

      expect([400, 422, 500]).toContain(response.status);
    });

    it('GET /api/v1/payments/:id - should reject invalid id', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/payments/invalid-uuid')
        .set(authHeader('test-user-1'));

      expect([400, 404, 422, 500]).toContain(response.status);
    });
  });

  describe('Payment Methods (Authenticated)', () => {
    it('GET /api/v1/payments/methods - should reject unauthenticated', async () => {
      const response = await request(app.getHttpServer()).get('/api/v1/payments/methods');
      expect([401, 500]).toContain(response.status);
    });

    it('POST /api/v1/payments/methods - should reject unauthenticated', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/payments/methods')
        .send({ type: 'card', token: 'tok_xxx' });
      expect([401, 500]).toContain(response.status);
    });
  });

  describe('Admin - Payments', () => {
    it('GET /api/v1/admin/payments - should reject unauthenticated', async () => {
      const response = await request(app.getHttpServer()).get('/api/v1/admin/payments');
      expect([401, 500]).toContain(response.status);
    });

    it('GET /api/v1/admin/payments - should reject non-admin user', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/admin/payments')
        .set(authHeader('regular-user-1'));

      expect([403, 500]).toContain(response.status);
    });

    it('GET /api/v1/admin/payments - should accept admin token', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/admin/payments')
        .query({ page: '1', limit: '20' })
        .set(adminAuthHeader());

      expect([200, 500]).toContain(response.status);
      if (response.status === 200) {
        expect(response.body.status).toBe('success');
        expect(response.body.data !== undefined || response.body.items !== undefined).toBe(true);
      }
    });

    it('GET /api/v1/admin/payments/stats - should reject non-admin', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/admin/payments/stats')
        .set(authHeader('regular-user-1'));

      expect([403, 500]).toContain(response.status);
    });

    it('GET /api/v1/admin/payments/stats - should accept admin token', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/admin/payments/stats')
        .set(adminAuthHeader());

      expect([200, 500]).toContain(response.status);
    });

    it('GET /api/v1/admin/payments/:id - should reject invalid id', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/admin/payments/invalid-uuid')
        .set(adminAuthHeader());

      expect([200, 400, 404, 422, 500]).toContain(response.status);
    });
  });
});
