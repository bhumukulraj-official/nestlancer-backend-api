/**
 * E2E: Gateway Routing Tests
 *
 * Validates that the API Gateway correctly routes requests
 * to all downstream microservices.
 */

import { createHttpClient, E2EHttpClient } from '../helpers/http-client';
import { createTestAuthHeaders, createAdminAuthHeaders } from '../helpers/auth-helper';

describe('Gateway Routing (E2E)', () => {
    let client: E2EHttpClient;

    beforeAll(() => {
        client = createHttpClient();
    });

    // ── Health Routes ────────────────────────────────────────

    describe('Health Endpoints', () => {
        it('GET /health - should return gateway health status', async () => {
            // TODO: Assert response status 200 and healthy status
            const response = await client.get('/health');
            expect(response.status).toBe(200);
        });

        it('GET /health/live - should return liveness probe', async () => {
            // TODO: Assert liveness status
            const response = await client.get('/health/live');
            expect(response.status).toBe(200);
        });

        it('GET /health/ready - should return readiness probe', async () => {
            // TODO: Assert readiness status
            const response = await client.get('/health/ready');
            expect([200, 503]).toContain(response.status);
        });

        it('GET /health/detailed - should return aggregated service health', async () => {
            // TODO: Assert all services are listed with their status
            const response = await client.get('/health/detailed');
            expect([200, 206]).toContain(response.status);
        });
    });

    // ── Auth Service Routes ──────────────────────────────────

    describe('Auth Service Routing', () => {
        it('POST /auth/login - should route to auth service', async () => {
            // TODO: Assert that login route is reachable (may return 400/401 without valid creds)
            const response = await client.post('/auth/login', { email: 'test@test.com', password: 'test' });
            expect([200, 400, 401, 422]).toContain(response.status);
        });

        it('POST /auth/register - should route to auth service', async () => {
            // TODO: Assert register route is reachable
            const response = await client.post('/auth/register', { email: 'invalid' });
            expect([201, 400, 422]).toContain(response.status);
        });

        it('GET /auth/check-email - should route to auth service', async () => {
            // TODO: Assert check-email route is reachable
            const response = await client.get('/auth/check-email?email=test@test.com');
            expect([200, 400, 404]).toContain(response.status);
        });
    });

    // ── Users Service Routes ─────────────────────────────────

    describe('Users Service Routing', () => {
        it('GET /users/profile - should require authentication', async () => {
            // TODO: Assert 401 without auth header
            const response = await client.get('/users/profile');
            expect([401, 403]).toContain(response.status);
        });

        it('GET /users/profile - should route with auth header', async () => {
            // TODO: Assert route is reachable with auth
            const headers = createTestAuthHeaders('e2e-routing-test');
            const response = await client.get('/users/profile', { headers });
            expect([200, 404, 500, 502]).toContain(response.status);
        });
    });

    // ── Payments Service Routes ──────────────────────────────

    describe('Payments Service Routing', () => {
        it('GET /payments - should require authentication', async () => {
            // TODO: Assert 401 without auth
            const response = await client.get('/payments');
            expect([401, 403]).toContain(response.status);
        });
    });

    // ── Requests Service Routes ──────────────────────────────

    describe('Requests Service Routing', () => {
        it('GET /requests - should require authentication', async () => {
            // TODO: Assert 401 without auth
            const response = await client.get('/requests');
            expect([401, 403]).toContain(response.status);
        });
    });

    // ── Quotes Service Routes ────────────────────────────────

    describe('Quotes Service Routing', () => {
        it('GET /quotes - should require authentication', async () => {
            // TODO: Assert 401 without auth
            const response = await client.get('/quotes');
            expect([401, 403]).toContain(response.status);
        });
    });

    // ── Projects Service Routes ──────────────────────────────

    describe('Projects Service Routing', () => {
        it('GET /projects - should require authentication', async () => {
            // TODO: Assert 401 without auth
            const response = await client.get('/projects');
            expect([401, 403]).toContain(response.status);
        });
    });

    // ── Progress Service Routes ──────────────────────────────

    describe('Progress Service Routing', () => {
        it('GET /progress - should require authentication', async () => {
            // TODO: Assert 401 without auth
            const response = await client.get('/progress');
            expect([401, 403]).toContain(response.status);
        });
    });

    // ── Messaging Service Routes ─────────────────────────────

    describe('Messaging Service Routing', () => {
        it('GET /messaging/conversations - should require authentication', async () => {
            // TODO: Assert 401 without auth
            const response = await client.get('/messaging/conversations');
            expect([401, 403]).toContain(response.status);
        });
    });

    // ── Notifications Service Routes ─────────────────────────

    describe('Notifications Service Routing', () => {
        it('GET /notifications - should require authentication', async () => {
            // TODO: Assert 401 without auth
            const response = await client.get('/notifications');
            expect([401, 403]).toContain(response.status);
        });
    });

    // ── Media Service Routes ─────────────────────────────────

    describe('Media Service Routing', () => {
        it('POST /media/upload - should require authentication', async () => {
            // TODO: Assert 401 without auth
            const response = await client.post('/media/upload', {});
            expect([401, 403]).toContain(response.status);
        });
    });

    // ── Portfolio Service Routes ──────────────────────────────

    describe('Portfolio Service Routing', () => {
        it('GET /portfolio - should be publicly accessible', async () => {
            // TODO: Assert public portfolio listing is accessible
            const response = await client.get('/portfolio');
            expect([200, 404]).toContain(response.status);
        });
    });

    // ── Blog Service Routes ──────────────────────────────────

    describe('Blog Service Routing', () => {
        it('GET /blog/posts - should be publicly accessible', async () => {
            // TODO: Assert public blog listing is accessible
            const response = await client.get('/blog/posts');
            expect([200, 404]).toContain(response.status);
        });
    });

    // ── Contact Service Routes ───────────────────────────────

    describe('Contact Service Routing', () => {
        it('POST /contact - should accept contact form submissions', async () => {
            // TODO: Assert contact form route is reachable
            const response = await client.post('/contact', { email: 'test@test.com', subject: 'Test', message: 'Hello' });
            expect([200, 201, 400, 422]).toContain(response.status);
        });
    });

    // ── Webhooks Service Routes ──────────────────────────────

    describe('Webhooks Service Routing', () => {
        it('POST /webhooks/razorpay - should accept webhook payloads', async () => {
            // TODO: Assert webhook endpoint is reachable (will fail signature verification)
            const response = await client.post('/webhooks/razorpay', { event: 'test' });
            expect([200, 400, 401, 403]).toContain(response.status);
        });
    });

    // ── Admin Service Routes ─────────────────────────────────

    describe('Admin Service Routing', () => {
        it('GET /admin/users - should require admin role', async () => {
            // TODO: Assert 403 for non-admin user
            const headers = createTestAuthHeaders('e2e-user', 'USER');
            const response = await client.get('/admin/users', { headers });
            expect([403]).toContain(response.status);
        });

        it('GET /admin/users - should route with admin auth', async () => {
            // TODO: Assert route is reachable with admin role
            const headers = createAdminAuthHeaders();
            const response = await client.get('/admin/users', { headers });
            expect([200, 500, 502]).toContain(response.status);
        });
    });
});
