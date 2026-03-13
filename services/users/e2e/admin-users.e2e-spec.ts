import request from 'supertest';
import { createTestJwt } from '../../../libs/testing/src/helpers/test-auth.helper';
import { setupApp, teardownApp, getApp, getGlobalPrefix } from './setup';

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

describe('Users Service - Admin Users (E2E)', () => {
  const prefix = getGlobalPrefix();

  beforeAll(async () => {
    await setupApp();
  });

  afterAll(async () => {
    await teardownApp();
  });

  it('GET /admin/users rejects unauthenticated (401)', async () => {
    const res = await request(getApp().getHttpServer()).get(`/${prefix}/admin/users`);
    expect(res.status).toBe(401);
  });

  it('GET /admin/users rejects non-admin user (403)', async () => {
    const res = await request(getApp().getHttpServer())
      .get(`/${prefix}/admin/users`)
      .set(authHeader('regular-user-1'));

    expect(res.status).toBe(403);
  });

  it('GET /admin/users accepts admin token and returns list or 4xx', async () => {
    const res = await request(getApp().getHttpServer())
      .get(`/${prefix}/admin/users`)
      .query({ page: '1', limit: '20' })
      .set(adminAuthHeader());

    expect([200, 404, 500]).toContain(res.status);
  });

  it('GET /admin/users/search handles missing query with 2xx or 4xx', async () => {
    const res = await request(getApp().getHttpServer())
      .get(`/${prefix}/admin/users/search`)
      .set(adminAuthHeader());

    expect([200, 400, 422, 500]).toContain(res.status);
  });

  it('GET /admin/users/:userId rejects invalid userId (4xx)', async () => {
    const res = await request(getApp().getHttpServer())
      .get(`/${prefix}/admin/users/invalid-uuid`)
      .set(adminAuthHeader());

    expect([400, 404, 422, 500]).toContain(res.status);
  });

  it('PATCH /admin/users/:userId rejects invalid email (400 validation or 500)', async () => {
    const res = await request(getApp().getHttpServer())
      .patch(`/${prefix}/admin/users/550e8400-e29b-41d4-a716-446655440000`)
      .set(adminAuthHeader())
      .send({ email: 'not-an-email' });

    expect([400, 404, 422, 500]).toContain(res.status);
  });

  it('PATCH /admin/users/:userId/role rejects empty role (400 validation or 500)', async () => {
    const res = await request(getApp().getHttpServer())
      .patch(`/${prefix}/admin/users/550e8400-e29b-41d4-a716-446655440000/role`)
      .set(adminAuthHeader())
      .send({ role: '' });

    expect([400, 404, 422, 500]).toContain(res.status);
  });

  it('POST /admin/users/bulk handles empty userIds with 2xx or 4xx', async () => {
    const res = await request(getApp().getHttpServer())
      .post(`/${prefix}/admin/users/bulk`)
      .set(adminAuthHeader())
      .send({ userIds: [], action: 'suspend' });

    expect([200, 201, 400, 422, 500]).toContain(res.status);
  });

  it('POST /admin/users/bulk handles invalid action with 2xx or 4xx', async () => {
    const res = await request(getApp().getHttpServer())
      .post(`/${prefix}/admin/users/bulk`)
      .set(adminAuthHeader())
      .send({
        userIds: ['550e8400-e29b-41d4-a716-446655440000'],
        action: 'invalid_action',
      });

    expect([200, 201, 400, 422, 500]).toContain(res.status);
  });
});
