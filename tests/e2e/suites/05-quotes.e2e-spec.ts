/**
 * Suite 05 — Quotes Service E2E Tests (P1)
 *
 * Covers admin quote creation, sending, client acceptance/decline,
 * and quote-to-project conversion.
 */

import {
    apiGet,
    apiPost,
    apiPatch,
    expectSuccessResponse,
    expectErrorResponse,
    loginAsAdmin,
    loginAsClient,
} from '../setup/test-helpers';
import { SAMPLE_REQUEST, SAMPLE_QUOTE } from '../setup/seed-data';

describe('[E2E] Quotes Service', () => {
    let clientToken: string;
    let adminToken: string;
    let requestId: string;
    let quoteId: string;

    beforeAll(async () => {
        clientToken = await loginAsClient();
        adminToken = await loginAsAdmin();

        // Create and submit a request to get a requestId for the quote
        const reqRes = await apiPost('/requests', { ...SAMPLE_REQUEST }, clientToken);
        requestId = reqRes.data.data?.id;
        if (requestId) {
            await apiPost(`/requests/${requestId}/submit`, {}, clientToken);
            await apiPatch(`/admin/requests/${requestId}/status`, { status: 'under_review' }, adminToken);
        }
    });

    // ─── Admin: Create Quote ──────────────────────────────────────────────
    describe('POST /admin/quotes', () => {
        it('should create a quote for a request', async () => {
            const res = await apiPost(
                '/admin/quotes',
                { ...SAMPLE_QUOTE, requestId },
                adminToken,
            );
            expect(res.status).toBe(201);
            expect(res.data.data).toHaveProperty('id');
            quoteId = res.data.data.id;
        });
    });

    // ─── Admin: Send Quote ────────────────────────────────────────────────
    describe('POST /admin/quotes/:id/send', () => {
        it('should send the quote to the client', async () => {
            const res = await apiPost(`/admin/quotes/${quoteId}/send`, {}, adminToken);
            expect(res.status).toBe(200);
        });
    });

    // ─── Client: View Quote ───────────────────────────────────────────────
    describe('GET /quotes/:id', () => {
        it('should return the quote details', async () => {
            const res = await apiGet(`/quotes/${quoteId}`, clientToken);
            expectSuccessResponse(res, 200);
            expect(res.data.data).toHaveProperty('id', quoteId);
        });
    });

    // ─── Client: Accept Quote → Project Creation ─────────────────────────
    describe('POST /quotes/:id/accept', () => {
        it('should accept the quote', async () => {
            const res = await apiPost(`/quotes/${quoteId}/accept`, {}, clientToken);
            expect(res.status).toBe(200);
        });

        it('should have created a project from the accepted quote', async () => {
            const res = await apiGet('/projects?page=1&limit=50', clientToken);
            expect(res.status).toBe(200);
            const projects = res.data.data || [];
            const linkedProject = projects.find((p: any) => p.quoteId === quoteId);
            expect(linkedProject).toBeDefined();
        });

        it('should reject accepting an already-accepted quote', async () => {
            const res = await apiPost(`/quotes/${quoteId}/accept`, {}, clientToken);
            expect([400, 409, 422]).toContain(res.status);
        });
    });

    describe('GET /quotes (list)', () => {
        it('should list quotes for the user', async () => {
            const res = await apiGet('/quotes?page=1&limit=10', clientToken);
            expect(res.status).toBe(200);
        });
    });

    // ─── Client: Decline Quote (separate flow) ───────────────────────────
    describe('POST /quotes/:id/decline', () => {
        it('should decline a new quote', async () => {
            // Create a new request + quote for this sub-flow
            const reqRes = await apiPost('/requests', { ...SAMPLE_REQUEST, title: 'Decline Test' }, clientToken);
            const reqId2 = reqRes.data.data?.id;
            if (!reqId2) return;

            await apiPost(`/requests/${reqId2}/submit`, {}, clientToken);
            await apiPatch(`/admin/requests/${reqId2}/status`, { status: 'under_review' }, adminToken);

            const quoteRes = await apiPost(
                '/admin/quotes',
                { ...SAMPLE_QUOTE, requestId: reqId2, title: 'Decline Test Quote' },
                adminToken,
            );
            const quoteId2 = quoteRes.data.data?.id;
            if (!quoteId2) return;

            await apiPost(`/admin/quotes/${quoteId2}/send`, {}, adminToken);
            const declineRes = await apiPost(`/quotes/${quoteId2}/decline`, {}, clientToken);
            expect(declineRes.status).toBe(200);
        });
    });
});
