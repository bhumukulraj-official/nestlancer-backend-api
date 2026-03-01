import type { Config } from 'jest';
import baseConfig from '../../jest.config';

const config: Config = {
    ...baseConfig,
    rootDir: '.',
    testMatch: ['<rootDir>/tests/**/*.spec.ts'],
    collectCoverageFrom: ['<rootDir>/src/**/*.ts'],
};

export default config;
