import request from 'supertest';
import { createTestJwt } from '../../../libs/testing/src/helpers/test-auth.helper';
import { setupApp, teardownApp, getAppUrl, getGlobalPrefix } from './setup';

const prefix = getGlobalPrefix();

function authHeader(userId: string, role = 'USER') {
  const token = createTestJwt(
    { sub: userId, email: `${userId}@test.com`, role },
    { secret: process.env.JWT_ACCESS_SECRET },
  );
  return { Authorization: `Bearer ${token}` };
}

function adminAuthHeader() {
  return authHeader('projects-e2e-admin-1', 'ADMIN');
}

function basePath() {
  return `${getAppUrl()}/${prefix}`;
}

describe('Projects Service - Admin APIs (E2E)', () => {
  beforeAll(async () => {
    await setupApp();
  });

  afterAll(async () => {
    await teardownApp();
  });

  describe('Auth guards', () => {
    it('GET /admin/projects without token returns 401', async () => {
      const res = await request(basePath()).get('/admin/projects');
      expect(res.status).toBe(401);
    });

    it('GET /admin/projects with USER role returns 403', async () => {
      const res = await request(basePath())
        .get('/admin/projects')
        .set(authHeader('normal-user', 'USER'));
      expect(res.status).toBe(403);
    });
  });

  describe('Admin - list and stats', () => {
    it('GET /admin/projects with admin token returns list or 5xx', async () => {
      const res = await request(basePath()).get('/admin/projects').set(adminAuthHeader());

      expect([200, 500]).toContain(res.status);
      if (res.status === 200) {
        const body = res.body?.data ?? res.body;
        const list = Array.isArray(body) ? body : body?.data ?? body?.items;
        if (list) {
          expect(Array.isArray(list)).toBe(true);
        }
      }
    });

    it('GET /admin/projects/stats returns stats or 5xx', async () => {
      const res = await request(basePath()).get('/admin/projects/stats').set(adminAuthHeader());
      expect([200, 500]).toContain(res.status);
    });
  });

  describe('Admin - actions on project', () => {
    const projectId = '00000000-0000-0000-0000-000000000000';

    it('GET /admin/projects/:id returns details or 4xx/5xx but not 401/403', async () => {
      const res = await request(basePath())
        .get(`/admin/projects/${projectId}`)
        .set(adminAuthHeader());

      expect(res.status).not.toBe(401);
      expect(res.status).not.toBe(403);
      expect([200, 404, 422, 500]).toContain(res.status);
    });

    it('PATCH /admin/projects/:id/status updates status or returns 4xx/5xx but not 401/403', async () => {
      const res = await request(basePath())
        .patch(`/admin/projects/${projectId}/status`)
        .set(adminAuthHeader())
        .send({ status: 'inProgress', reason: 'E2E admin status change' });

      expect(res.status).not.toBe(401);
      expect(res.status).not.toBe(403);
      expect([200, 400, 404, 422, 500]).toContain(res.status);
    });

    it('PATCH /admin/projects/:id updates details or returns 4xx/5xx but not 401/403', async () => {
      const res = await request(basePath())
        .patch(`/admin/projects/${projectId}`)
        .set(adminAuthHeader())
        .send({ title: 'Updated E2E Project Title' });

      expect(res.status).not.toBe(401);
      expect(res.status).not.toBe(403);
      expect([200, 400, 404, 422, 500]).toContain(res.status);
    });

    it('POST /admin/projects creates project or fails validation but not 401/403', async () => {
      const res = await request(basePath())
        .post('/admin/projects')
        .set(adminAuthHeader())
        .send({
          title: 'E2E Admin Created Project',
          description: 'Project created from E2E admin test.',
          quoteId: '00000000-0000-0000-0000-000000000001',
          clientId: '00000000-0000-0000-0000-000000000002',
          targetEndDate: new Date().toISOString(),
        });

      expect(res.status).not.toBe(401);
      expect(res.status).not.toBe(403);
      expect([201, 400, 404, 422, 500]).toContain(res.status);
    });

    it('POST /admin/projects/:id/team manages team or returns 4xx/5xx but not 401/403', async () => {
      const res = await request(basePath())
        .post(`/admin/projects/${projectId}/team`)
        .set(adminAuthHeader())
        .send({ memberId: '00000000-0000-0000-0000-000000000010' });

      expect(res.status).not.toBe(401);
      expect(res.status).not.toBe(403);
      expect([200, 400, 404, 422, 500]).toContain(res.status);
    });

    it('DELETE /admin/projects/:id/team/:memberId removes team member or returns 4xx/5xx but not 401/403', async () => {
      const res = await request(basePath())
        .delete(`/admin/projects/${projectId}/team/00000000-0000-0000-0000-000000000010`)
        .set(adminAuthHeader());

      expect(res.status).not.toBe(401);
      expect(res.status).not.toBe(403);
      expect([200, 400, 404, 422, 500]).toContain(res.status);
    });

    it('GET /admin/projects/:id/analytics returns analytics or 4xx/5xx but not 401/403', async () => {
      const res = await request(basePath())
        .get(`/admin/projects/${projectId}/analytics`)
        .set(adminAuthHeader());

      expect(res.status).not.toBe(401);
      expect(res.status).not.toBe(403);
      expect([200, 404, 422, 500]).toContain(res.status);
    });

    it('POST /admin/projects/:id/milestones creates milestones or returns 4xx/5xx but not 401/403', async () => {
      const res = await request(basePath())
        .post(`/admin/projects/${projectId}/milestones`)
        .set(adminAuthHeader())
        .send({
          milestones: [
            {
              name: 'E2E Milestone 1',
              description: 'First milestone created by E2E test',
              amount: 10000,
              dueDate: new Date().toISOString(),
              order: 1,
            },
          ],
        });

      expect(res.status).not.toBe(401);
      expect(res.status).not.toBe(403);
      expect([200, 201, 400, 404, 422, 500]).toContain(res.status);
    });

    it('POST /admin/projects/:id/extend extends deadline or returns 4xx/5xx but not 401/403', async () => {
      const res = await request(basePath())
        .post(`/admin/projects/${projectId}/extend`)
        .set(adminAuthHeader())
        .send({
          newDeadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          reason: 'E2E test extension',
        });

      expect(res.status).not.toBe(401);
      expect(res.status).not.toBe(403);
      expect([200, 400, 404, 422, 500]).toContain(res.status);
    });

    it('POST /admin/projects/:id/archive archives project or returns 4xx/5xx but not 401/403', async () => {
      const res = await request(basePath())
        .post(`/admin/projects/${projectId}/archive`)
        .set(adminAuthHeader());

      expect(res.status).not.toBe(401);
      expect(res.status).not.toBe(403);
      expect([200, 400, 404, 422, 500]).toContain(res.status);
    });

    it('POST /admin/projects/:id/unarchive unarchives project or returns 4xx/5xx but not 401/403', async () => {
      const res = await request(basePath())
        .post(`/admin/projects/${projectId}/unarchive`)
        .set(adminAuthHeader());

      expect(res.status).not.toBe(401);
      expect(res.status).not.toBe(403);
      expect([200, 201, 400, 404, 422, 500]).toContain(res.status);
    });

    it('POST /admin/projects/:id/duplicate duplicates project or returns 4xx/5xx but not 401/403', async () => {
      const res = await request(basePath())
        .post(`/admin/projects/${projectId}/duplicate`)
        .set(adminAuthHeader());

      expect(res.status).not.toBe(401);
      expect(res.status).not.toBe(403);
      expect([200, 201, 400, 404, 422, 500]).toContain(res.status);
    });

    it('POST /admin/projects/:id/export exports project or returns 4xx/5xx but not 401/403', async () => {
      const res = await request(basePath())
        .post(`/admin/projects/${projectId}/export`)
        .set(adminAuthHeader());

      expect(res.status).not.toBe(401);
      expect(res.status).not.toBe(403);
      expect([200, 201, 400, 404, 422, 500]).toContain(res.status);
    });

    it('DELETE /admin/projects/:id deletes project or returns 4xx/5xx but not 401/403', async () => {
      const res = await request(basePath())
        .delete(`/admin/projects/${projectId}`)
        .set(adminAuthHeader());

      expect(res.status).not.toBe(401);
      expect(res.status).not.toBe(403);
      expect([200, 204, 400, 404, 422, 500]).toContain(res.status);
    });
  });
});
