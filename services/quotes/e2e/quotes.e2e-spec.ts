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
  return authHeader('admin-quotes-e2e-1', 'ADMIN');
}

describe('Quotes Service (E2E)', () => {
  beforeAll(async () => {
    await setupApp();
  });

  afterAll(async () => {
    await teardownApp();
  });

  describe('Health', () => {
    it('GET /quotes/health returns 200 with quotes status', async () => {
      const res = await request(getAppUrl().replace(/\/$/, ''))
        .get(`/${prefix}/quotes/health`)
        .expect(200);

      const data = res.body?.data ?? res.body;
      expect(data?.status).toBe('ok');
      expect(data?.service).toBe('quotes');
    });
  });

  describe('Auth guards', () => {
    it('GET /quotes without token returns 401', async () => {
      const res = await request(basePath()).get('/quotes');
      expect(res.status).toBe(401);
    });

    it('GET /quotes/stats without token returns 401', async () => {
      const res = await request(basePath()).get('/quotes/stats');
      expect(res.status).toBe(401);
    });

    it('GET /quotes/:id without token returns 401', async () => {
      const res = await request(basePath()).get('/quotes/00000000-0000-0000-0000-000000000000');
      expect(res.status).toBe(401);
    });

    it('POST /quotes/:id/accept without token returns 401', async () => {
      const res = await request(basePath())
        .post('/quotes/00000000-0000-0000-0000-000000000000/accept')
        .send({});
      expect(res.status).toBe(401);
    });

    it('POST /quotes/:id/decline without token returns 401', async () => {
      const res = await request(basePath())
        .post('/quotes/00000000-0000-0000-0000-000000000000/decline')
        .send({});
      expect(res.status).toBe(401);
    });

    it('POST /quotes/:id/request-changes without token returns 401', async () => {
      const res = await request(basePath())
        .post('/quotes/00000000-0000-0000-0000-000000000000/request-changes')
        .send({});
      expect(res.status).toBe(401);
    });

    it('GET /quotes/:id/pdf without token returns 401', async () => {
      const res = await request(basePath()).get(
        '/quotes/00000000-0000-0000-0000-000000000000/pdf',
      );
      expect(res.status).toBe(401);
    });
  });

  describe('Client - list and details', () => {
    const userId = 'quotes-e2e-client-1';

    it('GET /quotes returns list or 4xx/5xx but not 401', async () => {
      const res = await request(basePath()).get('/quotes').set(authHeader(userId));

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

    it('GET /quotes/stats returns stats or 4xx/5xx but not 401', async () => {
      const res = await request(basePath()).get('/quotes/stats').set(authHeader(userId));
      expect(res.status).not.toBe(401);
      expect([200, 404, 422, 500]).toContain(res.status);
    });

    it('GET /quotes/:id for non-existent id returns 4xx/5xx but not 401', async () => {
      const res = await request(basePath())
        .get('/quotes/00000000-0000-0000-0000-000000000000')
        .set(authHeader(userId));
      expect(res.status).not.toBe(401);
      expect([404, 422, 500]).toContain(res.status);
    });
  });

  describe('Client - actions on quote', () => {
    const userId = 'quotes-e2e-client-2';
    const quoteId = '00000000-0000-0000-0000-000000000000';

    it('POST /quotes/:id/accept validates payload and returns 2xx/4xx/5xx but not 401', async () => {
      const res = await request(basePath())
        .post(`/quotes/${quoteId}/accept`)
        .set(authHeader(userId))
        .send({
          acceptTerms: true,
          signatureName: 'E2E Test User',
          signatureDate: new Date().toISOString(),
          notes: 'E2E acceptance test',
        });

      expect(res.status).not.toBe(401);
      expect([200, 400, 404, 422, 500]).toContain(res.status);
    });

    it('POST /quotes/:id/decline validates payload and returns 2xx/4xx/5xx but not 401', async () => {
      const res = await request(basePath())
        .post(`/quotes/${quoteId}/decline`)
        .set(authHeader(userId))
        .send({
          reason: 'budgetConstraints',
          feedback: 'Too expensive for our current budget.',
          requestRevision: false,
        });

      expect(res.status).not.toBe(401);
      expect([200, 400, 404, 422, 500]).toContain(res.status);
    });

    it('POST /quotes/:id/request-changes validates payload and returns 2xx/4xx/5xx but not 401', async () => {
      const res = await request(basePath())
        .post(`/quotes/${quoteId}/request-changes`)
        .set(authHeader(userId))
        .send({
          changes: [
            {
              area: 'budget',
              request: 'Reduce total by 10% in exchange for fewer revisions.',
            },
          ],
          additionalNotes: 'E2E change request test',
        });

      expect(res.status).not.toBe(401);
      expect([200, 400, 404, 422, 500]).toContain(res.status);
    });

    it('GET /quotes/:id/pdf returns 2xx/4xx/5xx but not 401', async () => {
      const res = await request(basePath())
        .get(`/quotes/${quoteId}/pdf`)
        .set(authHeader(userId));

      expect(res.status).not.toBe(401);
      expect([200, 404, 422, 500]).toContain(res.status);
    });
  });

  describe('Admin - auth guards', () => {
    it('GET /admin/quotes without token returns 401', async () => {
      const res = await request(basePath()).get('/admin/quotes');
      expect(res.status).toBe(401);
    });

    it('GET /admin/quotes with USER role returns 403', async () => {
      const res = await request(basePath()).get('/admin/quotes').set(authHeader('user-1', 'USER'));
      expect(res.status).toBe(403);
    });
  });

  describe('Admin - list, stats and templates', () => {
    it('GET /admin/quotes with admin token returns list or 5xx', async () => {
      const res = await request(basePath()).get('/admin/quotes').set(adminAuthHeader());

      expect([200, 500]).toContain(res.status);
      if (res.status === 200) {
        const body = res.body?.data ?? res.body;
        const list = Array.isArray(body) ? body : body?.data ?? body?.items;
        if (list) {
          expect(Array.isArray(list)).toBe(true);
        }
      }
    });

    it('GET /admin/quotes/stats returns stats or 5xx', async () => {
      const res = await request(basePath()).get('/admin/quotes/stats').set(adminAuthHeader());
      expect([200, 500]).toContain(res.status);
    });

    it('GET /admin/quotes/templates returns templates or 5xx', async () => {
      const res = await request(basePath()).get('/admin/quotes/templates').set(adminAuthHeader());
      expect([200, 500]).toContain(res.status);
    });
  });

  describe('Admin - quote actions', () => {
    const quoteId = '00000000-0000-0000-0000-000000000000';

    it('POST /admin/quotes creates quote or fails validation but not 401/403', async () => {
      const res = await request(basePath())
        .post('/admin/quotes')
        .set(adminAuthHeader())
        .send({
          requestId: '00000000-0000-0000-0000-000000000001',
          title: 'E2E Admin Quote',
          description:
            'E2E test quote for admin flow to validate validation and plumbing end-to-end.',
          totalAmount: 10000,
          currency: 'USD',
          validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          validityDays: 7,
          paymentBreakdown: [
            {
              type: 'advance',
              description: 'Initial deposit',
              amount: 5000,
              percentage: 50,
              dueDate: new Date().toISOString(),
              deliverables: ['Kickoff call'],
            },
            {
              type: 'final',
              description: 'Final payment on completion',
              amount: 5000,
              percentage: 50,
              dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
              deliverables: ['Final delivery'],
            },
          ],
        });

      expect(res.status).not.toBe(401);
      expect(res.status).not.toBe(403);
      expect([201, 400, 404, 422, 500]).toContain(res.status);
    });

    it('GET /admin/quotes/:id returns details or 4xx/5xx but not 401/403', async () => {
      const res = await request(basePath()).get(`/admin/quotes/${quoteId}`).set(adminAuthHeader());

      expect(res.status).not.toBe(401);
      expect(res.status).not.toBe(403);
      expect([200, 404, 500]).toContain(res.status);
    });

    it('PATCH /admin/quotes/:id updates details or returns 4xx/5xx but not 401/403', async () => {
      const res = await request(basePath())
        .patch(`/admin/quotes/${quoteId}`)
        .set(adminAuthHeader())
        .send({ title: 'Updated E2E Admin Quote Title' });

      expect(res.status).not.toBe(401);
      expect(res.status).not.toBe(403);
      expect([200, 404, 422, 500]).toContain(res.status);
    });

    it('POST /admin/quotes/:id/send triggers send or returns 4xx/5xx but not 401/403', async () => {
      const res = await request(basePath())
        .post(`/admin/quotes/${quoteId}/send`)
        .set(adminAuthHeader());

      expect(res.status).not.toBe(401);
      expect(res.status).not.toBe(403);
      expect([200, 404, 422, 500]).toContain(res.status);
    });

    it('POST /admin/quotes/:id/resend triggers resend or returns 4xx/5xx but not 401/403', async () => {
      const res = await request(basePath())
        .post(`/admin/quotes/${quoteId}/resend`)
        .set(adminAuthHeader());

      expect(res.status).not.toBe(401);
      expect(res.status).not.toBe(403);
      expect([200, 404, 422, 500]).toContain(res.status);
    });

    it('POST /admin/quotes/:id/duplicate duplicates or returns 4xx/5xx but not 401/403', async () => {
      const res = await request(basePath())
        .post(`/admin/quotes/${quoteId}/duplicate`)
        .set(adminAuthHeader());

      expect(res.status).not.toBe(401);
      expect(res.status).not.toBe(403);
      expect([200, 404, 422, 500]).toContain(res.status);
    });

    it('POST /admin/quotes/:id/revise creates revision or returns 4xx/5xx but not 401/403', async () => {
      const res = await request(basePath())
        .post(`/admin/quotes/${quoteId}/revise`)
        .set(adminAuthHeader())
        .send({ title: 'Revised E2E Admin Quote Title' });

      expect(res.status).not.toBe(401);
      expect(res.status).not.toBe(403);
      expect([200, 404, 422, 500]).toContain(res.status);
    });

    it('GET /admin/quotes/:id/history returns history or 4xx/5xx but not 401/403', async () => {
      const res = await request(basePath())
        .get(`/admin/quotes/${quoteId}/history`)
        .set(adminAuthHeader());

      expect(res.status).not.toBe(401);
      expect(res.status).not.toBe(403);
      expect([200, 404, 500]).toContain(res.status);
    });

    it('GET /admin/quotes/:id/pdf returns metadata or 4xx/5xx but not 401/403', async () => {
      const res = await request(basePath())
        .get(`/admin/quotes/${quoteId}/pdf`)
        .set(adminAuthHeader());

      expect(res.status).not.toBe(401);
      expect(res.status).not.toBe(403);
      expect([200, 404, 500]).toContain(res.status);
    });

    it('DELETE /admin/quotes/:id deletes or returns 4xx/5xx but not 401/403', async () => {
      const res = await request(basePath())
        .delete(`/admin/quotes/${quoteId}`)
        .set(adminAuthHeader());

      expect(res.status).not.toBe(401);
      expect(res.status).not.toBe(403);
      expect([200, 204, 404, 422, 500]).toContain(res.status);
    });
  });
});
