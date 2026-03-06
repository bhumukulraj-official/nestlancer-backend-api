/**
 * Suite 10 — Notifications Service E2E Tests (P1)
 *
 * Covers listing, unread count, marking as read, preferences,
 * and admin notification send.
 */

import {
    apiGet,
    apiPost,
    apiPatch,
    expectSuccessResponse,
    expectPaginatedResponse,
    loginAsAdmin,
    loginAsClient,
} from '../setup/test-helpers';

describe('[E2E] Notifications Service', () => {
    let clientToken: string;
    let adminToken: string;
    let notificationId: string;

    beforeAll(async () => {
        clientToken = await loginAsClient();
        adminToken = await loginAsAdmin();
    });

    // ─── List Notifications ───────────────────────────────────────────────
    describe('GET /notifications', () => {
        it('should list user notifications with pagination', async () => {
            const res = await apiGet('/notifications?page=1&limit=10', clientToken);
            expectPaginatedResponse(res);
            const items = res.data.data || [];
            if (items.length > 0) {
                notificationId = items[0].id;
            }
        });
    });

    // ─── Unread Count ─────────────────────────────────────────────────────
    describe('GET /notifications/unread-count', () => {
        it('should return the unread notification count', async () => {
            const res = await apiGet('/notifications/unread-count', clientToken);
            expect(res.status).toBe(200);
            expect(res.data.data).toHaveProperty('count');
            expect(typeof res.data.data.count).toBe('number');
        });
    });

    // ─── Mark as Read ─────────────────────────────────────────────────────
    describe('PATCH /notifications/:id/read', () => {
        it('should mark a notification as read', async () => {
            if (!notificationId) return;
            const res = await apiPatch(`/notifications/${notificationId}/read`, {}, clientToken);
            expect(res.status).toBe(200);
        });
    });

    // ─── Mark All as Read ─────────────────────────────────────────────────
    describe('POST /notifications/mark-all-read', () => {
        it('should mark all notifications as read', async () => {
            const res = await apiPost('/notifications/mark-all-read', {}, clientToken);
            expect(res.status).toBe(200);
        });
    });

    // ─── Preferences ──────────────────────────────────────────────────────
    describe('GET /notifications/preferences', () => {
        it('should return notification preferences', async () => {
            const res = await apiGet('/notifications/preferences', clientToken);
            expect(res.status).toBe(200);
        });
    });

    describe('PATCH /notifications/preferences', () => {
        it('should update notification preferences', async () => {
            const res = await apiPatch(
                '/notifications/preferences',
                { emailEnabled: true, pushEnabled: false },
                clientToken,
            );
            expect(res.status).toBe(200);
        });
    });

    // ─── Admin: Send System Notification ──────────────────────────────────
    describe('POST /admin/notifications/send (Admin)', () => {
        it('should send a system notification', async () => {
            const res = await apiPost(
                '/admin/notifications/send',
                {
                    title: 'E2E System Notification',
                    message: 'This is a test system notification.',
                    type: 'system',
                    channel: 'in_app',
                },
                adminToken,
            );
            expect([200, 201]).toContain(res.status);
        });
    });
});
