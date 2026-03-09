/**
 * Suite 04 — Requests Service E2E Tests (P1)
 *
 * Covers request CRUD, status transitions, and admin request management.
 */

import {
    apiGet,
    apiPost,
    apiPatch,
    apiDelete,
    expectSuccessResponse,
    expectPaginatedResponse,
    expectErrorResponse,
    loginAsAdmin,
    loginAsClient,
} from '../setup/test-helpers';
import { SAMPLE_REQUEST } from '../setup/seed-data';

describe('[E2E] Requests Service', () => {
    let clientToken: string;
    let adminToken: string;
    let requestId: string;

    beforeAll(async () => {
        clientToken = await loginAsClient();
        adminToken = await loginAsAdmin();
    });

    // ─── CRUD ─────────────────────────────────────────────────────────────
    describe('POST /requests', () => {
        it('should create a draft request', async () => {
            const res = await apiPost('/requests', { ...SAMPLE_REQUEST }, clientToken);
            expect(res.status).toBe(201);
            expect(res.data.data).toHaveProperty('id');
            expect(res.data.data.status).toBe('draft');
            requestId = res.data.data.id;
        });
    });

    describe('GET /requests', () => {
        it('should list the users requests with pagination', async () => {
            const res = await apiGet('/requests?page=1&limit=10', clientToken);
            expectPaginatedResponse(res);
        });
    });

    describe('GET /requests/:id', () => {
        it('should return a request by ID', async () => {
            const res = await apiGet(`/requests/${requestId}`, clientToken);
            expectSuccessResponse(res, 200);
            expect(res.data.data).toHaveProperty('id', requestId);
        });
    });

    describe('GET /requests/stats', () => {
        it('should return user request statistics', async () => {
            const res = await apiGet('/requests/stats', clientToken);
            expect(res.status).toBe(200);
        });
    });

    describe('GET /requests/:id/status', () => {
        it('should return request status timeline', async () => {
            const res = await apiGet(`/requests/${requestId}/status`, clientToken);
            expect(res.status).toBe(200);
        });
    });

    describe('GET /requests/:id/quotes', () => {
        it('should return quotes for the request', async () => {
            const res = await apiGet(`/requests/${requestId}/quotes`, clientToken);
            expect(res.status).toBe(200);
        });
    });

    describe('PATCH /requests/:id', () => {
        it('should update a draft request', async () => {
            const res = await apiPatch(
                `/requests/${requestId}`,
                { title: 'Updated E2E Request Title' },
                clientToken,
            );
            expectSuccessResponse(res, 200);
        });
    });

    // ─── Status Transitions ───────────────────────────────────────────────
    describe('POST /requests/:id/submit', () => {
        it('should submit the request for review', async () => {
            const res = await apiPost(`/requests/${requestId}/submit`, {}, clientToken);
            expect(res.status).toBe(200);
        });
    });

    describe('PATCH /requests/:id (submitted)', () => {
        it('should reject editing a submitted request', async () => {
            const res = await apiPatch(
                `/requests/${requestId}`,
                { title: 'Should Not Work' },
                clientToken,
            );
            expect([400, 403, 422]).toContain(res.status);
        });
    });

    // ─── Admin ────────────────────────────────────────────────────────────
    describe('GET /admin/requests (Admin)', () => {
        it('should list all requests with pagination', async () => {
            const res = await apiGet('/admin/requests?page=1&limit=10', adminToken);
            expectPaginatedResponse(res);
        });
    });

    describe('GET /admin/requests/stats (Admin)', () => {
        it('should return overall request statistics', async () => {
            const res = await apiGet('/admin/requests/stats', adminToken);
            expect(res.status).toBe(200);
        });
    });

    describe('GET /admin/requests/:id (Admin)', () => {
        it('should return request admin details', async () => {
            const res = await apiGet(`/admin/requests/${requestId}`, adminToken);
            expect(res.status).toBe(200);
        });
    });

    describe('PATCH /admin/requests/:id/status (Admin)', () => {
        it('should update request status to under_review', async () => {
            const res = await apiPatch(
                `/admin/requests/${requestId}/status`,
                { status: 'under_review' },
                adminToken,
            );
            expect(res.status).toBe(200);
        });

        it('should reject an invalid status transition', async () => {
            const res = await apiPatch(
                `/admin/requests/${requestId}/status`,
                { status: 'draft' }, // Cannot go back to draft from under_review
                adminToken,
            );
            expect([400, 422]).toContain(res.status);
        });
    });

    describe('DELETE /requests/:id', () => {
        it('should delete a draft request', async () => {
            const createRes = await apiPost('/requests', { ...SAMPLE_REQUEST, title: 'To Delete' }, clientToken);
            const delId = createRes.data.data?.id;
            if (delId) {
                const res = await apiDelete(`/requests/${delId}`, clientToken);
                expect([200, 204]).toContain(res.status);
            }
        });
    });

    // ─── Cancel ───────────────────────────────────────────────────────────
    describe('POST /requests/:id/cancel', () => {
        it('should cancel a request', async () => {
            // Create a new request to cancel
            const createRes = await apiPost('/requests', { ...SAMPLE_REQUEST }, clientToken);
            const newId = createRes.data.data?.id;
            if (newId) {
                const res = await apiPost(`/requests/${newId}/cancel`, {}, clientToken);
                expect(res.status).toBe(200);
            }
        });
    });
});
