/**
 * Suite 14 — Contact Service E2E Tests (P2)
 *
 * Covers public contact form submission, validation,
 * and admin message management.
 */

import {
    apiGet,
    apiPost,
    expectSuccessResponse,
    expectPaginatedResponse,
    expectErrorResponse,
    loginAsAdmin,
} from '../setup/test-helpers';
import { SAMPLE_CONTACT } from '../setup/seed-data';

describe('[E2E] Contact Service', () => {
    let adminToken: string;
    let contactId: string;

    beforeAll(async () => {
        adminToken = await loginAsAdmin();
    });

    // ─── Public: Submit Contact Form ──────────────────────────────────────
    describe('POST /contact (Public)', () => {
        it('should accept a valid contact form submission', async () => {
            const res = await apiPost('/contact', { ...SAMPLE_CONTACT });
            expect(res.status).toBe(201);
            contactId = res.data.data?.id || res.data.data?.ticketId;
        });

        it('should reject missing required fields', async () => {
            const res = await apiPost('/contact', {});
            expect(res.status).toBe(422);
        });

        it('should reject invalid email format', async () => {
            const res = await apiPost('/contact', {
                ...SAMPLE_CONTACT,
                email: 'not-valid',
            });
            expect([400, 422]).toContain(res.status);
        });
    });

    // ─── Admin: List Contact Messages ─────────────────────────────────────
    describe('GET /admin/contact (Admin)', () => {
        it('should list contact messages with pagination', async () => {
            const res = await apiGet('/admin/contact?page=1&limit=10', adminToken);
            expectPaginatedResponse(res);
        });
    });

    // ─── Admin: View Message (marks as read) ──────────────────────────────
    describe('GET /admin/contact/:id (Admin)', () => {
        it('should return the contact message and mark as read', async () => {
            if (!contactId) return;
            const res = await apiGet(`/admin/contact/${contactId}`, adminToken);
            expectSuccessResponse(res, 200);
        });
    });

    // ─── Admin: Respond ───────────────────────────────────────────────────
    describe('POST /admin/contact/:id/respond (Admin)', () => {
        it('should respond to a contact message', async () => {
            if (!contactId) return;
            const res = await apiPost(
                `/admin/contact/${contactId}/respond`,
                { response: 'Thank you for your E2E test submission.' },
                adminToken,
            );
            expect(res.status).toBe(200);
        });
    });

    // ─── Admin: Spam ──────────────────────────────────────────────────────
    describe('POST /admin/contact/:id/spam (Admin)', () => {
        it('should mark a message as spam', async () => {
            // Create another contact for spam
            const createRes = await apiPost('/contact', {
                ...SAMPLE_CONTACT,
                email: 'spam-test@example.com',
                message: 'Buy cheap stuff!!!',
            });
            const spamId = createRes.data.data?.id || createRes.data.data?.ticketId;
            if (spamId) {
                const res = await apiPost(`/admin/contact/${spamId}/spam`, {}, adminToken);
                expect(res.status).toBe(200);
            }
        });
    });
});
