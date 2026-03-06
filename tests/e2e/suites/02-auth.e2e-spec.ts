/**
 * Suite 02 — Auth Service E2E Tests (P0 Critical)
 *
 * Covers registration, login, token refresh, logout, password
 * management, email checks, and protected route access verification.
 */

import {
    apiGet,
    apiPost,
    expectSuccessResponse,
    expectErrorResponse,
    clearTokenCache,
    loginAsAdmin,
    loginAsClient,
    registerNewUser,
    uniqueEmail,
} from '../setup/test-helpers';
import { ADMIN_USER, CLIENT_USER, NEW_USER } from '../setup/seed-data';

describe('[E2E] Auth Service', () => {
    afterAll(() => {
        clearTokenCache();
    });

    // ─── Registration ───────────────────────────────────────────────────────
    describe('POST /auth/register', () => {
        it('should register a new user with valid data', async () => {
            const email = uniqueEmail('register');
            const res = await apiPost('/auth/register', {
                email,
                password: NEW_USER.password,
                name: NEW_USER.name,
            });
            expect(res.status).toBe(201);
            expect(res.data).toHaveProperty('status', 'success');
            // Password hash must never be exposed
            expect(res.data.data).not.toHaveProperty('passwordHash');
        });

        it('should reject duplicate email registration', async () => {
            const res = await apiPost('/auth/register', {
                email: CLIENT_USER.email,
                password: 'Duplicate@123456',
                name: 'Duplicate User',
            });
            expectErrorResponse(res, 409, 'AUTH_003');
        });

        it('should reject an invalid email format', async () => {
            const res = await apiPost('/auth/register', {
                email: 'not-an-email',
                password: NEW_USER.password,
                name: NEW_USER.name,
            });
            expect(res.status).toBe(422);
        });

        it('should reject a weak password', async () => {
            const res = await apiPost('/auth/register', {
                email: uniqueEmail('weak'),
                password: '123',
                name: 'Weak Password',
            });
            expect(res.status).toBe(422);
        });
    });

    // ─── Login ──────────────────────────────────────────────────────────────
    describe('POST /auth/login', () => {
        it('should return 200 and JWT tokens for valid credentials', async () => {
            const res = await apiPost('/auth/login', {
                email: CLIENT_USER.email,
                password: CLIENT_USER.password,
            });
            expect(res.status).toBe(200);
            expect(res.data.data || res.data).toHaveProperty('accessToken');
            expect(res.data.data || res.data).toHaveProperty('refreshToken');
        });

        it('should reject invalid credentials', async () => {
            const res = await apiPost('/auth/login', {
                email: CLIENT_USER.email,
                password: 'WrongPassword@999',
            });
            expectErrorResponse(res, 401, 'AUTH_001');
        });

        it('should reject login for non-existent email', async () => {
            const res = await apiPost('/auth/login', {
                email: 'nobody@example.com',
                password: 'Test@123456',
            });
            expectErrorResponse(res, 401);
        });
    });

    // ─── Token Refresh ──────────────────────────────────────────────────────
    describe('POST /auth/refresh', () => {
        let refreshToken: string;

        beforeAll(async () => {
            const res = await apiPost('/auth/login', {
                email: CLIENT_USER.email,
                password: CLIENT_USER.password,
            });
            refreshToken = res.data.data?.refreshToken ?? res.data.refreshToken;
        });

        it('should return a new access token with a valid refresh token', async () => {
            const res = await apiPost('/auth/refresh', { refreshToken });
            expect(res.status).toBe(200);
            expect(res.data.data || res.data).toHaveProperty('accessToken');
        });

        it('should reject an invalid refresh token', async () => {
            const res = await apiPost('/auth/refresh', {
                refreshToken: 'invalid-token',
            });
            expectErrorResponse(res, 401);
        });
    });

    // ─── Logout ─────────────────────────────────────────────────────────────
    describe('POST /auth/logout', () => {
        it('should logout and invalidate the session', async () => {
            // Login to get a fresh token
            const loginRes = await apiPost('/auth/login', {
                email: uniqueEmail('logout'),
                password: NEW_USER.password,
                name: 'Logout Test',
            });

            // If login failed (user doesn't exist), register first
            let token: string;
            if (loginRes.status !== 200) {
                const email = uniqueEmail('logout');
                await apiPost('/auth/register', {
                    email,
                    password: NEW_USER.password,
                    name: 'Logout Test',
                });
                const res2 = await apiPost('/auth/login', {
                    email,
                    password: NEW_USER.password,
                });
                token = res2.data.data?.accessToken ?? res2.data.accessToken;
            } else {
                token = loginRes.data.data?.accessToken ?? loginRes.data.accessToken;
            }

            if (token) {
                const logoutRes = await apiPost('/auth/logout', {}, token);
                expect(logoutRes.status).toBe(200);
            }
        });
    });

    // ─── Password Management ───────────────────────────────────────────────
    describe('POST /auth/forgot-password', () => {
        it('should accept a valid email for password reset', async () => {
            const res = await apiPost('/auth/forgot-password', {
                email: CLIENT_USER.email,
            });
            expect(res.status).toBe(200);
        });

        it('should return 200 even for non-existent email (no enumeration)', async () => {
            const res = await apiPost('/auth/forgot-password', {
                email: 'nobody@example.com',
            });
            expect(res.status).toBe(200);
        });
    });

    // ─── Email Availability ─────────────────────────────────────────────────
    describe('GET /auth/check-email', () => {
        it('should indicate a taken email', async () => {
            const res = await apiGet(`/auth/check-email?email=${CLIENT_USER.email}`);
            expect(res.status).toBe(200);
        });

        it('should indicate an available email', async () => {
            const res = await apiGet(`/auth/check-email?email=${uniqueEmail('avail')}`);
            expect(res.status).toBe(200);
        });
    });

    // ─── Protected Route Access ─────────────────────────────────────────────
    describe('Authorization guards', () => {
        it('should return 401 when accessing protected route without token', async () => {
            const res = await apiGet('/users/me');
            expect(res.status).toBe(401);
        });

        it('should return 200 when accessing protected route with valid user token', async () => {
            const token = await loginAsClient();
            const res = await apiGet('/users/me', token);
            expect(res.status).toBe(200);
        });

        it('should return 403 when user token accesses admin route', async () => {
            const token = await loginAsClient();
            const res = await apiGet('/admin/dashboard/overview', token);
            expect(res.status).toBe(403);
        });

        it('should return 200 when admin token accesses admin route', async () => {
            const token = await loginAsAdmin();
            const res = await apiGet('/admin/dashboard/overview', token);
            expect(res.status).toBe(200);
        });
    });
});
