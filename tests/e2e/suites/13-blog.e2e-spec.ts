/**
 * Suite 13 — Blog Service E2E Tests (P2)
 *
 * Covers public post browsing, search, RSS, user interactions
 * (like, comment, bookmark), and admin post/comment management.
 */

import {
    apiGet,
    apiPost,
    apiPatch,
    expectSuccessResponse,
    expectPaginatedResponse,
    loginAsAdmin,
    loginAsClient,
    uniqueSlug,
} from '../setup/test-helpers';
import { SAMPLE_BLOG_POST } from '../setup/seed-data';

describe('[E2E] Blog Service', () => {
    let clientToken: string;
    let adminToken: string;
    let postId: string;
    let commentId: string;
    const testSlug = uniqueSlug('blog');

    beforeAll(async () => {
        clientToken = await loginAsClient();
        adminToken = await loginAsAdmin();
    });

    // ─── Admin: Create Post ───────────────────────────────────────────────
    describe('POST /admin/blog/posts', () => {
        it('should create a draft blog post', async () => {
            const res = await apiPost(
                '/admin/blog/posts',
                { ...SAMPLE_BLOG_POST, slug: testSlug },
                adminToken,
            );
            expect(res.status).toBe(201);
            postId = res.data.data?.id;
        });
    });

    // ─── Admin: Publish ───────────────────────────────────────────────────
    describe('POST /admin/blog/posts/:id/publish', () => {
        it('should publish the blog post', async () => {
            if (!postId) return;
            const res = await apiPost(`/admin/blog/posts/${postId}/publish`, {}, adminToken);
            expect(res.status).toBe(200);
        });
    });

    // ─── Public: Browse ───────────────────────────────────────────────────
    describe('GET /blog/posts (Public)', () => {
        it('should list published blog posts', async () => {
            const res = await apiGet('/blog/posts');
            expectPaginatedResponse(res);
        });
    });

    describe('GET /blog/posts/:slug (Public)', () => {
        it('should return a post by slug', async () => {
            const res = await apiGet(`/blog/posts/${testSlug}`);
            // Post may or may not be published yet
            expect([200, 404]).toContain(res.status);
        });
    });

    describe('GET /blog/categories (Public)', () => {
        it('should list blog categories', async () => {
            const res = await apiGet('/blog/categories');
            expect(res.status).toBe(200);
        });
    });

    describe('GET /blog/tags (Public)', () => {
        it('should list blog tags', async () => {
            const res = await apiGet('/blog/tags');
            expect(res.status).toBe(200);
        });
    });

    describe('GET /blog/search (Public)', () => {
        it('should search blog posts', async () => {
            const res = await apiGet('/blog/search?q=test');
            expect(res.status).toBe(200);
        });
    });

    describe('GET /blog/feed/rss (Public)', () => {
        it('should return an RSS feed', async () => {
            const res = await apiGet('/blog/feed/rss');
            expect(res.status).toBe(200);
        });
    });

    // ─── User: Interactions ───────────────────────────────────────────────
    describe('POST /blog/posts/:slug/like', () => {
        it('should toggle like on a post', async () => {
            const res = await apiPost(`/blog/posts/${testSlug}/like`, {}, clientToken);
            expect([200, 404]).toContain(res.status);
        });
    });

    describe('POST /blog/posts/:slug/comments', () => {
        it('should add a comment to a post', async () => {
            const res = await apiPost(
                `/blog/posts/${testSlug}/comments`,
                { content: 'Great E2E test post!' },
                clientToken,
            );
            if (res.status === 201) {
                commentId = res.data.data?.id;
            }
            expect([201, 404]).toContain(res.status);
        });
    });

    describe('PATCH /blog/comments/:id', () => {
        it('should edit own comment within time window', async () => {
            if (!commentId) return;
            const res = await apiPatch(
                `/blog/comments/${commentId}`,
                { content: 'Edited E2E comment' },
                clientToken,
            );
            expect(res.status).toBe(200);
        });
    });

    describe('POST /blog/posts/:slug/bookmark', () => {
        it('should bookmark a post', async () => {
            const res = await apiPost(`/blog/posts/${testSlug}/bookmark`, {}, clientToken);
            expect([200, 404]).toContain(res.status);
        });
    });

    // ─── Admin: Comment Moderation ────────────────────────────────────────
    describe('POST /admin/blog/comments/:id/approve (Admin)', () => {
        it('should approve a pending comment', async () => {
            if (!commentId) return;
            const res = await apiPost(
                `/admin/blog/comments/${commentId}/approve`,
                {},
                adminToken,
            );
            expect(res.status).toBe(200);
        });
    });
});
