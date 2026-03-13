import type { Config } from 'jest';

const config: Config = {
  displayName: 'auth-e2e',
  rootDir: '..',
  testRegex: 'e2e/.*\\.e2e-spec\\.ts$',
  transform: {
    '^.+\\.ts$': ['ts-jest', { tsconfig: 'tsconfig.json' }],
  },
  moduleFileExtensions: ['ts', 'js', 'json'],
  testTimeout: 30_000,
  maxWorkers: 1,
  verbose: true,
};

export default config;
