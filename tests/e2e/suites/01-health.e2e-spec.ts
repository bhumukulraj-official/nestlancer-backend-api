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
});
