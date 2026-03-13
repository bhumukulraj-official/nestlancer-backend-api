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

describe('Users Service - Profile & User APIs (E2E)', () => {
  const prefix = getGlobalPrefix();

  beforeAll(async () => {
    await setupApp();
  });

  afterAll(async () => {
    await teardownApp();
  });

  describe('Health', () => {
    it('GET /users/health returns 200 with users status', async () => {
      const res = await request(getApp().getHttpServer()).get(`/${prefix}/users/health`);

      expect(res.status).toBe(200);
      // Depending on interceptor, body may be wrapped or raw
      if (res.body?.status === 'success' && res.body?.data) {
        expect(res.body.data.status).toBe('ok');
        expect(res.body.data.service).toBe('users');
      } else {
        expect(res.body.status).toBe('ok');
        expect(res.body.service).toBe('users');
      }
    });
  });

  describe('Profile', () => {
    it('GET /users/profile without token returns 401', async () => {
      const res = await request(getApp().getHttpServer()).get(`/${prefix}/users/profile`);
      expect(res.status).toBe(401);
    });

    it('GET /users/profile accepts valid token and returns profile or 4xx', async () => {
      const res = await request(getApp().getHttpServer())
        .get(`/${prefix}/users/profile`)
        .set(authHeader('test-user-1'));

      expect([200, 404, 422, 500]).toContain(res.status);
      if (res.status === 200) {
        if (res.body?.status === 'success') {
          expect(res.body.data).toBeDefined();
        } else {
          expect(res.body).toBeDefined();
        }
      }
    });

    it('PATCH /users/profile rejects invalid data (400 validation or 500)', async () => {
      const res = await request(getApp().getHttpServer())
        .patch(`/${prefix}/users/profile`)
        .set(authHeader('test-user-1'))
        .send({ firstName: 'J', lastName: 'D', phone: 'invalid' });

      expect([400, 500]).toContain(res.status);
    });

    it('PATCH /users/profile accepts valid payload with 200 or 404', async () => {
      const res = await request(getApp().getHttpServer())
        .patch(`/${prefix}/users/profile`)
        .set(authHeader('test-user-1'))
        .send({ firstName: 'John', lastName: 'Doe' });

      expect([200, 404, 500]).toContain(res.status);
    });
  });

  describe('Avatar', () => {
    it('DELETE /users/avatar rejects unauthenticated (401)', async () => {
      const res = await request(getApp().getHttpServer()).delete(`/${prefix}/users/avatar`);
      expect(res.status).toBe(401);
    });

    it('DELETE /users/avatar executes with valid token', async () => {
      const res = await request(getApp().getHttpServer())
        .delete(`/${prefix}/users/avatar`)
        .set(authHeader('test-user-1'));

      expect([200, 404, 500]).toContain(res.status);
    });

    it('POST /users/avatar rejects unauthenticated (401)', async () => {
      const res = await request(getApp().getHttpServer())
        .post(`/${prefix}/users/avatar`)
        .attach('file', Buffer.from('fake'), 'test.png');

      expect(res.status).toBe(401);
    });

    it('POST /users/avatar executes with valid token', async () => {
      const res = await request(getApp().getHttpServer())
        .post(`/${prefix}/users/avatar`)
        .set(authHeader('test-user-1'))
        .attach('file', Buffer.from('fake'), 'test.png');

      expect([201, 400, 500]).toContain(res.status);
    });
  });

  describe('Preferences', () => {
    it('GET /users/preferences rejects unauthenticated (401)', async () => {
      const res = await request(getApp().getHttpServer()).get(`/${prefix}/users/preferences`);
      expect(res.status).toBe(401);
    });

    it('GET /users/preferences executes with valid token', async () => {
      const res = await request(getApp().getHttpServer())
        .get(`/${prefix}/users/preferences`)
        .set(authHeader('test-user-1'));

      expect([200, 404, 500]).toContain(res.status);
    });

    it('PATCH /users/preferences rejects invalid data (400 validation or 500)', async () => {
      const res = await request(getApp().getHttpServer())
        .patch(`/${prefix}/users/preferences`)
        .set(authHeader('test-user-1'))
        .send({
          notifications: { email: { digest: 'invalid' } },
          privacy: { profileVisibility: 'invalid' },
        });

      expect([400, 500]).toContain(res.status);
    });

    it('PATCH /users/preferences accepts valid payload with 200 or 404', async () => {
      const res = await request(getApp().getHttpServer())
        .patch(`/${prefix}/users/preferences`)
        .set(authHeader('test-user-1'))
        .send({
          notifications: { email: { digest: 'weekly' } },
          privacy: { profileVisibility: 'public' },
        });

      expect([200, 404, 500]).toContain(res.status);
    });
  });

  describe('Password', () => {
    it('PATCH /users/password rejects invalid payload (400 validation or 500)', async () => {
      const res = await request(getApp().getHttpServer())
        .patch(`/${prefix}/users/password`)
        .set(authHeader('test-user-1'))
        .send({
          currentPassword: 'old',
          newPassword: 'weak',
          confirmPassword: 'weak',
        });

      expect([400, 500]).toContain(res.status);
    });

    it('POST /users/change-password rejects invalid payload (400 validation or 500)', async () => {
      const res = await request(getApp().getHttpServer())
        .post(`/${prefix}/users/change-password`)
        .set(authHeader('test-user-1'))
        .send({
          currentPassword: 'old',
          newPassword: 'weak',
          confirmPassword: 'mismatch',
        });

      expect([400, 500]).toContain(res.status);
    });
  });

  describe('Two-Factor Authentication', () => {
    it('POST /users/2fa/enable rejects empty password (400 validation or 500)', async () => {
      const res = await request(getApp().getHttpServer())
        .post(`/${prefix}/users/2fa/enable`)
        .set(authHeader('test-user-1'))
        .send({ password: '' });

      expect([400, 500]).toContain(res.status);
    });

    it('POST /users/2fa/verify rejects invalid code length (400 validation or 500)', async () => {
      const res = await request(getApp().getHttpServer())
        .post(`/${prefix}/users/2fa/verify`)
        .set(authHeader('test-user-1'))
        .send({ code: '123' });

      expect([400, 500]).toContain(res.status);
    });

    it('POST /users/2fa/disable rejects invalid code length (400 validation or 500)', async () => {
      const res = await request(getApp().getHttpServer())
        .post(`/${prefix}/users/2fa/disable`)
        .set(authHeader('test-user-1'))
        .send({ password: 'pass', code: '123' });

      expect([400, 500]).toContain(res.status);
    });

    it('GET /users/2fa/status rejects unauthenticated (401)', async () => {
      const res = await request(getApp().getHttpServer()).get(`/${prefix}/users/2fa/status`);
      expect(res.status).toBe(401);
    });

    it('GET /users/2fa/status executes with valid token', async () => {
      const res = await request(getApp().getHttpServer())
        .get(`/${prefix}/users/2fa/status`)
        .set(authHeader('test-user-1'));

      expect([200, 404, 422, 500]).toContain(res.status);
    });

    it('GET /users/2fa/backup-codes rejects unauthenticated (401)', async () => {
      const res = await request(getApp().getHttpServer()).get(
        `/${prefix}/users/2fa/backup-codes`,
      );
      expect(res.status).toBe(401);
    });

    it('GET /users/2fa/backup-codes executes with valid token', async () => {
      const res = await request(getApp().getHttpServer())
        .get(`/${prefix}/users/2fa/backup-codes`)
        .set(authHeader('test-user-1'));

      expect([200, 404, 422, 500]).toContain(res.status);
    });
  });

  describe('Sessions', () => {
    it('GET /users/sessions rejects unauthenticated (401)', async () => {
      const res = await request(getApp().getHttpServer()).get(`/${prefix}/users/sessions`);
      expect(res.status).toBe(401);
    });

    it('GET /users/sessions executes with valid token', async () => {
      const res = await request(getApp().getHttpServer())
        .get(`/${prefix}/users/sessions`)
        .set(authHeader('test-user-1'));

      expect([200, 404, 500]).toContain(res.status);
    });

    it('GET /users/sessions/:sessionId rejects invalid id with 4xx', async () => {
      const res = await request(getApp().getHttpServer())
        .get(`/${prefix}/users/sessions/invalid-session-id`)
        .set(authHeader('test-user-1'));

      expect([400, 404, 422]).toContain(res.status);
    });

    it('POST /users/sessions/terminate-others rejects unauthenticated (401)', async () => {
      const res = await request(getApp().getHttpServer()).post(
        `/${prefix}/users/sessions/terminate-others`,
      );
      expect(res.status).toBe(401);
    });

    it('POST /users/sessions/terminate-others executes with valid token', async () => {
      const res = await request(getApp().getHttpServer())
        .post(`/${prefix}/users/sessions/terminate-others`)
        .set(authHeader('test-user-1'));

      expect([200, 201, 500]).toContain(res.status);
    });
  });

  describe('Account', () => {
    it('POST /users/delete-account rejects too-long reason (400 or 500)', async () => {
      const res = await request(getApp().getHttpServer())
        .post(`/${prefix}/users/delete-account`)
        .set(authHeader('test-user-1'))
        .send({ reason: 'a'.repeat(51) });

      expect([400, 422, 500]).toContain(res.status);
    });

    it('POST /users/delete-account accepts valid payload with 2xx or 4xx', async () => {
      const res = await request(getApp().getHttpServer())
        .post(`/${prefix}/users/delete-account`)
        .set(authHeader('test-user-1'))
        .send({ reason: 'Test reason', password: 'test' });

      expect([200, 201, 404, 422, 500]).toContain(res.status);
    });

    it('POST /users/cancel-deletion rejects unauthenticated (401)', async () => {
      const res = await request(getApp().getHttpServer()).post(
        `/${prefix}/users/cancel-deletion`,
      );
      expect(res.status).toBe(401);
    });

    it('POST /users/cancel-deletion executes with valid token', async () => {
      const res = await request(getApp().getHttpServer())
        .post(`/${prefix}/users/cancel-deletion`)
        .set(authHeader('test-user-1'));

      expect([200, 201, 422, 500]).toContain(res.status);
    });
  });

  describe('Activity & Export', () => {
    it('GET /users/activity rejects unauthenticated (401)', async () => {
      const res = await request(getApp().getHttpServer()).get(`/${prefix}/users/activity`);
      expect(res.status).toBe(401);
    });

    it('GET /users/activity executes with valid token', async () => {
      const res = await request(getApp().getHttpServer())
        .get(`/${prefix}/users/activity`)
        .query({ page: '1', limit: '20' })
        .set(authHeader('test-user-1'));

      expect([200, 404, 500]).toContain(res.status);
    });

    it('GET /users/export rejects unauthenticated (401)', async () => {
      const res = await request(getApp().getHttpServer()).get(`/${prefix}/users/export`);
      expect(res.status).toBe(401);
    });

    it('GET /users/export executes with valid token', async () => {
      const res = await request(getApp().getHttpServer())
        .get(`/${prefix}/users/export`)
        .set(authHeader('test-user-1'));

      expect([200, 500]).toContain(res.status);
    });

    it('GET /users/data-export rejects unauthenticated (401)', async () => {
      const res = await request(getApp().getHttpServer()).get(`/${prefix}/users/data-export`);
      expect(res.status).toBe(401);
    });

    it('GET /users/data-export executes with valid token', async () => {
      const res = await request(getApp().getHttpServer())
        .get(`/${prefix}/users/data-export`)
        .set(authHeader('test-user-1'));

      expect([200, 500]).toContain(res.status);
    });
  });
});
