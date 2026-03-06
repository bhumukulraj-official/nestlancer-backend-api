/**
 * Suite 16 — Webhooks Service E2E Tests (P2)
 *
 * Covers outbound webhook management (admin) and inbound
 * webhook signature verification.
 */

import {
    apiGet,
    apiPost,
    expectSuccessResponse,
    expectPaginatedResponse,
    expectErrorResponse,
    loginAsAdmin,
} from '../setup/test-helpers';
import { SAMPLE_WEBHOOK } from '../setup/seed-data';

describe('[E2E] Webhooks Service', () => {
    let adminToken: string;
    let webhookId: string;

    beforeAll(async () => {
        adminToken = await loginAsAdmin();
    });

    // ─── Outbound: Admin CRUD ─────────────────────────────────────────────
    describe('POST /admin/webhooks', () => {
        it('should create a webhook subscription', async () => {
            const res = await apiPost('/admin/webhooks', { ...SAMPLE_WEBHOOK }, adminToken);
            expect(res.status).toBe(201);
            webhookId = res.data.data?.id;
        });
    });

    describe('GET /admin/webhooks', () => {
        it('should list webhooks', async () => {
            const res = await apiGet('/admin/webhooks', adminToken);
            expectPaginatedResponse(res);
        });
    });

    describe('POST /admin/webhooks/:id/test', () => {
        it('should send a test event', async () => {
            if (!webhookId) return;
            const res = await apiPost(`/admin/webhooks/${webhookId}/test`, {}, adminToken);
            expect(res.status).toBe(200);
        });
    });

    describe('GET /admin/webhooks/:id/deliveries', () => {
        it('should return delivery history', async () => {
            if (!webhookId) return;
            const res = await apiGet(`/admin/webhooks/${webhookId}/deliveries`, adminToken);
            expect(res.status).toBe(200);
        });
    });

    describe('POST /admin/webhooks/:id/disable', () => {
        it('should disable a webhook', async () => {
            if (!webhookId) return;
            const res = await apiPost(`/admin/webhooks/${webhookId}/disable`, {}, adminToken);
            expect(res.status).toBe(200);
        });
    });

    // ─── Inbound: Signature Verification ──────────────────────────────────
    describe('POST /webhooks/razorpay (Inbound)', () => {
        it('should reject webhook without signature', async () => {
            const res = await apiPost('/webhooks/razorpay', {
                event: 'payment.captured',
                payload: { payment: { entity: { id: 'pay_test' } } },
            });
            expect([400, 401]).toContain(res.status);
        });

        it('should reject webhook with invalid signature', async () => {
            const res = await apiPost(
                '/webhooks/razorpay',
                {
                    event: 'payment.captured',
                    payload: { payment: { entity: { id: 'pay_test' } } },
                },
                undefined,
                { headers: { 'X-Razorpay-Signature': 'invalid-signature' } },
            );
            expect([400, 401]).toContain(res.status);
        });
    });
});
