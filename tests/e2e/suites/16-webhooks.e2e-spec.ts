/**
 * Suite 16 — Webhooks Service E2E Tests (P2)
 *
 * Covers outbound webhook management (admin) and inbound
 * webhook signature verification.
 */

import {
    apiGet,
    apiPost,
    apiPatch,
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

    // ─── Outbound: Webhook CRUD ───────────────────────────────────────────
    describe('POST /webhooks', () => {
        it('should create a webhook subscription', async () => {
            const res = await apiPost('/webhooks', { ...SAMPLE_WEBHOOK }, adminToken);
            expect(res.status).toBe(201);
            webhookId = res.data.data?.id;
        });
    });

    describe('GET /webhooks', () => {
        it('should list webhooks', async () => {
            const res = await apiGet('/webhooks', adminToken);
            expect(res.status).toBe(200);
        });
    });

    describe('POST /webhooks/:id/test', () => {
        it('should send a test event', async () => {
            if (!webhookId) return;
            const res = await apiPost(`/webhooks/${webhookId}/test`, {}, adminToken);
            expect(res.status).toBe(200);
        });
    });

    describe('GET /webhooks/logs', () => {
        it('should return webhook delivery logs', async () => {
            const res = await apiGet('/webhooks/logs', adminToken);
            expect(res.status).toBe(200);
        });
    });

    describe('POST /webhooks/:id/regenerate-secret', () => {
        it('should regenerate webhook secret', async () => {
            if (!webhookId) return;
            const res = await apiPost(`/webhooks/${webhookId}/regenerate-secret`, {}, adminToken);
            expect([200, 400]).toContain(res.status);
        });
    });

    describe('GET /webhooks', () => {
        it('should list user webhooks', async () => {
            const res = await apiGet('/webhooks', adminToken);
            expect(res.status).toBe(200);
        });
    });

    describe('GET /webhooks/:id', () => {
        it('should return webhook details', async () => {
            if (!webhookId) return;
            const res = await apiGet(`/webhooks/${webhookId}`, adminToken);
            expect(res.status).toBe(200);
        });
    });

    describe('PATCH /webhooks/:id', () => {
        it('should update webhook', async () => {
            if (!webhookId) return;
            const res = await apiPatch(
                `/webhooks/${webhookId}`,
                { name: 'Updated E2E Webhook', enabled: true },
                adminToken,
            );
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
