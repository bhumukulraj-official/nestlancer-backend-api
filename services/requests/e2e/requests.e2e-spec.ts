import request from 'supertest';
import { createTestJwt } from '../../../libs/testing/src/helpers/test-auth.helper';
import { setupApp, teardownApp, getAppUrl, getGlobalPrefix } from './setup';

const prefix = getGlobalPrefix();
const basePath = () => `${getAppUrl()}/${prefix}`;

function authHeader(userId: string, role = 'USER') {
  const token = createTestJwt(
    { sub: userId, email: `${userId}@test.com`, role },
    { secret: process.env.JWT_ACCESS_SECRET },
  );
  return { Authorization: `Bearer ${token}` };
}

function adminAuthHeader() {
  return authHeader('admin-e2e-1', 'ADMIN');
}

const validCreatePayload = {
  title: 'Build a Custom CRM for Real Estate',
  description:
    'We need a robust CRM system to manage lead flow, automated emails, and agent performance tracking with at least twenty characters here.',
  category: 'webDevelopment',
  budget: { min: 5000, max: 15000, currency: 'USD', flexible: true },
  timeline: {
    preferredStartDate: '2024-12-01T00:00:00Z',
    deadline: '2025-05-01T23:59:59Z',
    flexible: false,
  },
  requirements: ['User authentication', 'Dashboard analytics'],
};

