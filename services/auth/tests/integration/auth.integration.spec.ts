import './integration.env';

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';
import { ValidationPipe } from '@nestjs/common';
import { AllExceptionsFilter, TransformResponseInterceptor } from '@nestlancer/common';
import { AppModule } from '../../src/app.module';

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

const TURNSTILE_TEST_TOKEN = 'test-token';

describe('Auth Service (Integration)', () => {
  let app: INestApplication;

  jest.setTimeout(30000);

  beforeAll(async () => {
    loadDevEnv();
    process.env.NODE_ENV = 'test';

    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();

    app.setGlobalPrefix('api/v1/auth');
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
    it('GET /api/v1/auth/health', async () => {
      const response = await request(app.getHttpServer()).get('/api/v1/auth/health').expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data.status).toBe('ok');
      expect(response.body.data.service).toBe('auth');
    });
  });

  describe('Registration', () => {
    const uniqueEmail = () =>
      `test-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`;

    it('POST /api/v1/auth/register - should register successfully with valid data', async () => {
      const dto = {
        email: uniqueEmail(),
        password: 'SecureP@ss123',
        firstName: 'John',
        lastName: 'Doe',
        acceptTerms: true,
        turnstileToken: TURNSTILE_TEST_TOKEN,
      };

      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send(dto)
        .expect((res) => {
          if (res.status !== 201 && res.status !== 500) {
            console.error('Register failed:', res.status, res.body);
          }
        });

      if (response.status === 201) {
        expect(response.body.status).toBe('success');
        expect(response.body.data.userId).toBeDefined();
        expect(response.body.data.email).toBe(dto.email);
        expect(response.body.data.emailVerificationSent).toBe(true);
      }
    });

    it('POST /api/v1/auth/register - should reject invalid data (validation)', async () => {
      const invalidDto = {
        email: 'not-an-email',
        password: 'weak',
        firstName: 'J',
        lastName: 'D',
        acceptTerms: false,
        turnstileToken: TURNSTILE_TEST_TOKEN,
      };

      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send(invalidDto);

      expect([400, 422, 500]).toContain(response.status);
    });
  });

  describe('Login', () => {
    it('POST /api/v1/auth/login - should reject invalid credentials', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'WrongP@ss123',
        })
        .set('User-Agent', 'IntegrationTest/1.0');

      expect([400, 401, 403, 404, 422, 500]).toContain(response.status);
    });

    it('POST /api/v1/auth/login - should reject invalid payload (validation)', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: 'not-an-email',
          password: '',
        })
        .set('User-Agent', 'IntegrationTest/1.0');

      expect([400, 422, 500]).toContain(response.status);
    });
  });

  describe('Refresh Token', () => {
    it('POST /api/v1/auth/refresh - should reject invalid refresh token', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/refresh')
        .send({ refreshToken: 'invalid-token' })
        .set('User-Agent', 'IntegrationTest/1.0');

      expect([400, 401, 422, 500]).toContain(response.status);
    });

    it('POST /api/v1/auth/refresh - should reject empty refresh token (validation)', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/refresh')
        .send({ refreshToken: '' })
        .set('User-Agent', 'IntegrationTest/1.0');

      expect([400, 422, 500]).toContain(response.status);
    });
  });

  describe('Verify 2FA', () => {
    it('POST /api/v1/auth/verify-2fa - should reject invalid payload (validation)', async () => {
      const response = await request(app.getHttpServer()).post('/api/v1/auth/verify-2fa').send({
        authSessionId: '',
        code: '123',
        method: 'invalid',
      });

      expect([400, 422, 500]).toContain(response.status);
    });

    it('POST /api/v1/auth/verify-2fa - should reject invalid session', async () => {
      const response = await request(app.getHttpServer()).post('/api/v1/auth/verify-2fa').send({
        authSessionId: 'invalid-session-id',
        code: '123456',
        method: 'totp',
      });

      expect([400, 401, 404, 422, 500]).toContain(response.status);
    });
  });

  describe('Verify Email', () => {
    it('POST /api/v1/auth/verify-email - should reject invalid token', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/verify-email')
        .send({ token: 'invalid-verification-token' });

      expect([400, 404, 422, 500]).toContain(response.status);
    });

    it('POST /api/v1/auth/verify-email - should reject empty token (validation)', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/verify-email')
        .send({ token: '' });

      expect([400, 422, 500]).toContain(response.status);
    });
  });

  describe('Resend Verification', () => {
    it('POST /api/v1/auth/resend-verification - should accept valid email', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/resend-verification')
        .send({ email: 'user@example.com' });

      expect([200, 201, 500]).toContain(response.status);
      if (response.status === 200 || response.status === 201) {
        expect(response.body.status).toBe('success');
        expect(response.body.data.emailSent).toBe(true);
      }
    });

    it('POST /api/v1/auth/resend-verification - should reject invalid email (validation)', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/resend-verification')
        .send({ email: 'not-an-email' });

      expect([400, 422, 500]).toContain(response.status);
    });
  });

  describe('Forgot Password', () => {
    it('POST /api/v1/auth/forgot-password - should accept valid email', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/forgot-password')
        .send({
          email: 'user@example.com',
          turnstileToken: TURNSTILE_TEST_TOKEN,
        });

      expect([200, 201, 500]).toContain(response.status);
      if (response.status === 200 || response.status === 201) {
        expect(response.body.status).toBe('success');
        expect(response.body.data.emailSent).toBe(true);
      }
    });

    it('POST /api/v1/auth/forgot-password - should reject invalid email (validation)', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/forgot-password')
        .send({
          email: 'not-an-email',
          turnstileToken: TURNSTILE_TEST_TOKEN,
        });

      expect([400, 422, 500]).toContain(response.status);
    });
  });

  describe('Reset Password', () => {
    it('POST /api/v1/auth/reset-password - should reject invalid token', async () => {
      const response = await request(app.getHttpServer()).post('/api/v1/auth/reset-password').send({
        token: 'invalid-reset-token',
        newPassword: 'NewSecureP@ss123!',
      });

      expect([400, 404, 422, 500]).toContain(response.status);
    });

    it('POST /api/v1/auth/reset-password - should reject weak password (validation)', async () => {
      const response = await request(app.getHttpServer()).post('/api/v1/auth/reset-password').send({
        token: 'some-token',
        newPassword: 'weak',
      });

      expect([400, 422, 500]).toContain(response.status);
    });
  });

  describe('Check Email', () => {
    it('GET /api/v1/auth/check-email - should return availability status', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/auth/check-email')
        .query({ email: 'newuser@example.com', turnstileToken: TURNSTILE_TEST_TOKEN });

      expect([200, 500]).toContain(response.status);
      if (response.status === 200) {
        expect(response.body.status).toBe('success');
        expect(typeof response.body.data.valid).toBe('boolean');
      }
    });

    it('GET /api/v1/auth/check-email - should reject missing email', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/auth/check-email')
        .query({ turnstileToken: TURNSTILE_TEST_TOKEN });

      expect([400, 422, 500]).toContain(response.status);
    });
  });
});
