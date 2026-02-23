import { PrismaClient } from '../../generated';

/**
 * Seed error code definitions as SystemConfig for reference.
 * Maps to 117-error-codes-endpoints.md documentation.
 */
export async function seedErrorCodes(prisma: PrismaClient): Promise<void> {
    console.log('  ⚠️  Seeding error codes...');

    await prisma.systemConfig.upsert({
        where: { key: 'error.codes' },
        update: {},
        create: {
            key: 'error.codes',
            value: {
                AUTH: {
                    AUTH_001: 'Invalid credentials',
                    AUTH_002: 'Token expired',
                    AUTH_003: 'Token invalid',
                    AUTH_004: 'Account suspended',
                    AUTH_005: 'Account not verified',
                    AUTH_006: 'Account locked',
                    AUTH_007: '2FA required',
                    AUTH_008: '2FA code invalid',
                    AUTH_009: 'Refresh token invalid',
                    AUTH_010: 'CSRF token invalid',
                    AUTH_TURNSTILE_FAILED: 'Turnstile verification failed',
                    AUTH_INSUFFICIENT_ROLE: 'Insufficient role permissions',
                    AUTH_WS_UNAUTHORIZED: 'WebSocket authentication failed',
                },
                VALIDATION: {
                    VALIDATION_ERROR: 'Request validation failed',
                    INVALID_INPUT: 'Invalid input provided',
                },
                RESOURCE: {
                    NOT_FOUND: 'Resource not found',
                    ALREADY_EXISTS: 'Resource already exists',
                    CONFLICT: 'Resource conflict',
                },
                PAYMENT: {
                    PAYMENT_001: 'Payment creation failed',
                    PAYMENT_002: 'Payment verification failed',
                    PAYMENT_003: 'Refund failed',
                    PAYMENT_004: 'Invalid amount',
                },
                SYSTEM: {
                    SYS_MAINTENANCE: 'System is under maintenance',
                    INTERNAL_ERROR: 'Internal server error',
                    SERVICE_UNAVAILABLE: 'Service unavailable',
                    GATEWAY_TIMEOUT: 'Gateway timeout',
                    RATE_LIMIT_EXCEEDED: 'Rate limit exceeded',
                },
            },
            description: 'Application error code definitions',
        },
    });

    console.log('  ✅ Error codes seeded');
}
