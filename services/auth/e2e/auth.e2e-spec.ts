import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { setupApp, teardownApp, getGlobalPrefix, getApp } from './setup';

describe('Auth Service - Auth (E2E)', () => {
  let app: INestApplication;
  const prefix = getGlobalPrefix();

  beforeAll(async () => {
    app = await setupApp();
  });

  afterAll(async () => {
    await teardownApp();
  });

  it('GET /health returns 200 with status ok', async () => {
    try {
      const res = await request(getApp().getHttpServer())
        .get(`/${prefix}/health`)
        .set('Accept', 'application/json');

      expect(res.status).toBe(200);
      expect(res.body?.data?.status).toBe('ok');
      expect(res.body?.data?.service).toBe('auth');
    } catch (err: any) {
      // eslint-disable-next-line no-console
      console.error('AUTH E2E /health error:', err, err?.errors);
      throw err;
    }
  });

  it('POST /login with invalid credentials returns 4xx', async () => {
    const res = await request(getApp().getHttpServer())
      .post(`/${prefix}/login`)
      .send({ email: 'nonexistent@example.com', password: 'wrong' })
      .set('Accept', 'application/json');

    expect([400, 401, 422]).toContain(res.status);
  });
});
