import type { Config } from 'jest';
import baseConfig from '../../jest.config.base';
import * as path from 'path';

const projectRoot = path.resolve(__dirname, '../..');

const config: Config = {
    ...baseConfig,
    displayName: 'e2e',
    rootDir: projectRoot,
    testMatch: ['<rootDir>/tests/e2e/suites/**/*.e2e-spec.ts'],
    testTimeout: 30000,
    maxWorkers: 1, // Sequential execution — tests share state
    globalSetup: '<rootDir>/tests/e2e/setup/global-setup.ts',
    globalTeardown: '<rootDir>/tests/e2e/setup/global-teardown.ts',
    setupFilesAfterEnv: ['<rootDir>/tests/e2e/setup/test-helpers.ts'],
};

export default config;
