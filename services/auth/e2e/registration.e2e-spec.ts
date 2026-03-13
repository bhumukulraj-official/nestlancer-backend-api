import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { setupApp, teardownApp, getGlobalPrefix, getApp } from './setup';

const uniqueEmail = () =>
  `e2e-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`;

describe('Auth Service - Registration (E2E)', () => {
  let app: INestApplication;
  const prefix = getGlobalPrefix();
  let registeredEmail: string;

  beforeAll(async () => {
    app = await setupApp();
  });

  afterAll(async () => {
    await teardownApp();
  });

  it('should register a new user successfully', async () => {
    registeredEmail = uniqueEmail();
    const res = await request(getApp().getHttpServer())
      .post(`/${prefix}/register`)
      .send({
        email: registeredEmail,
        password: 'StrongP@ssw0rd!',
        firstName: 'Jane',
        lastName: 'Doe',
        acceptTerms: true,
        turnstileToken: 'test-token',
      })
      .set('Accept', 'application/json');

    expect(res.status).toBe(201);
    expect(res.body?.data?.userId).toBeDefined();
    expect(res.body?.data?.emailVerificationSent).toBe(true);
  });

  it('should reject duplicate email with 409', async () => {
    const res = await request(getApp().getHttpServer())
      .post(`/${prefix}/register`)
      .send({
        email: registeredEmail,
        password: 'AnotherP@ss1!',
        firstName: 'John',
        lastName: 'Doe',
        acceptTerms: true,
        turnstileToken: 'test-token',
      })
      .set('Accept', 'application/json');
    expect(res.status).toBe(409);
  });

  it('should reject weak passwords with 400', async () => {
    const res = await request(getApp().getHttpServer())
      .post(`/${prefix}/register`)
      .send({
        email: uniqueEmail(),
        password: '123',
        firstName: 'Weak',
        lastName: 'Password',
        acceptTerms: true,
        turnstileToken: 'test-token',
      })
      .set('Accept', 'application/json');
    expect(res.status).toBe(400);
  });
});
