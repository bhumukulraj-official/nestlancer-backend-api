/**
 * Suite 09 — Messaging Service E2E Tests (P1)
 *
 * Covers sending messages within project threads, replying,
 * editing, deleting, and admin views.
 */

import {
    apiGet,
    apiPost,
    apiPatch,
    apiDelete,
    expectSuccessResponse,
    expectPaginatedResponse,
    loginAsAdmin,
    loginAsClient,
} from '../setup/test-helpers';
import { SAMPLE_REQUEST, SAMPLE_QUOTE } from '../setup/seed-data';

describe('[E2E] Messaging Service', () => {
    let clientToken: string;
    let adminToken: string;
    let projectId: string;
    let messageId: string;

    beforeAll(async () => {
        clientToken = await loginAsClient();
        adminToken = await loginAsAdmin();

        // Create a project for messaging
        const reqRes = await apiPost('/requests', { ...SAMPLE_REQUEST, title: 'Messaging E2E' }, clientToken);
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
    });

    // ─── Send Message ─────────────────────────────────────────────────────
    describe('POST /messages/projects/:id', () => {
        it('should send a message to the project thread', async () => {
            if (!projectId) return;
            const res = await apiPost(
                `/messages/projects/${projectId}`,
                { content: 'Hello from E2E test!' },
                clientToken,
            );
            expect(res.status).toBe(201);
            messageId = res.data.data?.id;
        });
    });

    // ─── List Messages ────────────────────────────────────────────────────
    describe('GET /messages/projects/:id', () => {
        it('should list messages in the project thread', async () => {
            if (!projectId) return;
            const res = await apiGet(`/messages/projects/${projectId}?page=1&limit=20`, clientToken);
            expectPaginatedResponse(res);
        });
    });

    // ─── Reply ────────────────────────────────────────────────────────────
    describe('POST /messages/projects/:id (reply)', () => {
        it('should reply to a message', async () => {
            if (!projectId || !messageId) return;
            const res = await apiPost(
                `/messages/projects/${projectId}`,
                { content: 'This is a reply!', replyToId: messageId },
                clientToken,
            );
            expect(res.status).toBe(201);
        });
    });

    // ─── Edit ─────────────────────────────────────────────────────────────
    describe('PATCH /messages/:id', () => {
        it('should edit own message (within time window)', async () => {
            if (!messageId) return;
            const res = await apiPatch(
                `/messages/${messageId}`,
                { content: 'Edited E2E message' },
                clientToken,
            );
            expect(res.status).toBe(200);
        });
    });

    // ─── Cannot edit others' messages ─────────────────────────────────────
    describe('PATCH /messages/:id (unauthorized)', () => {
        it('should reject editing another users message', async () => {
            if (!messageId) return;
            // Admin tries to edit client's message via user endpoint
            const res = await apiPatch(
                `/messages/${messageId}`,
                { content: 'Admin editing client msg' },
                adminToken,
            );
            expect([403, 404]).toContain(res.status);
        });
    });

    // ─── Delete ───────────────────────────────────────────────────────────
    describe('DELETE /messages/:id', () => {
        it('should soft-delete own message', async () => {
            if (!projectId) return;
            // Create a message to delete
            const createRes = await apiPost(
                `/messages/projects/${projectId}`,
                { content: 'To be deleted' },
                clientToken,
            );
            const delId = createRes.data.data?.id;
            if (delId) {
                const res = await apiDelete(`/messages/${delId}`, clientToken);
                expect(res.status).toBe(200);
            }
        });
    });

    // ─── Admin ────────────────────────────────────────────────────────────
    describe('GET /admin/messages/projects/:id (Admin)', () => {
        it('should list all messages for a project', async () => {
            if (!projectId) return;
            const res = await apiGet(`/admin/messages/projects/${projectId}`, adminToken);
            expect(res.status).toBe(200);
        });
    });
});
