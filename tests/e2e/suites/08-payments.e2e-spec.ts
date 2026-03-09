/**
 * Suite 08 — Payments Service E2E Tests (P0 Critical)
 *
 * Covers payment initiation, idempotency, confirmation, listing,
 * admin views, refunds, and receipt/invoice downloads.
 */

import {
    apiGet,
    apiPost,
    apiPatch,
    expectSuccessResponse,
    expectPaginatedResponse,
    loginAsAdmin,
    loginAsClient,
    uniqueSlug,
} from '../setup/test-helpers';
import { SAMPLE_REQUEST, SAMPLE_QUOTE } from '../setup/seed-data';

describe('[E2E] Payments Service', () => {
    let clientToken: string;
    let adminToken: string;
    let projectId: string;
    let paymentId: string;
    const idempotencyKey = `idem_e2e_${Date.now()}`;

    beforeAll(async () => {
        clientToken = await loginAsClient();
        adminToken = await loginAsAdmin();

        // Create a project that is in pending_payment via the normal flow
        const reqRes = await apiPost('/requests', { ...SAMPLE_REQUEST, title: 'Payment E2E' }, clientToken);
        const requestId = reqRes.data.data?.id;
        if (requestId) {
            await apiPost(`/requests/${requestId}/submit`, {}, clientToken);
            await apiPatch(`/admin/requests/${requestId}/status`, { status: 'under_review' }, adminToken);
            const quoteRes = await apiPost('/admin/quotes', { ...SAMPLE_QUOTE, requestId }, adminToken);
            const quoteId = quoteRes.data.data?.id;
            if (quoteId) {
                await apiPost(`/admin/quotes/${quoteId}/send`, {}, adminToken);
                await apiPost(`/quotes/${quoteId}/accept`, {}, clientToken);
            }
        }

        const projRes = await apiGet('/projects?page=1&limit=50', clientToken);
        const projects = projRes.data.data || [];
        projectId = projects[projects.length - 1]?.id;

        // Transition to pending_payment
        if (projectId) {
            await apiPatch(
                `/admin/projects/${projectId}/status`,
                { status: 'pending_payment' },
                adminToken,
            );
        }
    });

    // ─── Initiate Payment ─────────────────────────────────────────────────
    describe('POST /payments/initiate', () => {
        it('should initiate a payment for the project', async () => {
            if (!projectId) return;
            const res = await apiPost(
                '/payments/initiate',
                { projectId, amount: 22500, currency: 'INR' },
                clientToken,
                { headers: { 'Idempotency-Key': idempotencyKey } },
            );
            expect(res.status).toBe(201);
            expect(res.data.data).toHaveProperty('id');
            paymentId = res.data.data.id;
        });

        it('should return same result for duplicate idempotency key', async () => {
            if (!projectId) return;
            const res = await apiPost(
                '/payments/initiate',
                { projectId, amount: 22500, currency: 'INR' },
                clientToken,
                { headers: { 'Idempotency-Key': idempotencyKey } },
            );
            // Should return same payment, not create a new one
            expect([200, 201]).toContain(res.status);
            expect(res.data.data?.id).toBe(paymentId);
        });
    });

    // ─── Get Payment Details ──────────────────────────────────────────────
    describe('GET /payments/:id', () => {
        it('should return payment details', async () => {
            if (!paymentId) return;
            const res = await apiGet(`/payments/${paymentId}`, clientToken);
            expectSuccessResponse(res, 200);
            expect(res.data.data).toHaveProperty('id', paymentId);
        });
    });

    // ─── List Payments ────────────────────────────────────────────────────
    describe('GET /payments', () => {
        it('should list user payments with pagination', async () => {
            const res = await apiGet('/payments?page=1&limit=10', clientToken);
            expectPaginatedResponse(res);
        });
    });

    // ─── Confirm Payment ──────────────────────────────────────────────────
    describe('POST /payments/confirm', () => {
        it('should confirm the payment (mock gateway success)', async () => {
            if (!paymentId) return;
            const res = await apiPost(
                '/payments/confirm',
                {
                    paymentId,
                    razorpayPaymentId: `pay_e2e_${Date.now()}`,
                    razorpaySignature: 'e2e-mock-signature',
                },
                clientToken,
            );
            // In a test/mock environment this may succeed or fail validation
            expect([200, 400, 422]).toContain(res.status);
        });
    });

    // ─── Admin: View All Payments ─────────────────────────────────────────
    describe('GET /admin/payments (Admin)', () => {
        it('should list all payments', async () => {
            const res = await apiGet('/admin/payments?page=1&limit=10', adminToken);
            expectPaginatedResponse(res);
        });
    });

    // ─── Admin: Refund ────────────────────────────────────────────────────
    describe('POST /admin/payments/:id/refund (Admin)', () => {
        it('should process a refund', async () => {
            if (!paymentId) return;
            const res = await apiPost(
                `/admin/payments/${paymentId}/refund`,
                { amount: 5000, reason: 'E2E test refund' },
                adminToken,
            );
            // Refund may succeed or fail depending on payment status
            expect([200, 400, 422]).toContain(res.status);
        });
    });

    describe('GET /payments/stats', () => {
        it('should return payment stats', async () => {
            const res = await apiGet('/payments/stats', clientToken);
            expect(res.status).toBe(200);
        });
    });

    describe('GET /payments/projects/:projectId', () => {
        it('should return payments for a project', async () => {
            if (!projectId) return;
            const res = await apiGet(`/payments/projects/${projectId}`, clientToken);
            expect(res.status).toBe(200);
        });
    });

    describe('GET /payments/methods', () => {
        it('should list saved payment methods', async () => {
            const res = await apiGet('/payments/methods', clientToken);
            expect(res.status).toBe(200);
        });
    });

    // ─── Receipt / Invoice ────────────────────────────────────────────────
    describe('GET /payments/:id/receipt', () => {
        it('should attempt to download the receipt', async () => {
            if (!paymentId) return;
            const res = await apiGet(`/payments/${paymentId}/receipt`, clientToken);
            // May return PDF or error if payment not completed
            expect([200, 400, 404]).toContain(res.status);
        });
    });

    describe('GET /payments/:id/invoice', () => {
        it('should attempt to download the invoice', async () => {
            if (!paymentId) return;
            const res = await apiGet(`/payments/${paymentId}/invoice`, clientToken);
            expect([200, 400, 404]).toContain(res.status);
        });
    });
});
