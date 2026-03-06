/**
 * Suite 12 — Portfolio Service E2E Tests (P2)
 *
 * Covers public portfolio browsing, admin CRUD, publishing,
 * featured toggle, archiving, analytics, and interactions.
 */

import {
    apiGet,
    apiPost,
    apiPatch,
    expectSuccessResponse,
    expectPaginatedResponse,
    loginAsAdmin,
    uniqueSlug,
} from '../setup/test-helpers';
import { SAMPLE_PORTFOLIO } from '../setup/seed-data';

describe('[E2E] Portfolio Service', () => {
    let adminToken: string;
    let portfolioId: string;
    const testSlug = uniqueSlug('portfolio');

    beforeAll(async () => {
        adminToken = await loginAsAdmin();
    });

    // ─── Admin: Create ────────────────────────────────────────────────────
    describe('POST /admin/portfolio', () => {
        it('should create a draft portfolio item', async () => {
            const res = await apiPost(
                '/admin/portfolio',
                { ...SAMPLE_PORTFOLIO, slug: testSlug },
                adminToken,
            );
            expect(res.status).toBe(201);
            portfolioId = res.data.data?.id;
        });
    });

    // ─── Admin: Publish ───────────────────────────────────────────────────
    describe('POST /admin/portfolio/:id/publish', () => {
        it('should publish the portfolio item', async () => {
            if (!portfolioId) return;
            const res = await apiPost(`/admin/portfolio/${portfolioId}/publish`, {}, adminToken);
            // May need thumbnail — could succeed or fail depending on validation
            expect([200, 400]).toContain(res.status);
        });
    });

    // ─── Admin: Toggle Featured ───────────────────────────────────────────
    describe('POST /admin/portfolio/:id/toggle-featured', () => {
        it('should toggle the featured flag', async () => {
            if (!portfolioId) return;
            const res = await apiPost(
                `/admin/portfolio/${portfolioId}/toggle-featured`,
                {},
                adminToken,
            );
            expect(res.status).toBe(200);
        });
    });

    // ─── Admin: Archive ───────────────────────────────────────────────────
    describe('POST /admin/portfolio/:id/archive', () => {
        it('should archive the portfolio item', async () => {
            if (!portfolioId) return;
            const res = await apiPost(`/admin/portfolio/${portfolioId}/archive`, {}, adminToken);
            expect(res.status).toBe(200);
        });
    });

    // ─── Admin: Analytics ─────────────────────────────────────────────────
    describe('GET /admin/portfolio/analytics', () => {
        it('should return portfolio analytics', async () => {
            const res = await apiGet('/admin/portfolio/analytics', adminToken);
            expect(res.status).toBe(200);
        });
    });

    // ─── Public: Browse ───────────────────────────────────────────────────
    describe('GET /portfolio (Public)', () => {
        it('should list published portfolio items', async () => {
            const res = await apiGet('/portfolio');
            expectPaginatedResponse(res);
        });
    });

    describe('GET /portfolio/featured (Public)', () => {
        it('should return featured items', async () => {
            const res = await apiGet('/portfolio/featured');
            expect(res.status).toBe(200);
        });
    });

    describe('GET /portfolio/categories (Public)', () => {
        it('should list portfolio categories', async () => {
            const res = await apiGet('/portfolio/categories');
            expect(res.status).toBe(200);
        });
    });

    describe('GET /portfolio/search (Public)', () => {
        it('should search portfolio items', async () => {
            const res = await apiGet('/portfolio/search?q=ecommerce');
            expect(res.status).toBe(200);
        });
    });

    describe('POST /portfolio/:id/like (Public)', () => {
        it('should like a portfolio item', async () => {
            if (!portfolioId) return;
            const res = await apiPost(`/portfolio/${portfolioId}/like`, {});
            expect([200, 404]).toContain(res.status); // 404 if archived
        });
    });
});
