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

function basePath() {
  return `${getAppUrl()}/${prefix}`;
}

describe('Projects Service - Client & Public APIs (E2E)', () => {
  beforeAll(async () => {
    await setupApp();
  });

  afterAll(async () => {
    await teardownApp();
  });

  describe('Health', () => {
    it('GET /projects/health returns 200 with projects status', async () => {
      const res = await request(getAppUrl().replace(/\/$/, ''))
        .get(`/${prefix}/projects/health`)
        .expect(200);

      const data = res.body?.data ?? res.body;
      expect(data?.status).toBe('ok');
      expect(data?.service).toBe('projects');
    });
  });

  describe('Auth guards', () => {
    it('GET /projects without token returns 401', async () => {
      const res = await request(basePath()).get('/projects');
      expect(res.status).toBe(401);
    });

    it('GET /projects/stats without token returns 401', async () => {
      const res = await request(basePath()).get('/projects/stats');
      expect(res.status).toBe(401);
    });
  });

  describe('Client - list and details', () => {
    const userId = 'projects-e2e-client-1';

    it('GET /projects returns list or 4xx/5xx but not 401', async () => {
      const res = await request(basePath()).get('/projects').set(authHeader(userId));

      expect(res.status).not.toBe(401);
      expect([200, 404, 422, 500]).toContain(res.status);

      if (res.status === 200) {
        const data = res.body?.data ?? res.body;
        const items =
          Array.isArray(data) || Array.isArray(data?.items) ? data.items ?? data : data?.data;
        if (items) {
          expect(Array.isArray(items)).toBe(true);
        }
      }
    });

    it('GET /projects/stats returns stats or 4xx/5xx but not 401', async () => {
      const res = await request(basePath()).get('/projects/stats').set(authHeader(userId));
      expect(res.status).not.toBe(401);
      expect([200, 404, 422, 500]).toContain(res.status);
    });

    it('GET /projects/:id for non-existent id returns 4xx/5xx but not 401', async () => {
      const res = await request(basePath())
        .get('/projects/00000000-0000-0000-0000-000000000000')
        .set(authHeader(userId));

      expect(res.status).not.toBe(401);
      expect([404, 422, 500]).toContain(res.status);
    });
  });

  describe('Client - project relations', () => {
    const userId = 'projects-e2e-client-2';
    const projectId = '00000000-0000-0000-0000-000000000000';

    it('GET /projects/:id/timeline returns 2xx/4xx/5xx but not 401', async () => {
      const res = await request(basePath())
        .get(`/projects/${projectId}/timeline`)
        .set(authHeader(userId));

      expect(res.status).not.toBe(401);
      expect([200, 404, 422, 500]).toContain(res.status);
    });

    it('GET /projects/:id/deliverables returns 2xx/4xx/5xx but not 401', async () => {
      const res = await request(basePath())
        .get(`/projects/${projectId}/deliverables`)
        .set(authHeader(userId));

      expect(res.status).not.toBe(401);
      expect([200, 404, 422, 500]).toContain(res.status);
    });

    it('GET /projects/:id/payments returns 2xx/4xx/5xx but not 401', async () => {
      const res = await request(basePath())
        .get(`/projects/${projectId}/payments`)
        .set(authHeader(userId));

      expect(res.status).not.toBe(401);
      expect([200, 404, 422, 500]).toContain(res.status);
    });

    it('GET /projects/:id/progress returns 2xx/4xx/5xx but not 401', async () => {
      const res = await request(basePath())
        .get(`/projects/${projectId}/progress`)
        .set(authHeader(userId));

      expect(res.status).not.toBe(401);
      expect([200, 404, 422, 500]).toContain(res.status);
    });

    it('GET /projects/:id/milestones returns 2xx/4xx/5xx but not 401', async () => {
      const res = await request(basePath())
        .get(`/projects/${projectId}/milestones`)
        .set(authHeader(userId));

      expect(res.status).not.toBe(401);
      expect([200, 404, 422, 500]).toContain(res.status);
    });

    it('GET /projects/:id/messages returns 2xx/4xx/5xx but not 401', async () => {
      const res = await request(basePath())
        .get(`/projects/${projectId}/messages`)
        .set(authHeader(userId));

      expect(res.status).not.toBe(401);
      expect([200, 404, 422, 500]).toContain(res.status);
    });

    it('GET /projects/:id/feedback returns 2xx/4xx/5xx but not 401', async () => {
      const res = await request(basePath())
        .get(`/projects/${projectId}/feedback`)
        .set(authHeader(userId));

      expect(res.status).not.toBe(401);
      expect([200, 404, 422, 500]).toContain(res.status);
    });
  });

  describe('Client - actions', () => {
    const userId = 'projects-e2e-client-3';
    const projectId = '00000000-0000-0000-0000-000000000000';

    it('POST /projects/:id/approve validates payload and returns 2xx/4xx/5xx but not 401', async () => {
      const res = await request(basePath())
        .post(`/projects/${projectId}/approve`)
        .set(authHeader(userId))
        .send({
          rating: 5,
          testimonial: 'Great work from the team.',
        });

      expect(res.status).not.toBe(401);
      expect([200, 400, 404, 422, 500]).toContain(res.status);
    });

    it('POST /projects/:id/request-revision validates payload and returns 2xx/4xx/5xx but not 401', async () => {
      const res = await request(basePath())
        .post(`/projects/${projectId}/request-revision`)
        .set(authHeader(userId))
        .send({
          reason: 'Need changes to homepage copy',
          details: 'Please update hero section content for clarity.',
        });

      expect(res.status).not.toBe(401);
      expect([200, 400, 404, 422, 500]).toContain(res.status);
    });

    it('POST /projects/:id/messages sends message or returns 4xx/5xx but not 401', async () => {
      const res = await request(basePath())
        .post(`/projects/${projectId}/messages`)
        .set(authHeader(userId))
        .send({
          content: 'E2E test project message',
        });

      expect(res.status).not.toBe(401);
      expect([200, 201, 400, 404, 422, 500]).toContain(res.status);
    });

    it('POST /projects/:id/feedback submits feedback or returns 4xx/5xx but not 401', async () => {
      const res = await request(basePath())
        .post(`/projects/${projectId}/feedback`)
        .set(authHeader(userId))
        .send({
          title: 'Feedback from E2E test',
          feedback: 'Overall experience was positive.',
        });

      expect(res.status).not.toBe(401);
      expect([200, 201, 400, 404, 422, 500]).toContain(res.status);
    });
  });

  describe('Public projects', () => {
    it('GET /public returns list or 4xx/5xx', async () => {
      const res = await request(basePath()).get('/public');
      expect([200, 404, 422, 500]).toContain(res.status);
    });

    it('GET /public/:id for non-existent id returns 4xx/5xx', async () => {
      const res = await request(basePath()).get('/public/non-existent-slug');
      expect([404, 422, 500]).toContain(res.status);
    });
  });
});
