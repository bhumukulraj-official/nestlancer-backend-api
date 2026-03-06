/**
 * Suite 15 — Admin Service E2E Tests (P2)
 *
 * Covers dashboard metrics, system configuration, feature flags,
 * audit logs, user impersonation, and background jobs.
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

describe('[E2E] Admin Service', () => {
    let adminToken: string;
    let clientToken: string;
    let clientUserId: string;

    beforeAll(async () => {
        adminToken = await loginAsAdmin();
        clientToken = await loginAsClient();

        // Get client user ID for impersonation tests
        const meRes = await apiGet('/users/me', clientToken);
        clientUserId = meRes.data.data?.id;
    });

    // ─── Dashboard ────────────────────────────────────────────────────────
    describe('GET /admin/dashboard/overview', () => {
        it('should return the admin dashboard overview', async () => {
            const res = await apiGet('/admin/dashboard/overview', adminToken);
            expectSuccessResponse(res, 200);
        });
    });

    describe('GET /admin/dashboard/revenue', () => {
        it('should return revenue analytics', async () => {
            const res = await apiGet('/admin/dashboard/revenue', adminToken);
            expect(res.status).toBe(200);
        });
    });

    // ─── System Config ────────────────────────────────────────────────────
    describe('GET /admin/system/config', () => {
        it('should return system configuration', async () => {
            const res = await apiGet('/admin/system/config', adminToken);
            expect(res.status).toBe(200);
        });
    });

    describe('PATCH /admin/system/config', () => {
        it('should update system configuration', async () => {
            const res = await apiPatch(
                '/admin/system/config',
                { maintenanceMode: false },
                adminToken,
            );
            expect(res.status).toBe(200);
        });
    });

    // ─── Feature Flags ────────────────────────────────────────────────────
    describe('GET /admin/system/features', () => {
        it('should list feature flags', async () => {
            const res = await apiGet('/admin/system/features', adminToken);
            expect(res.status).toBe(200);
        });
    });

    // ─── Email Templates ─────────────────────────────────────────────────
    describe('GET /admin/system/email-templates', () => {
        it('should list email templates', async () => {
            const res = await apiGet('/admin/system/email-templates', adminToken);
            expect(res.status).toBe(200);
        });
    });

    // ─── Audit Logs ───────────────────────────────────────────────────────
    describe('GET /admin/audit', () => {
        it('should list audit logs with pagination', async () => {
            const res = await apiGet('/admin/audit?page=1&limit=10', adminToken);
            expectPaginatedResponse(res);
        });
    });

    describe('GET /admin/audit/user/:id', () => {
        it('should return audit trail for a specific user', async () => {
            if (!clientUserId) return;
            const res = await apiGet(`/admin/audit/user/${clientUserId}`, adminToken);
            expect(res.status).toBe(200);
        });
    });

    // ─── Impersonation ────────────────────────────────────────────────────
    describe('POST /admin/users/:id/impersonate', () => {
        it('should impersonate a non-admin user', async () => {
            if (!clientUserId) return;
            const res = await apiPost(
                `/admin/users/${clientUserId}/impersonate`,
                {},
                adminToken,
            );
            expect(res.status).toBe(200);
            if (res.data.data?.token) {
                // End impersonation
                await apiPost('/admin/impersonate/end', {}, res.data.data.token);
            }
        });

        it('should reject impersonating another admin', async () => {
            // Get admin user's own ID
            const adminMe = await apiGet('/users/me', adminToken);
            const adminId = adminMe.data.data?.id;
            if (adminId) {
                const res = await apiPost(`/admin/users/${adminId}/impersonate`, {}, adminToken);
                expect([403, 400]).toContain(res.status);
            }
        });
    });

    // ─── Background Jobs ─────────────────────────────────────────────────
    describe('GET /admin/system/jobs', () => {
        it('should list background jobs', async () => {
            const res = await apiGet('/admin/system/jobs', adminToken);
            expect(res.status).toBe(200);
        });
    });

    // ─── Authorization ────────────────────────────────────────────────────
    describe('Authorization', () => {
        it('should reject non-admin user from admin endpoints', async () => {
            const res = await apiGet('/admin/dashboard/overview', clientToken);
            expect(res.status).toBe(403);
        });
    });
});
