/**
 * Suite 06 — Projects Service E2E Tests (P0 Critical)
 *
 * Covers project listing, detail views, admin status management,
 * milestones, deliverables, and status transitions.
 */

import {
    apiGet,
    apiPost,
    apiPatch,
    expectSuccessResponse,
    expectPaginatedResponse,
    loginAsAdmin,
    loginAsClient,
} from '../setup/test-helpers';
import { SAMPLE_REQUEST, SAMPLE_QUOTE } from '../setup/seed-data';

describe('[E2E] Projects Service', () => {
    let clientToken: string;
    let adminToken: string;
    let projectId: string;
    let milestoneId: string;

    beforeAll(async () => {
        clientToken = await loginAsClient();
        adminToken = await loginAsAdmin();

        // Create a project via the full request → quote → accept flow
        const reqRes = await apiPost('/requests', { ...SAMPLE_REQUEST, title: 'Project E2E' }, clientToken);
        const requestId = reqRes.data.data?.id;
        if (requestId) {
            await apiPost(`/requests/${requestId}/submit`, {}, clientToken);
            await apiPatch(`/admin/requests/${requestId}/status`, { status: 'under_review' }, adminToken);

            const quoteRes = await apiPost(
                '/admin/quotes',
                { ...SAMPLE_QUOTE, requestId, title: 'Project E2E Quote' },
                adminToken,
            );
            const quoteId = quoteRes.data.data?.id;
            if (quoteId) {
                await apiPost(`/admin/quotes/${quoteId}/send`, {}, adminToken);
                await apiPost(`/quotes/${quoteId}/accept`, {}, clientToken);
            }
        }

        // Retrieve the created project
        const listRes = await apiGet('/projects?page=1&limit=50', clientToken);
        const projects = listRes.data.data || [];
        projectId = projects[projects.length - 1]?.id;
    });

    // ─── Client: List & Details ────────────────────────────────────────────
    describe('GET /projects/stats', () => {
        it('should return user project stats', async () => {
            const res = await apiGet('/projects/stats', clientToken);
            expect(res.status).toBe(200);
        });
    });

    describe('GET /projects', () => {
        it('should list user projects with pagination', async () => {
            const res = await apiGet('/projects?page=1&limit=10', clientToken);
            expectPaginatedResponse(res);
        });
    });

    describe('GET /projects/:id', () => {
        it('should return project details', async () => {
            if (!projectId) return;
            const res = await apiGet(`/projects/${projectId}`, clientToken);
            expectSuccessResponse(res, 200);
            expect(res.data.data).toHaveProperty('id', projectId);
        });
    });

    // ─── Admin: Status Management ──────────────────────────────────────────
    describe('PATCH /admin/projects/:id/status', () => {
        it('should transition project to in_progress', async () => {
            if (!projectId) return;
            const res = await apiPatch(
                `/admin/projects/${projectId}/status`,
                { status: 'in_progress' },
                adminToken,
            );
            expect(res.status).toBe(200);
        });

        it('should reject an invalid status transition', async () => {
            if (!projectId) return;
            const res = await apiPatch(
                `/admin/projects/${projectId}/status`,
                { status: 'created' }, // Cannot go back to created
                adminToken,
            );
            expect([400, 422]).toContain(res.status);
        });
    });

    // ─── Admin: Milestones ─────────────────────────────────────────────────
    describe('POST /admin/projects/:id/milestones', () => {
        it('should add a milestone to the project', async () => {
            if (!projectId) return;
            const res = await apiPost(
                `/admin/projects/${projectId}/milestones`,
                {
                    name: 'Phase 1 – Design',
                    description: 'UI/UX design phase',
                    amount: 22500,
                    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
                    order: 1,
                },
                adminToken,
            );
            expect(res.status).toBe(201);
            milestoneId = res.data.data?.id;
        });
    });

    describe('PATCH /admin/milestones/:id/status', () => {
        it('should update milestone status to in_progress', async () => {
            if (!milestoneId) return;
            const res = await apiPatch(
                `/admin/milestones/${milestoneId}/status`,
                { status: 'in_progress' },
                adminToken,
            );
            expect(res.status).toBe(200);
        });
    });

    // ─── Admin: Deliverables ───────────────────────────────────────────────
    describe('POST /admin/milestones/:id/deliverables', () => {
        it('should add a deliverable to the milestone', async () => {
            if (!milestoneId) return;
            const res = await apiPost(
                `/admin/milestones/${milestoneId}/deliverables`,
                {
                    name: 'Wireframes',
                    description: 'Low-fidelity wireframes for all pages',
                    priority: 'high',
                },
                adminToken,
            );
            expect(res.status).toBe(201);
        });
    });

    describe('GET /projects/:id/progress', () => {
        it('should return project progress', async () => {
            if (!projectId) return;
            const res = await apiGet(`/projects/${projectId}/progress`, clientToken);
            expect(res.status).toBe(200);
        });
    });

    describe('GET /projects/:id/deliverables', () => {
        it('should return project deliverables', async () => {
            if (!projectId) return;
            const res = await apiGet(`/projects/${projectId}/deliverables`, clientToken);
            expect(res.status).toBe(200);
        });
    });

    describe('GET /projects/:id/team', () => {
        it('should return project team', async () => {
            if (!projectId) return;
            const res = await apiGet(`/projects/${projectId}/team`, clientToken);
            expect(res.status).toBe(200);
        });
    });

    // ─── Admin: Complete Project ───────────────────────────────────────────
    describe('Project completion flow', () => {
        it('should be able to mark project as completed', async () => {
            if (!projectId) return;
            // Complete milestone first
            if (milestoneId) {
                await apiPatch(
                    `/admin/milestones/${milestoneId}/status`,
                    { status: 'completed' },
                    adminToken,
                );
            }
            // Then move project to review → completed
            await apiPatch(`/admin/projects/${projectId}/status`, { status: 'review' }, adminToken);
            const res = await apiPatch(
                `/admin/projects/${projectId}/status`,
                { status: 'completed' },
                adminToken,
            );
            expect(res.status).toBe(200);
        });
    });
});
