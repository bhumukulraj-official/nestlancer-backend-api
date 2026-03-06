/**
 * Suite 07 — Progress Service E2E Tests (P1)
 *
 * Covers progress entry creation, visibility rules, and timeline retrieval.
 */

import {
    apiGet,
    apiPost,
    apiPatch,
    expectSuccessResponse,
    loginAsAdmin,
    loginAsClient,
} from '../setup/test-helpers';
import { SAMPLE_REQUEST, SAMPLE_QUOTE } from '../setup/seed-data';

describe('[E2E] Progress Service', () => {
    let clientToken: string;
    let adminToken: string;
    let projectId: string;
    let milestoneId: string;

    beforeAll(async () => {
        clientToken = await loginAsClient();
        adminToken = await loginAsAdmin();

        // Create a project through the full flow
        const reqRes = await apiPost('/requests', { ...SAMPLE_REQUEST, title: 'Progress E2E' }, clientToken);
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

        if (projectId) {
            await apiPatch(`/admin/projects/${projectId}/status`, { status: 'in_progress' }, adminToken);
            const msRes = await apiPost(
                `/admin/projects/${projectId}/milestones`,
                { name: 'Progress MS', order: 1 },
                adminToken,
            );
            milestoneId = msRes.data.data?.id;
        }
    });

    // ─── Admin: Add Progress Entries ──────────────────────────────────────
    describe('POST /admin/progress', () => {
        it('should add a project-level progress entry', async () => {
            if (!projectId) return;
            const res = await apiPost(
                '/admin/progress',
                {
                    projectId,
                    type: 'statusUpdate',
                    title: 'Project kicked off',
                    description: 'Initial phase started.',
                    visibility: 'client',
                },
                adminToken,
            );
            expect(res.status).toBe(201);
        });

        it('should add an internal-only progress entry', async () => {
            if (!projectId) return;
            const res = await apiPost(
                '/admin/progress',
                {
                    projectId,
                    type: 'note',
                    title: 'Internal Note',
                    description: 'Client needs extra attention.',
                    visibility: 'internal',
                },
                adminToken,
            );
            expect(res.status).toBe(201);
        });

        it('should add a milestone-level progress entry', async () => {
            if (!projectId || !milestoneId) return;
            const res = await apiPost(
                '/admin/progress',
                {
                    projectId,
                    milestoneId,
                    type: 'milestoneUpdate',
                    title: 'Milestone started',
                    visibility: 'client',
                },
                adminToken,
            );
            expect(res.status).toBe(201);
        });
    });

    // ─── Client: View Progress ────────────────────────────────────────────
    describe('GET /progress/projects/:id', () => {
        it('should return client-visible progress entries only', async () => {
            if (!projectId) return;
            const res = await apiGet(`/progress/projects/${projectId}`, clientToken);
            expect(res.status).toBe(200);
            const entries = res.data.data || [];
            // Internal entries should NOT appear for the client
            const internalEntries = entries.filter((e: any) => e.visibility === 'internal');
            expect(internalEntries.length).toBe(0);
        });
    });

    // ─── Timeline ─────────────────────────────────────────────────────────
    describe('GET /progress/projects/:id/timeline', () => {
        it('should return the project timeline', async () => {
            if (!projectId) return;
            const res = await apiGet(`/progress/projects/${projectId}/timeline`, clientToken);
            expect(res.status).toBe(200);
        });
    });
});
