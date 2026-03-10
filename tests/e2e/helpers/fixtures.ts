/**
 * E2E Test Fixtures
 *
 * Shared test data constants for E2E tests.
 * All payloads use unique identifiers to avoid collisions.
 */

// ── User Fixtures ────────────────────────────────────────────

export const TEST_USER = {
    email: 'e2e-testuser@nestlancer.test',
    password: 'E2eTest!Pass123',
    firstName: 'E2E',
    lastName: 'TestUser',
    acceptTerms: true,
};

export const TEST_ADMIN = {
    email: 'e2e-admin@nestlancer.test',
    password: 'E2eAdmin!Pass123',
    firstName: 'E2E',
    lastName: 'Admin',
    acceptTerms: true,
};

export const TEST_LANCER = {
    email: 'e2e-lancer@nestlancer.test',
    password: 'E2eLancer!Pass123',
    firstName: 'E2E',
    lastName: 'Lancer',
    acceptTerms: true,
};

export const TEST_CLIENT = {
    email: 'e2e-client@nestlancer.test',
    password: 'E2eClient!Pass123',
    firstName: 'E2E',
    lastName: 'Client',
    acceptTerms: true,
};

// ── Request Fixtures ─────────────────────────────────────────

export function createRequestPayload(overrides: Record<string, any> = {}) {
    return {
        title: `E2E Test Request ${Date.now()}`,
        description: 'This is an automated E2E test request.',
        category: 'WEB_DEVELOPMENT',
        budget: {
            min: 1000,
            max: 5000,
            currency: 'USD',
        },
        timeline: 'WITHIN_A_MONTH',
        ...overrides,
    };
}

// ── Quote Fixtures ───────────────────────────────────────────

export function createQuotePayload(requestId: string, overrides: Record<string, any> = {}) {
    return {
        requestId,
        amount: 3000,
        currency: 'USD',
        estimatedDays: 14,
        description: 'E2E Test Quote – includes design and development.',
        milestones: [
            { title: 'Design Phase', amount: 1000, estimatedDays: 5 },
            { title: 'Development Phase', amount: 1500, estimatedDays: 7 },
            { title: 'Testing & Delivery', amount: 500, estimatedDays: 2 },
        ],
        ...overrides,
    };
}

// ── Project Fixtures ─────────────────────────────────────────

export function createProjectPayload(quoteId: string, overrides: Record<string, any> = {}) {
    return {
        quoteId,
        title: `E2E Test Project ${Date.now()}`,
        ...overrides,
    };
}

// ── Messaging Fixtures ───────────────────────────────────────

export function createMessagePayload(conversationId: string, overrides: Record<string, any> = {}) {
    return {
        conversationId,
        content: `E2E test message at ${new Date().toISOString()}`,
        type: 'TEXT',
        ...overrides,
    };
}

// ── Contact Fixtures ─────────────────────────────────────────

export const CONTACT_FORM_PAYLOAD = {
    name: 'E2E Tester',
    email: 'e2e-contact@nestlancer.test',
    subject: 'E2E Test Contact Form',
    message: 'This is an automated E2E test submission for the contact form.',
};

// ── Blog Fixtures ────────────────────────────────────────────

export function createBlogPostPayload(overrides: Record<string, any> = {}) {
    return {
        title: `E2E Test Blog Post ${Date.now()}`,
        content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
        excerpt: 'E2E test excerpt',
        tags: ['e2e', 'test'],
        status: 'DRAFT',
        ...overrides,
    };
}

// ── Portfolio Fixtures ───────────────────────────────────────

export function createPortfolioItemPayload(overrides: Record<string, any> = {}) {
    return {
        title: `E2E Test Portfolio ${Date.now()}`,
        description: 'An E2E test portfolio item.',
        category: 'WEB_DESIGN',
        tags: ['e2e', 'test', 'portfolio'],
        projectUrl: 'https://example.com/e2e-project',
        ...overrides,
    };
}

// ── Webhook Fixtures ─────────────────────────────────────────

export function createRazorpayWebhookPayload(overrides: Record<string, any> = {}) {
    return {
        event: 'payment.captured',
        payload: {
            payment: {
                entity: {
                    id: `pay_e2e_${Date.now()}`,
                    amount: 300000, // 3000.00 in paise
                    currency: 'INR',
                    status: 'captured',
                    order_id: `order_e2e_${Date.now()}`,
                    method: 'card',
                },
            },
        },
        ...overrides,
    };
}
