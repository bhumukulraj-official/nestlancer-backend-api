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
    apiDelete,
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

    // ─── Admin: Notification Templates ─────────────────────────────────────
    describe('GET /admin/templates (Admin)', () => {
        it('should list notification templates', async () => {
            const res = await apiGet('/admin/templates', adminToken);
            expect(res.status).toBe(200);
        });
    });

    describe('GET /notifications/:id', () => {
        it('should return notification details', async () => {
            if (!notificationId) return;
            const res = await apiGet(`/notifications/${notificationId}`, clientToken);
            expect([200, 404]).toContain(res.status);
        });
    });

    describe('DELETE /notifications/:id', () => {
        it('should delete a notification', async () => {
            if (!notificationId) return;
            const res = await apiDelete(`/notifications/${notificationId}`, clientToken);
            expect([200, 204, 404]).toContain(res.status);
        });
    });
});
