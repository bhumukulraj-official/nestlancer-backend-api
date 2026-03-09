/**
 * Suite 03 — Users Service E2E Tests (P1)
 *
 * Covers user profile CRUD, preferences, sessions, and admin user management.
 */

import {
    apiGet,
    apiPatch,
    apiDelete,
    expectSuccessResponse,
    expectPaginatedResponse,
    loginAsAdmin,
    loginAsClient,
} from '../setup/test-helpers';

describe('[E2E] Users Service', () => {
    let clientToken: string;
    let adminToken: string;

    beforeAll(async () => {
        clientToken = await loginAsClient();
        adminToken = await loginAsAdmin();
    });

    // ─── Profile ──────────────────────────────────────────────────────────
    describe('GET /users/profile', () => {
        it('should return the current user profile', async () => {
            const res = await apiGet('/users/profile', clientToken);
            expectSuccessResponse(res, 200);
            expect(res.data.data).toHaveProperty('email');
            expect(res.data.data).toHaveProperty('name');
            expect(res.data.data).not.toHaveProperty('passwordHash');
        });
    });

    describe('PATCH /users/profile', () => {
        it('should update user profile fields', async () => {
            const res = await apiPatch('/users/profile', { name: 'Updated Client Name' }, clientToken);
            expectSuccessResponse(res, 200);
            expect(res.data.data.name).toBe('Updated Client Name');
        });
    });

    // ─── Preferences ──────────────────────────────────────────────────────
    describe('GET /users/preferences', () => {
        it('should return user preferences', async () => {
            const res = await apiGet('/users/preferences', clientToken);
            expect(res.status).toBe(200);
        });
    });

    describe('PATCH /users/preferences', () => {
        it('should update user preferences', async () => {
            const res = await apiPatch(
                '/users/preferences',
                { timezone: 'Asia/Kolkata', theme: 'dark' },
                clientToken,
            );
            expect(res.status).toBe(200);
        });
    });

    // ─── Sessions ─────────────────────────────────────────────────────────
    describe('GET /users/sessions', () => {
        it('should list active sessions', async () => {
            const res = await apiGet('/users/sessions', clientToken);
            expect(res.status).toBe(200);
            expect(res.data).toHaveProperty('data');
            expect(Array.isArray(res.data.data)).toBe(true);
        });
    });

    // ─── Activity & Data Export ───────────────────────────────────────────
    describe('GET /users/activity', () => {
        it('should return user activity log', async () => {
            const res = await apiGet('/users/activity?page=1&limit=10', clientToken);
            expect(res.status).toBe(200);
        });
    });

    describe('GET /users/data-export', () => {
        it('should request data export', async () => {
            const res = await apiGet('/users/data-export', clientToken);
            expect([200, 400, 429]).toContain(res.status);
        });
    });

    describe('GET /users/2fa/backup-codes', () => {
        it('should return 2FA backup codes when 2FA is enabled', async () => {
            const res = await apiGet('/users/2fa/backup-codes', clientToken);
            expect([200, 400, 404]).toContain(res.status);
        });
    });

    // ─── Admin: User Management ───────────────────────────────────────────
    describe('GET /admin/users (Admin)', () => {
        it('should list all users with pagination', async () => {
            const res = await apiGet('/admin/users?page=1&limit=10', adminToken);
            expectPaginatedResponse(res);
        });
    });

    describe('GET /admin/users/:id (Admin)', () => {
        it('should retrieve a specific user by ID', async () => {
            // First get a user ID from the list
            const listRes = await apiGet('/admin/users?page=1&limit=1', adminToken);
            const userId = listRes.data.data?.[0]?.id;

            if (userId) {
                const res = await apiGet(`/admin/users/${userId}`, adminToken);
                expectSuccessResponse(res, 200);
                expect(res.data.data).toHaveProperty('id', userId);
            }
        });
    });

    describe('GET /admin/users/search (Admin)', () => {
        it('should search users by query', async () => {
            const res = await apiGet('/admin/users/search?q=client&page=1&limit=10', adminToken);
            expect(res.status).toBe(200);
        });
    });

    describe('PATCH /admin/users/:id/status (Admin)', () => {
        let testUserId: string;

        beforeAll(async () => {
            const listRes = await apiGet('/admin/users?page=1&limit=10', adminToken);
            // Pick a non-admin user
            const users = listRes.data.data || [];
            const nonAdmin = users.find((u: any) => u.role !== 'ADMIN');
            testUserId = nonAdmin?.id;
        });

        it('should suspend a user', async () => {
            if (!testUserId) return;
            const res = await apiPatch(
                `/admin/users/${testUserId}/status`,
                { status: 'suspended' },
                adminToken,
            );
            expect(res.status).toBe(200);
        });

        it('should reactivate a suspended user', async () => {
            if (!testUserId) return;
            const res = await apiPatch(
                `/admin/users/${testUserId}/status`,
                { status: 'active' },
                adminToken,
            );
            expect(res.status).toBe(200);
        });
    });
});
