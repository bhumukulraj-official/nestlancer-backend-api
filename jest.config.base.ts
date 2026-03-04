import type { Config } from 'jest';
import { pathsToModuleNameMapper } from 'ts-jest';
import * as path from 'path';

const rootDir = path.resolve(__dirname);
// Use require for JSON to avoid TS2732 in some environments
const tsconfig = require('./tsconfig.base.json');

const config: Config = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    // Dynamic path mapping from tsconfig using absolute path as prefix
    moduleNameMapper: {
        ...pathsToModuleNameMapper(tsconfig.compilerOptions.paths, { prefix: rootDir + '/' }),
        // Specific mock overrides
        '^uuid$': path.join(rootDir, 'libs/testing/src/uuid.mock.ts'),
    },
    transform: {
        '^.+\\.[tj]s$': [
            'ts-jest',
            {
                tsconfig: path.join(rootDir, 'tsconfig.test.json'),
                diagnostics: false,
                isolatedModules: true,
            },
        ],
    },
    moduleFileExtensions: ['ts', 'js', 'json', 'node'],
    clearMocks: true,
    restoreMocks: true,
    workerIdleMemoryLimit: '512MB',
};

export default config;
