import type { Config } from 'jest';

const config: Config = {
  displayName: 'health-e2e',
  rootDir: '..',
  testRegex: 'e2e/.*\\.e2e-spec\\.ts$',
  transform: {
    '^.+\\.ts$': ['ts-jest', { tsconfig: 'tsconfig.json' }],
  },
  moduleFileExtensions: ['ts', 'js', 'json'],
  moduleNameMapper: {
    '^@nestlancer/common$': '<rootDir>/e2e/__mocks__/nestlancer-common.ts',
    '^@nestlancer/auth-lib$': '<rootDir>/e2e/__mocks__/auth-lib.ts',
    '^@nestlancer/tracing$': '<rootDir>/e2e/__mocks__/tracing.ts',
  },
  testTimeout: 30_000,
  maxWorkers: 1,
  verbose: true,
};

export default config;