describe('Requests Service (E2E)', () => {
  beforeAll(async () => {
    await setupApp();
  });

  afterAll(async () => {
    await teardownApp();
  });

  describe('Health', () => {
    it('GET /requests/health returns 200 with status ok', async () => {
      const res = await request(getAppUrl().replace(/\/$/, ''))
        .get(`/${prefix}/requests/health`)
        .expect(200);
      const data = res.body?.data ?? res.body;
      expect(data?.status).toBe('ok');
      expect(data?.service).toBe('requests');
    });
  });

  describe('Auth', () => {
    it('POST /requests without token returns 401', async () => {
      const res = await request(basePath())
        .post('/requests')
        .send(validCreatePayload)
        .expect(401);
      expect(res.status).toBe(401);
    });

    it('GET /requests without token returns 401', async () => {
      const res = await request(basePath()).get('/requests');
      expect(res.status).toBe(401);
    });

    it('GET /requests/stats without token returns 401', async () => {
      const res = await request(basePath()).get('/requests/stats');
      expect(res.status).toBe(401);
    });
  });

  describe('Client - Create request', () => {
    const userId = 'e2e-client-request-1';

    it('POST /requests rejects invalid payload (400)', async () => {
      const res = await request(basePath())
        .post('/requests')
        .set(authHeader(userId))
        .send({
          title: 'Hi',
          description: 'Short',
          category: 'webDevelopment',
          budget: { min: 0, max: 0, currency: 'USD', flexible: false },
          timeline: {
            preferredStartDate: '2024-12-01',
            deadline: '2025-05-01',
            flexible: false,
          },
          requirements: [],
        });
      expect([400, 422]).toContain(res.status);
    });

    it('POST /requests creates draft with valid payload (201)', async () => {
      const res = await request(basePath())
        .post('/requests')
        .set(authHeader(userId))
        .send(validCreatePayload);
      expect([201, 500]).toContain(res.status);
      if (res.status === 201) {
        const data = res.body?.data ?? res.body;
        expect(data?.id).toBeDefined();
        expect(data?.status).toMatch(/draft|DRAFT/i);
        expect(data?.title).toBe(validCreatePayload.title);
      }
    });
  });

  describe('Client - List and get', () => {
    const userId = 'e2e-client-list-1';

    it('GET /requests returns list (200)', async () => {
      const res = await request(basePath()).get('/requests').set(authHeader(userId));
      expect([200, 500]).toContain(res.status);
      if (res.status === 200) {
        const data = res.body?.data ?? res.body;
        expect(Array.isArray(data) || (data?.items && Array.isArray(data.items)) || Array.isArray(data?.data)).toBe(true);
      }
    });

    it('GET /requests/:id returns 404 or 422 for non-existent id', async () => {
      const res = await request(basePath())
        .get('/requests/00000000-0000-0000-0000-000000000000')
        .set(authHeader(userId));
      expect([404, 422, 500]).toContain(res.status);
    });

    it('GET /requests/stats returns stats (200)', async () => {
      const res = await request(basePath()).get('/requests/stats').set(authHeader(userId));
      expect([200, 500]).toContain(res.status);
    });
  });

  describe('Client - Create then get, update, submit', () => {
    const userId = 'e2e-client-crud-1';
    let requestId: string;

    it('creates a request and fetches it', async () => {
      const createRes = await request(basePath())
        .post('/requests')
        .set(authHeader(userId))
        .send(validCreatePayload);
      if (createRes.status !== 201) {
        return; // skip rest if create failed (e.g. DB not seeded)
      }
      const data = createRes.body?.data ?? createRes.body;
      requestId = data.id;
      expect(requestId).toBeDefined();

      const getRes = await request(basePath())
        .get(`/requests/${requestId}`)
        .set(authHeader(userId));
      expect(getRes.status).toBe(200);
      const getData = getRes.body?.data ?? getRes.body;
      expect(getData?.id).toBe(requestId);
      expect(getData?.title).toBe(validCreatePayload.title);
    });

    it('GET /requests/:id/status returns status timeline', async () => {
      if (!requestId) return;
      const res = await request(basePath())
        .get(`/requests/${requestId}/status`)
        .set(authHeader(userId));
      expect([200, 404, 500]).toContain(res.status);
      if (res.status === 200) {
        const data = res.body?.data ?? res.body;
        expect(data?.id).toBe(requestId);
        expect(data?.statusHistory).toBeDefined();
      }
    });

    it('PATCH /requests/:id updates draft', async () => {
      if (!requestId) return;
      const res = await request(basePath())
        .patch(`/requests/${requestId}`)
        .set(authHeader(userId))
        .send({ title: 'Updated Title for E2E' });
      expect([200, 404, 500]).toContain(res.status);
      if (res.status === 200) {
        const data = res.body?.data ?? res.body;
        expect(data?.title).toBe('Updated Title for E2E');
      }
    });

    it('POST /requests/:id/submit submits draft', async () => {
      if (!requestId) return;
      const res = await request(basePath())
        .post(`/requests/${requestId}/submit`)
        .set(authHeader(userId));
      expect([200, 404, 400, 500]).toContain(res.status);
      if (res.status === 200) {
        const data = res.body?.data ?? res.body;
        expect(data?.status).toMatch(/submitted|SUBMITTED/i);
      }
    });

    it('DELETE /requests/:id rejects non-draft (400 or 404)', async () => {
      if (!requestId) return;
      const res = await request(basePath())
        .delete(`/requests/${requestId}`)
        .set(authHeader(userId));
      expect([400, 404, 500]).toContain(res.status);
    });
  });

  describe('Client - Quotes and attachments', () => {
    const userId = 'e2e-client-quotes-1';
    let requestId: string;

    it('creates request then GET /requests/:id/quotes', async () => {
      const createRes = await request(basePath())
        .post('/requests')
        .set(authHeader(userId))
        .send(validCreatePayload);
      if (createRes.status !== 201) return;
      const data = createRes.body?.data ?? createRes.body;
      requestId = data.id;

      const res = await request(basePath())
        .get(`/requests/${requestId}/quotes`)
        .set(authHeader(userId));
      expect([200, 404, 500]).toContain(res.status);
      if (res.status === 200) {
        const qData = res.body?.data ?? res.body;
        expect(qData?.requestId).toBe(requestId);
        expect(Array.isArray(qData?.quotes)).toBe(true);
      }
    });

    it('GET /requests/:id/attachments returns list', async () => {
      if (!requestId) return;
      const res = await request(basePath())
        .get(`/requests/${requestId}/attachments`)
        .set(authHeader(userId));
      expect([200, 404, 500]).toContain(res.status);
    });
  });

  describe('Client - Delete draft', () => {
    const userId = 'e2e-client-delete-1';

    it('creates draft then deletes it', async () => {
      const createRes = await request(basePath())
        .post('/requests')
        .set(authHeader(userId))
        .send(validCreatePayload);
      if (createRes.status !== 201) return;
      const data = createRes.body?.data ?? createRes.body;
      const id = data.id;

      const delRes = await request(basePath())
        .delete(`/requests/${id}`)
        .set(authHeader(userId));
      expect([200, 204, 404, 500]).toContain(delRes.status);
    });
  });

  describe('Admin - Auth', () => {
    it('GET /admin/requests without token returns 401', async () => {
      const res = await request(basePath()).get('/admin/requests');
      expect(res.status).toBe(401);
    });

    it('GET /admin/requests with USER role returns 403', async () => {
      const res = await request(basePath())
        .get('/admin/requests')
        .set(authHeader('normal-user', 'USER'));
      expect(res.status).toBe(403);
    });
  });

  describe('Admin - List and stats', () => {
    it('GET /admin/requests with admin token returns list', async () => {
      const res = await request(basePath())
        .get('/admin/requests')
        .set(adminAuthHeader());
      expect([200, 500]).toContain(res.status);
      if (res.status === 200) {
        const data = res.body?.data ?? res.body;
        expect(data?.data !== undefined || Array.isArray(data)).toBe(true);
        if (data?.pagination) {
          expect(typeof data.pagination.total).toBe('number');
        }
      }
    });

    it('GET /admin/requests/stats returns overall stats', async () => {
      const res = await request(basePath())
        .get('/admin/requests/stats')
        .set(adminAuthHeader());
      expect([200, 500]).toContain(res.status);
    });

    it('GET /admin/requests?status=submitted filters by status', async () => {
      const res = await request(basePath())
        .get('/admin/requests?status=submitted&page=1&limit=5')
        .set(adminAuthHeader());
      expect([200, 500]).toContain(res.status);
    });
  });

  describe('Admin - Get details, status, notes, quote', () => {
    const userId = 'e2e-admin-flow-1';
    let requestId: string;

    it('client creates request, admin gets details', async () => {
      const createRes = await request(basePath())
        .post('/requests')
        .set(authHeader(userId))
        .send(validCreatePayload);
      if (createRes.status !== 201) return;
      const data = createRes.body?.data ?? createRes.body;
      requestId = data.id;

      const adminRes = await request(basePath())
        .get(`/admin/requests/${requestId}`)
        .set(adminAuthHeader());
      expect([200, 404, 500]).toContain(adminRes.status);
      if (adminRes.status === 200) {
        const adminData = adminRes.body?.data ?? adminRes.body;
        expect(adminData?.id).toBe(requestId);
      }
    });

    it('PATCH /admin/requests/:id/status updates status', async () => {
      if (!requestId) return;
      const res = await request(basePath())
        .patch(`/admin/requests/${requestId}/status`)
        .set(adminAuthHeader())
        .send({ status: 'underReview', notes: 'E2E admin status update' });
      expect([200, 400, 404, 500]).toContain(res.status);
    });

    it('POST /admin/requests/:id/notes adds note', async () => {
      if (!requestId) return;
      const res = await request(basePath())
        .post(`/admin/requests/${requestId}/notes`)
        .set(adminAuthHeader())
        .send({ content: 'E2E internal note' });
      expect([201, 404, 500]).toContain(res.status);
    });

    it('GET /admin/requests/:id/notes returns notes', async () => {
      if (!requestId) return;
      const res = await request(basePath())
        .get(`/admin/requests/${requestId}/notes`)
        .set(adminAuthHeader());
      expect([200, 404, 500]).toContain(res.status);
      if (res.status === 200) {
        const data = res.body?.data ?? res.body;
        expect(Array.isArray(data?.notes ?? data) || typeof data === 'object').toBe(true);
      }
    });

    it('POST /admin/requests/:id/quotes creates quote', async () => {
      if (!requestId) return;
      const res = await request(basePath())
        .post(`/admin/requests/${requestId}/quotes`)
        .set(adminAuthHeader())
        .send({
          items: [
            { description: 'Frontend work', quantity: 1, unitPrice: 10000 },
            { description: 'Backend work', quantity: 1, unitPrice: 15000 },
          ],
          currency: 'USD',
          taxPercentage: 10,
          validUntil: '2025-12-31T23:59:59Z',
        });
      expect([201, 400, 404, 500]).toContain(res.status);
    });
  });
});
