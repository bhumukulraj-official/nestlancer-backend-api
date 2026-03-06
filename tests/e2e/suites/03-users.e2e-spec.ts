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
    describe('GET /users/me', () => {
        it('should return the current user profile', async () => {
            const res = await apiGet('/users/me', clientToken);
            expectSuccessResponse(res, 200);
            expect(res.data.data).toHaveProperty('email');
            expect(res.data.data).toHaveProperty('name');
            expect(res.data.data).not.toHaveProperty('passwordHash');
        });
    });

    describe('PATCH /users/me', () => {
        it('should update user profile fields', async () => {
            const res = await apiPatch('/users/me', { name: 'Updated Client Name' }, clientToken);
            expectSuccessResponse(res, 200);
            expect(res.data.data.name).toBe('Updated Client Name');
        });
    });

    // ─── Preferences ──────────────────────────────────────────────────────
    describe('GET /users/me/preferences', () => {
        it('should return user preferences', async () => {
            const res = await apiGet('/users/me/preferences', clientToken);
            expect(res.status).toBe(200);
        });
    });

    describe('PATCH /users/me/preferences', () => {
        it('should update user preferences', async () => {
            const res = await apiPatch(
                '/users/me/preferences',
                { timezone: 'Asia/Kolkata', theme: 'dark' },
                clientToken,
            );
            expect(res.status).toBe(200);
        });
    });

    // ─── Sessions ─────────────────────────────────────────────────────────
    describe('GET /users/me/sessions', () => {
        it('should list active sessions', async () => {
            const res = await apiGet('/users/me/sessions', clientToken);
            expect(res.status).toBe(200);
            expect(res.data).toHaveProperty('data');
            expect(Array.isArray(res.data.data)).toBe(true);
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
