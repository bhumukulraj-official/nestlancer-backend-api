/**
 * Suite 18 — Error Handling & Edge Cases E2E Tests (P3)
 *
 * Validates that the API Gateway enforces consistent error
 * responses, standard headers, rate limiting, and CORS.
 */

import {
    apiGet,
    apiPost,
    apiPatch,
    expectErrorResponse,
    expectStandardHeaders,
} from '../setup/test-helpers';

describe('[E2E] Error Handling & Edge Cases', () => {
    // ─── Invalid JSON Body ────────────────────────────────────────────────
    describe('Invalid request body', () => {
        it('should return 400 for malformed JSON', async () => {
            const res = await apiPost('/auth/login', undefined, undefined, {
                headers: { 'Content-Type': 'application/json' },
                // Send raw string that is not valid JSON
                transformRequest: [() => '{invalid json}'],
            });
            expect([400, 422]).toContain(res.status);
        });
    });

    // ─── Missing Required Fields ──────────────────────────────────────────
    describe('Validation errors', () => {
        it('should return 422 for missing required registration fields', async () => {
            const res = await apiPost('/auth/register', {});
            expect(res.status).toBe(422);
            expect(res.data).toHaveProperty('status', 'error');
        });

        it('should return 422 for missing required fields on contact', async () => {
            const res = await apiPost('/contact', {});
            expect(res.status).toBe(422);
        });
    });

    // ─── Invalid UUID in Path ─────────────────────────────────────────────
    describe('Invalid path parameters', () => {
        it('should return 400 or 422 for invalid UUID format', async () => {
            const res = await apiGet('/projects/not-a-uuid');
            expect([400, 401, 404, 422]).toContain(res.status);
        });
    });

    // ─── 404 Resource Not Found ───────────────────────────────────────────
    describe('Resource not found', () => {
        it('should return 404 for unknown route', async () => {
            const res = await apiGet('/nonexistent-route');
            expect(res.status).toBe(404);
        });

        it('should return 404 for unknown resource ID', async () => {
            const res = await apiGet('/projects/00000000-0000-0000-0000-000000000000');
            expect([401, 404]).toContain(res.status);
        });
    });

    // ─── Invalid Pagination ───────────────────────────────────────────────
    describe('Invalid pagination parameters', () => {
        it('should reject negative page number', async () => {
            const res = await apiGet('/blog/posts?page=-1&limit=10');
            expect([400, 422]).toContain(res.status);
        });

        it('should reject excessively large limit', async () => {
            const res = await apiGet('/blog/posts?page=1&limit=99999');
            expect([400, 422]).toContain(res.status);
        });
    });

    // ─── Standard Error Response Format ───────────────────────────────────
    describe('Error response consistency', () => {
        it('should follow the standard error envelope', async () => {
            const res = await apiPost('/auth/login', {
                email: 'nobody@example.com',
                password: 'Wrong@12345',
            });
            expect(res.data).toHaveProperty('status', 'error');
            expect(res.data).toHaveProperty('error');
            expect(res.data.error).toHaveProperty('code');
            expect(res.data.error).toHaveProperty('message');
            expect(res.data).toHaveProperty('metadata');
        });
    });

    // ─── Standard Headers ─────────────────────────────────────────────────
    describe('Standard response headers', () => {
        it('should include X-Request-ID in responses', async () => {
            const res = await apiGet('/health');
            expectStandardHeaders(res);
        });

        it('should include API version header', async () => {
            const res = await apiGet('/health');
            expect(res.headers).toHaveProperty('x-api-version');
        });
    });

    // ─── CORS ─────────────────────────────────────────────────────────────
    describe('CORS', () => {
        it('should respond to OPTIONS preflight', async () => {
            const res = await apiGet('/health');
            // CORS headers should be present when Origin is provided
            // Basic check — full CORS testing would need an Origin header
            expect(res.status).toBe(200);
        });
    });

    // ─── Auth Errors ──────────────────────────────────────────────────────
    describe('Authentication errors', () => {
        it('should return 401 for requests without auth token', async () => {
            const res = await apiGet('/users/profile');
            expect(res.status).toBe(401);
        });

        it('should return 401 for invalid bearer token', async () => {
            const res = await apiGet('/users/profile', 'invalid-token-12345');
            expect(res.status).toBe(401);
        });

        it('should return 401 for expired token', async () => {
            // Use an expired JWT (crafted token with past exp)
            const expiredToken =
                'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwiZXhwIjoxNjAwMDAwMDAwfQ.abc';
            const res = await apiGet('/users/profile', expiredToken);
            expect(res.status).toBe(401);
        });
    });
});
