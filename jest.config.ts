import type { Config } from 'jest';

const config: Config = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    rootDir: '.',
    // Each package defines its own jest config
    // projects: [
    //     '<rootDir>/libs/*/jest.config.ts',
    //     '<rootDir>/services/*/jest.config.ts',
    //     '<rootDir>/workers/*/jest.config.ts',
    //     '<rootDir>/gateway/jest.config.ts',
    //     '<rootDir>/ws-gateway/jest.config.ts',
    // ],
    // Global coverage thresholds
    coverageThreshold: {
        global: {
            branches: 80,
            functions: 80,
            lines: 80,
            statements: 80,
        },
    },
    // Collect coverage from source files
    collectCoverageFrom: [
        '**/*.ts',
        '!**/*.module.ts',
        '!**/main.ts',
        '!**/*.interface.ts',
        '!**/*.type.ts',
        '!**/*.enum.ts',
        '!**/*.dto.ts',
        '!**/*.constants.ts',
        '!**/*.d.ts',
        '!**/index.ts',
        '!**/node_modules/**',
        '!**/dist/**',
        '!**/coverage/**',
        '!**/prisma/**',
        '!**/*.config.ts',
        '!**/*.config.js',
    ],
    // Path aliases matching tsconfig.base.json
    moduleNameMapper: {
        // Deep-path overrides (must come before generic catch-all patterns)
        '^uuid$': '<rootDir>/libs/testing/src/uuid.mock.ts',
        '^@nestlancer/database/prisma/prisma-read\\.service$': '<rootDir>/libs/database/src/prisma-read.service',
        '^@nestlancer/database/prisma/prisma-write\\.service$': '<rootDir>/libs/database/src/prisma-write.service',
        '^@nestlancer/database/decorators/read-only\\.decorator$': '<rootDir>/libs/database/src/decorators/read-only.decorator',
        '^@nestlancer/database/decorators/write-only\\.decorator$': '<rootDir>/libs/testing/src/decorators.mock.ts',
        '^@nestlancer/common/enums/role\\.enum$': '<rootDir>/libs/common/src/enums/user-role.enum',
        '^@nestlancer/common/exceptions/not-found\\.exception$': '<rootDir>/libs/common/src/exceptions/resource-not-found.exception',
        '^@nestlancer/common/decorators/api-standard-response\\.decorator$': '<rootDir>/libs/testing/src/decorators.mock.ts',
        '^@nestlancer/common/decorators/api-paginated\\.decorator$': '<rootDir>/libs/testing/src/decorators.mock.ts',
        '^@nestlancer/common/exceptions/conflict\\.exception$': '<rootDir>/libs/common/src/exceptions/resource-conflict.exception',
        '^@nestlancer/common/decorators/success-response\\.decorator$': '<rootDir>/libs/testing/src/decorators.mock.ts',
        '^@nestlancer/auth-lib/decorators/active-user\\.decorator$': '<rootDir>/libs/auth-lib/src/decorators/current-user.decorator',
        '^@nestlancer/auth-lib/decorators/public\\.decorator$': '<rootDir>/libs/testing/src/decorators.mock.ts',
        '^@nestlancer/common/decorators/idempotency\\.decorator$': '<rootDir>/libs/testing/src/decorators.mock.ts',
        '^@nestlancer/common/decorators/idempotent\\.decorator$': '<rootDir>/libs/testing/src/decorators.mock.ts',
        // Generic lib aliases
        '^@nestlancer/common(.*)$': '<rootDir>/libs/common/src$1',
        '^@nestlancer/config(.*)$': '<rootDir>/libs/config/src$1',
        '^@nestlancer/database(.*)$': '<rootDir>/libs/database/src$1',
        '^@nestlancer/cache(.*)$': '<rootDir>/libs/cache/src$1',
        '^@nestlancer/queue(.*)$': '<rootDir>/libs/queue/src$1',
        '^@nestlancer/outbox(.*)$': '<rootDir>/libs/outbox/src$1',
        '^@nestlancer/auth-lib(.*)$': '<rootDir>/libs/auth-lib/src$1',
        '^@nestlancer/logger(.*)$': '<rootDir>/libs/logger/src$1',
        '^@nestlancer/metrics(.*)$': '<rootDir>/libs/metrics/src$1',
        '^@nestlancer/tracing(.*)$': '<rootDir>/libs/tracing/src$1',
        '^@nestlancer/health-lib(.*)$': '<rootDir>/libs/health-lib/src$1',
        '^@nestlancer/idempotency(.*)$': '<rootDir>/libs/idempotency/src$1',
        '^@nestlancer/audit(.*)$': '<rootDir>/libs/audit/src$1',
        '^@nestlancer/alerts(.*)$': '<rootDir>/libs/alerts/src$1',
        '^@nestlancer/middleware(.*)$': '<rootDir>/libs/middleware/src$1',
        '^@nestlancer/storage(.*)$': '<rootDir>/libs/storage/src$1',
        '^@nestlancer/mail(.*)$': '<rootDir>/libs/mail/src$1',
        '^@nestlancer/crypto(.*)$': '<rootDir>/libs/crypto/src$1',
        '^@nestlancer/websocket(.*)$': '<rootDir>/libs/websocket/src$1',
        '^@nestlancer/pdf(.*)$': '<rootDir>/libs/pdf/src$1',
        '^@nestlancer/search(.*)$': '<rootDir>/libs/search/src$1',
        '^@nestlancer/circuit-breaker(.*)$': '<rootDir>/libs/circuit-breaker/src$1',
        '^@nestlancer/turnstile(.*)$': '<rootDir>/libs/turnstile/src$1',
        '^@nestlancer/testing(.*)$': '<rootDir>/libs/testing/src$1',
        '^ua-parser-js$': '<rootDir>/libs/testing/src/ua-parser.mock.ts',
    },
    // Test file patterns
    testMatch: [
        '**/*.spec.ts',
        '**/*.test.ts',
    ],
    // Ignore patterns
    testPathIgnorePatterns: [
        '/node_modules/',
        '/dist/',
        '/coverage/',
    ],
    // Transform TypeScript and some JavaScript ESM files
    transform: {
        '^.+\\.[tj]s$': [
            'ts-jest',
            {
                tsconfig: 'tsconfig.test.json',
                diagnostics: false,
            },
        ],
    },
    // Clear mocks between tests
    clearMocks: true,
    restoreMocks: true,
    // Verbose output
    verbose: true,
};

export default config;
