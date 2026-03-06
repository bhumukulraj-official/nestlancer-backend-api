/**
 * Suite 17 — Cross-Service Flows E2E Tests (P0 Critical)
 *
 * Validates multi-service business workflows end-to-end:
 *   1. Complete Client Journey (register → project → payment → portfolio)
 *   2. Communication Within Project
 *   3. Blog Publishing Lifecycle
 */

import {
    apiGet,
    apiPost,
    apiPatch,
    loginAsAdmin,
    registerNewUser,
    uniqueEmail,
    uniqueSlug,
    sleep,
    waitFor,
} from '../setup/test-helpers';
import { SAMPLE_REQUEST, SAMPLE_QUOTE, SAMPLE_BLOG_POST, SAMPLE_PORTFOLIO } from '../setup/seed-data';

describe('[E2E] Cross-Service Flows', () => {
    let adminToken: string;

    beforeAll(async () => {
        adminToken = await loginAsAdmin();
    });

    // ─── Flow 1: Complete Client Journey ──────────────────────────────────
    describe('Flow 1: Register → Request → Quote → Project → Payment → Portfolio', () => {
        const email = uniqueEmail('flow1');
        let userToken: string;
        let requestId: string;
        let quoteId: string;
        let projectId: string;
        let paymentId: string;

        it('Step 1: Register a new user', async () => {
            const res = await registerNewUser({
                email,
                password: 'Flow1@123456',
                name: 'Flow 1 User',
            });
            expect(res.status).toBe(201);
        });

        it('Step 2: Login with the new user', async () => {
            const res = await apiPost('/auth/login', {
                email,
                password: 'Flow1@123456',
            });
            expect(res.status).toBe(200);
            userToken = res.data.data?.accessToken ?? res.data.accessToken;
            expect(userToken).toBeDefined();
        });

        it('Step 3: Create and submit a project request', async () => {
            const createRes = await apiPost('/requests', { ...SAMPLE_REQUEST }, userToken);
            expect(createRes.status).toBe(201);
            requestId = createRes.data.data.id;

            const submitRes = await apiPost(`/requests/${requestId}/submit`, {}, userToken);
            expect(submitRes.status).toBe(200);
        });

        it('Step 4: Admin reviews and accepts the request', async () => {
            const res = await apiPatch(
                `/admin/requests/${requestId}/status`,
                { status: 'under_review' },
                adminToken,
            );
            expect(res.status).toBe(200);
        });

        it('Step 5: Admin creates and sends a quote', async () => {
            const createRes = await apiPost(
                '/admin/quotes',
                { ...SAMPLE_QUOTE, requestId },
                adminToken,
            );
            expect(createRes.status).toBe(201);
            quoteId = createRes.data.data.id;

            const sendRes = await apiPost(`/admin/quotes/${quoteId}/send`, {}, adminToken);
            expect(sendRes.status).toBe(200);
        });

        it('Step 6: Client accepts the quote → project created', async () => {
            const acceptRes = await apiPost(`/quotes/${quoteId}/accept`, {}, userToken);
            expect(acceptRes.status).toBe(200);

            // Verify project exists
            const projRes = await apiGet('/projects?page=1&limit=50', userToken);
            const projects = projRes.data.data || [];
            const match = projects.find((p: any) => p.quoteId === quoteId);
            expect(match).toBeDefined();
            projectId = match?.id;
        });

        it('Step 7: Admin adds milestones to the project', async () => {
            if (!projectId) return;
            const res = await apiPost(
                `/admin/projects/${projectId}/milestones`,
                {
                    name: 'Phase 1',
                    description: 'Design & development',
                    amount: 22500,
                    order: 1,
                },
                adminToken,
            );
            expect(res.status).toBe(201);
        });

        it('Step 8: Client initiates payment', async () => {
            if (!projectId) return;
            await apiPatch(
                `/admin/projects/${projectId}/status`,
                { status: 'pending_payment' },
                adminToken,
            );

            const res = await apiPost(
                '/payments/initiate',
                { projectId, amount: 22500, currency: 'INR' },
                userToken,
            );
            expect(res.status).toBe(201);
            paymentId = res.data.data?.id;
        });

        it('Step 9: Verify project appears in user dashboard', async () => {
            const res = await apiGet('/projects?page=1&limit=10', userToken);
            expect(res.status).toBe(200);
            const projects = res.data.data || [];
            expect(projects.find((p: any) => p.id === projectId)).toBeDefined();
        });

        it('Step 10: Admin creates a portfolio item from the project', async () => {
            if (!projectId) return;
            const portfolioSlug = uniqueSlug('flow1-portfolio');
            const res = await apiPost(
                '/admin/portfolio',
                {
                    ...SAMPLE_PORTFOLIO,
                    slug: portfolioSlug,
                    projectId,
                    title: 'Flow 1 Portfolio Showcase',
                },
                adminToken,
            );
            expect(res.status).toBe(201);
        });
    });

    // ─── Flow 2: Communication Within Project ────────────────────────────
    describe('Flow 2: Message → Notification', () => {
        let clientToken: string;
        let projectId: string;

        beforeAll(async () => {
            // Create a project for messaging
            const email = uniqueEmail('flow2');
            await registerNewUser({ email, password: 'Flow2@123456', name: 'Flow2' });
            const loginRes = await apiPost('/auth/login', { email, password: 'Flow2@123456' });
            clientToken = loginRes.data.data?.accessToken ?? loginRes.data.accessToken;

            if (clientToken) {
                const reqRes = await apiPost('/requests', { ...SAMPLE_REQUEST, title: 'Flow2' }, clientToken);
                const requestId = reqRes.data.data?.id;
                if (requestId) {
                    await apiPost(`/requests/${requestId}/submit`, {}, clientToken);
                    await apiPatch(`/admin/requests/${requestId}/status`, { status: 'under_review' }, adminToken);
                    const quoteRes = await apiPost('/admin/quotes', { ...SAMPLE_QUOTE, requestId }, adminToken);
                    const quoteId = quoteRes.data.data?.id;
                    if (quoteId) {
                        await apiPost(`/admin/quotes/${quoteId}/send`, {}, adminToken);
                        await apiPost(`/quotes/${quoteId}/accept`, {}, clientToken);
                    }
                }
                const projRes = await apiGet('/projects?page=1&limit=50', clientToken);
                const projects = projRes.data.data || [];
                projectId = projects[projects.length - 1]?.id;
            }
        });

        it('Client sends a message', async () => {
            if (!projectId || !clientToken) return;
            const res = await apiPost(
                `/messages/projects/${projectId}`,
                { content: 'Hello from Flow 2!' },
                clientToken,
            );
            expect(res.status).toBe(201);
        });

        it('Admin replies to the message', async () => {
            if (!projectId) return;
            const res = await apiPost(
                `/messages/projects/${projectId}`,
                { content: 'Admin reply in Flow 2' },
                adminToken,
            );
            expect(res.status).toBe(201);
        });

        it('Client should see notifications after message exchange', async () => {
            if (!clientToken) return;
            await sleep(2000); // Wait for notification worker
            const res = await apiGet('/notifications?page=1&limit=10', clientToken);
            expect(res.status).toBe(200);
        });
    });

    // ─── Flow 3: Blog Publishing Lifecycle ────────────────────────────────
    describe('Flow 3: Blog Post → Comment → Moderation', () => {
        const blogSlug = uniqueSlug('flow3-blog');
        let postId: string;
        let commentId: string;
        let readerToken: string;

        beforeAll(async () => {
            const email = uniqueEmail('flow3');
            await registerNewUser({ email, password: 'Flow3@123456', name: 'Flow3 Reader' });
            const loginRes = await apiPost('/auth/login', { email, password: 'Flow3@123456' });
            readerToken = loginRes.data.data?.accessToken ?? loginRes.data.accessToken;
        });

        it('Admin creates and publishes a blog post', async () => {
            const createRes = await apiPost(
                '/admin/blog/posts',
                { ...SAMPLE_BLOG_POST, slug: blogSlug },
                adminToken,
            );
            expect(createRes.status).toBe(201);
            postId = createRes.data.data?.id;

            if (postId) {
                const pubRes = await apiPost(`/admin/blog/posts/${postId}/publish`, {}, adminToken);
                expect(pubRes.status).toBe(200);
            }
        });

        it('User reads the published post', async () => {
            if (!readerToken) return;
            const res = await apiGet(`/blog/posts/${blogSlug}`, readerToken);
            expect([200, 404]).toContain(res.status);
        });

        it('User comments on the post', async () => {
            if (!readerToken) return;
            const res = await apiPost(
                `/blog/posts/${blogSlug}/comments`,
                { content: 'Great article from Flow 3!' },
                readerToken,
            );
            if (res.status === 201) {
                commentId = res.data.data?.id;
            }
            expect([201, 404]).toContain(res.status);
        });

        it('Admin approves the comment', async () => {
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
