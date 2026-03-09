/**
 * Suite 01 — Health Service E2E Tests (P3)
 *
 * Verifies that the API Gateway correctly proxies health-check
 * requests and that every downstream service reports UP.
 */

import { apiGet, expectSuccessResponse, expectStandardHeaders } from '../setup/test-helpers';

describe('[E2E] Health Service', () => {
    describe('GET /health', () => {
        it('should return 200 with success status', async () => {
            const res = await apiGet('/health');
            expectSuccessResponse(res, 200);
        });

        it('should include standard response headers', async () => {
            const res = await apiGet('/health');
            expectStandardHeaders(res);
        });
    });

    describe('GET /health/detailed', () => {
        it('should return detailed health status for all infrastructure', async () => {
            const res = await apiGet('/health/detailed');
            expect(res.status).toBe(200);
            expect(res.data).toHaveProperty('status', 'success');
            expect(res.data).toHaveProperty('data');
        });
    });

    describe('Service-level health endpoints', () => {
        const services = [
            'auth',
            'users',
            'requests',
            'quotes',
            'projects',
            'progress',
            'payments',
            'messages',
            'notifications',
            'media',
            'portfolio',
            'blog',
            'contact',
            'admin',
            'webhooks',
        ];

        it.each(services)('GET /%s/health should return 200', async (service) => {
            const res = await apiGet(`/${service}/health`);
            expect(res.status).toBe(200);
        });
    });

    describe('Additional health endpoints', () => {
        it('GET /health/ready should return readiness status', async () => {
            const res = await apiGet('/health/ready');
            expect(res.status).toBe(200);
            expect(res.data).toHaveProperty('status');
        });

        it('GET /health/live should return liveness status', async () => {
            const res = await apiGet('/health/live');
            expect(res.status).toBe(200);
            // Gateway wraps responses in { status: 'success', data, metadata }; payload is in res.data.data
            const payload = res.data.data ?? res.data;
            expect(payload).toHaveProperty('status', 'alive');
        });

        it('GET /health/dependencies should return dependency health', async () => {
            const res = await apiGet('/health/dependencies');
            expect(res.status).toBe(200);
        });
    });
});
