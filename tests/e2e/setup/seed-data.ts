/**
 * E2E Test Seed Data Constants
 *
 * These constants represent the test users and data pre-seeded
 * into the E2E database before tests run. They mirror the values
 * seeded by `prisma/seeds` and are used by all test suites.
 */

// ─── Admin User (pre-seeded) ────────────────────────────────────────────────
export const ADMIN_USER = {
    email: 'admin@nestlancer.dev',
    password: 'Admin@123456',
    name: 'E2E Admin',
    role: 'ADMIN',
} as const;

// ─── Client User (pre-seeded) ───────────────────────────────────────────────
export const CLIENT_USER = {
    email: 'client@nestlancer.dev',
    password: 'Client@123456',
    name: 'E2E Client',
    role: 'USER',
} as const;

// ─── Fresh user for registration tests ──────────────────────────────────────
export const NEW_USER = {
    email: 'newuser@nestlancer.dev',
    password: 'NewUser@123456',
    name: 'E2E New User',
} as const;

// ─── Categories (pre-seeded) ────────────────────────────────────────────────
export const CATEGORIES = {
    WEB_DEVELOPMENT: 'webDevelopment',
    MOBILE_DEVELOPMENT: 'mobileDevelopment',
    DESIGN: 'design',
    OTHER: 'other',
} as const;

// ─── Contact Subjects ───────────────────────────────────────────────────────
export const CONTACT_SUBJECTS = {
    GENERAL: 'general',
    SUPPORT: 'support',
    BUG_REPORT: 'bugReport',
    PARTNERSHIP: 'partnership',
    OTHER: 'other',
} as const;

// ─── Sample Request Data ────────────────────────────────────────────────────
export const SAMPLE_REQUEST = {
    title: 'E2E Test Website Project',
    description: 'A modern e-commerce website for E2E testing purposes.',
    category: CATEGORIES.WEB_DEVELOPMENT,
    budgetMin: 50000,
    budgetMax: 100000,
    currency: 'INR',
    timeframe: '3 months',
} as const;

// ─── Sample Quote Data ──────────────────────────────────────────────────────
export const SAMPLE_QUOTE = {
    title: 'E2E Test Quote – E-commerce Website',
    description: 'Full-stack e-commerce platform with admin panel.',
    totalAmount: 75000,
    currency: 'INR',
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
    terms: 'Payment upon milestone completion.',
    paymentBreakdown: [
        { type: 'advance', percentage: 30, amount: 22500 },
        { type: 'milestone', percentage: 40, amount: 30000 },
        { type: 'final', percentage: 30, amount: 22500 },
    ],
} as const;

// ─── Sample Portfolio Data ──────────────────────────────────────────────────
export const SAMPLE_PORTFOLIO = {
    title: 'E2E Test Portfolio Item',
    slug: 'e2e-test-portfolio-item',
    shortDescription: 'A showcase project built for E2E testing.',
    fullDescription: '## Overview\n\nThis portfolio item is created during E2E tests.',
    contentFormat: 'markdown',
    status: 'draft',
    featured: false,
} as const;

// ─── Sample Blog Data ───────────────────────────────────────────────────────
export const SAMPLE_BLOG_POST = {
    title: 'E2E Test Blog Post',
    slug: 'e2e-test-blog-post',
    excerpt: 'A blog post for end-to-end testing.',
    content: '# E2E Test Post\n\nThis post is created during E2E tests.',
    contentFormat: 'markdown',
    commentsEnabled: true,
    status: 'draft',
} as const;

// ─── Sample Contact Data ────────────────────────────────────────────────────
export const SAMPLE_CONTACT = {
    name: 'Jane E2E',
    email: 'jane-e2e@example.com',
    subject: CONTACT_SUBJECTS.BUG_REPORT,
    message: 'This is an E2E test contact form submission.',
    turnstileToken: 'e2e-bypass-token',
} as const;

// ─── Sample Webhook Data ────────────────────────────────────────────────────
export const SAMPLE_WEBHOOK = {
    name: 'E2E Test Webhook',
    description: 'Webhook for E2E testing',
    url: 'https://httpbin.org/post',
    events: ['project.created', 'payment.completed'],
    secret: 'e2e-webhook-secret',
    enabled: true,
    retryPolicy: { maxRetries: 3, retryInterval: 'exponential' },
} as const;

// ─── API Configuration ──────────────────────────────────────────────────────
export const API_CONFIG = {
    BASE_URL: process.env.E2E_BASE_URL || 'http://localhost:3000',
    API_PREFIX: '/api/v1',
    WS_URL: process.env.E2E_WS_URL || 'ws://localhost:3000',
} as const;

export const API_BASE = `${API_CONFIG.BASE_URL}${API_CONFIG.API_PREFIX}`;
