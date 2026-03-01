import type { Config } from 'jest';
import baseConfig from './jest.config';

const config: Config = {
    ...baseConfig,
    testMatch: [
        '**/*.int.spec.ts',
        '**/*.integration.spec.ts',
    ],
    // Integration tests might need longer timeout
    testTimeout: 30000,
    // Ensure sequential execution if tests share resources (like a single Redis instance)
    runInBand: true,
};

export default config;
