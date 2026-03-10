import type { Config } from 'jest';
import * as path from 'path';

const rootDir = path.resolve(__dirname, '../..');

// Use require for JSON to avoid TS2732 in some environments
const tsconfig = require('../../tsconfig.base.json');

import { pathsToModuleNameMapper } from 'ts-jest';

const config: Config = {
  displayName: 'e2e',
  preset: 'ts-jest',
  testEnvironment: 'node',

  // Root of the monorepo
  rootDir,

  // Match only e2e spec files
  testMatch: ['<rootDir>/tests/e2e/**/*.e2e-spec.ts'],

  // Global setup file
  setupFilesAfterEnv: ['<rootDir>/tests/e2e/setup.e2e.ts'],

  // E2E tests need longer timeouts (60s per test)
  testTimeout: 60000,

  // Run sequentially to avoid resource contention
  maxWorkers: 1,

  // Module name mapping from tsconfig paths
  moduleNameMapper: {
    ...pathsToModuleNameMapper(tsconfig.compilerOptions.paths, { prefix: rootDir + '/' }),
  },

  // TypeScript transform
  transform: {
    '^.+\\.[tj]s$': [
      'ts-jest',
      {
        tsconfig: path.join(rootDir, 'tests/e2e/tsconfig.e2e.json'),
        diagnostics: false,
        isolatedModules: true,
      },
    ],
  },

  moduleFileExtensions: ['ts', 'js', 'json', 'node'],

  // Cleanup
  clearMocks: true,
  restoreMocks: true,

  // Handle open handles from HTTP/WS connections
  detectOpenHandles: true,
  forceExit: true,

  // Verbose output for debugging
  verbose: true,

  // Memory management
  workerIdleMemoryLimit: '512MB',
};

export default config;
