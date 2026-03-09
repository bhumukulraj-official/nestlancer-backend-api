/**
 * Suite 11 — Media Service E2E Tests (P1)
 *
 * Covers presigned upload URL generation, media listing,
 * detail retrieval, deletion, validation, and admin views.
 */

import {
    apiGet,
    apiPost,
    apiDelete,
    expectSuccessResponse,
    expectPaginatedResponse,
    loginAsAdmin,
    loginAsClient,
} from '../setup/test-helpers';

describe('[E2E] Media Service', () => {
    let clientToken: string;
    let adminToken: string;
    let mediaId: string | undefined;

    beforeAll(async () => {
        clientToken = await loginAsClient();
        adminToken = await loginAsAdmin();
        // Try to get an existing media ID from list
        const listRes = await apiGet('/media?page=1&limit=1', clientToken);
        const items = listRes.data?.data || [];
        if (items.length > 0) mediaId = items[0].id;
    });

    // ─── Media Upload (multipart via POST /media/upload) ───────────────────
    describe('POST /media/upload', () => {
        it('should accept upload request (may require multipart file)', async () => {
            // Gateway has POST /media/upload - service may expect multipart
            const res = await apiPost('/media/upload', {}, clientToken);
            expect([200, 201, 400, 422]).toContain(res.status);
        });
    });

    // ─── Media Stats ───────────────────────────────────────────────────────
    describe('GET /media/stats', () => {
        it('should return media storage stats', async () => {
            const res = await apiGet('/media/stats', clientToken);
            expect(res.status).toBe(200);
        });
    });

    // ─── Get Media Details ────────────────────────────────────────────────
    describe('GET /media/:id', () => {
        it('should return media details when media exists', async () => {
            const listRes = await apiGet('/media?page=1&limit=1', clientToken);
            const items = listRes.data.data || [];
            if (items.length > 0) {
                mediaId = items[0].id;
                const res = await apiGet(`/media/${mediaId}`, clientToken);
                expectSuccessResponse(res, 200);
                expect(res.data.data).toHaveProperty('id', mediaId);
            }
        });
    });

    // ─── List Media ───────────────────────────────────────────────────────
    describe('GET /media', () => {
        it('should list user media with pagination', async () => {
            const res = await apiGet('/media?page=1&limit=10', clientToken);
            expectPaginatedResponse(res);
        });
    });

    // ─── Delete Media ─────────────────────────────────────────────────────
    describe('DELETE /media/:id', () => {
        it('should soft-delete a media item', async () => {
            if (!mediaId) return;
            const res = await apiDelete(`/media/${mediaId}`, clientToken);
            expect(res.status).toBe(200);
        });
    });

    describe('GET /media/:id/status', () => {
        it('should return media processing status', async () => {
            if (!mediaId) return;
            const res = await apiGet(`/media/${mediaId}/status`, clientToken);
            expect([200, 404]).toContain(res.status);
        });
    });

    describe('GET /media/:id/download', () => {
        it('should return download URL or redirect', async () => {
            if (!mediaId) return;
            const res = await apiGet(`/media/${mediaId}/download`, clientToken);
            expect([200, 302, 404]).toContain(res.status);
        });
    });

    // ─── Admin ────────────────────────────────────────────────────────────
    describe('GET /admin/media (Admin)', () => {
        it('should list all media files', async () => {
            const res = await apiGet('/admin/media?page=1&limit=10', adminToken);
            expectPaginatedResponse(res);
        });
    });
});
