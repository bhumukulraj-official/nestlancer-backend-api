import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { setupApp, teardownApp, getGlobalPrefix, getApp } from './setup';

const uniqueEmail = () =>
  `e2e-check-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`;

describe('Auth Service - Check Email (E2E)', () => {
  let app: INestApplication;
  const prefix = getGlobalPrefix();

  beforeAll(async () => {
    app = await setupApp();
  });

  afterAll(async () => {
    await teardownApp();
  });

  it('GET /check-email without email should return 400', async () => {
    const res = await request(getApp().getHttpServer())
      .get(`/${prefix}/check-email`)
      .query({ turnstileToken: 'test-token' })
      .set('Accept', 'application/json');

    expect(res.status).toBe(400);
  });

  it('GET /check-email with a new email should indicate it is available', async () => {
    const email = uniqueEmail();
    const res = await request(getApp().getHttpServer())
      .get(`/${prefix}/check-email`)
      .query({
        email,
        turnstileToken: 'test-token',
      })
      .set('Accept', 'application/json');

    expect(res.status).toBe(200);
    expect(res.body?.data?.valid).toBe(true);
  });
});
