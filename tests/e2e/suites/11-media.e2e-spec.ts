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
    let mediaId: string;

    beforeAll(async () => {
        clientToken = await loginAsClient();
        adminToken = await loginAsAdmin();
    });

    // ─── Presigned Upload ─────────────────────────────────────────────────
    describe('POST /media/presign', () => {
        it('should return a presigned upload URL for a valid file', async () => {
            const res = await apiPost(
                '/media/presign',
                {
                    filename: 'e2e-test-image.png',
                    mimeType: 'image/png',
                    sizeBytes: 1024 * 100, // 100KB
                },
                clientToken,
            );
            expect(res.status).toBe(200);
            expect(res.data.data).toHaveProperty('uploadUrl');
            expect(res.data.data).toHaveProperty('id');
            mediaId = res.data.data.id;
        });

        it('should reject an unsupported file type', async () => {
            const res = await apiPost(
                '/media/presign',
                {
                    filename: 'malware.exe',
                    mimeType: 'application/x-msdownload',
                    sizeBytes: 1024,
                },
                clientToken,
            );
            expect([400, 422]).toContain(res.status);
        });

        it('should reject a file exceeding size limit', async () => {
            const res = await apiPost(
                '/media/presign',
                {
                    filename: 'huge-file.zip',
                    mimeType: 'application/zip',
                    sizeBytes: 500 * 1024 * 1024, // 500 MB
                },
                clientToken,
            );
            expect([400, 413, 422]).toContain(res.status);
        });
    });

    // ─── Get Media Details ────────────────────────────────────────────────
    describe('GET /media/:id', () => {
        it('should return media details', async () => {
            if (!mediaId) return;
            const res = await apiGet(`/media/${mediaId}`, clientToken);
            expectSuccessResponse(res, 200);
            expect(res.data.data).toHaveProperty('id', mediaId);
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

    // ─── Admin ────────────────────────────────────────────────────────────
    describe('GET /admin/media (Admin)', () => {
        it('should list all media files', async () => {
            const res = await apiGet('/admin/media?page=1&limit=10', adminToken);
            expectPaginatedResponse(res);
        });
    });
});
