import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { setupApp, teardownApp, getGlobalPrefix, getApp } from './setup';

describe('Auth Service - Token Refresh (E2E)', () => {
  let app: INestApplication;
  const prefix = getGlobalPrefix();

  beforeAll(async () => {
    app = await setupApp();
  });

  afterAll(async () => {
    await teardownApp();
  });

  it('POST /refresh with invalid token returns 4xx', async () => {
    const res = await request(getApp().getHttpServer())
      .post(`/${prefix}/refresh`)
      .send({ refreshToken: 'invalid-refresh-token' })
      .set('Accept', 'application/json');

    expect([400, 401, 422]).toContain(res.status);
  });
});
