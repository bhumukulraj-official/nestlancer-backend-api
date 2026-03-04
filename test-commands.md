# Professional Testing Commands for Nestlancer Backend API

This project uses a standardized Jest configuration with the **Projects** feature and **Turbo** integration. Always ensure you are in the root directory unless explicitly mentioned.

## 1. Using Turbo (Recommended for speed and CI)

Turbo handles dependency graphs and caching automatically.

### Run All Unit Tests
```bash
pnpm turbo test:unit
```

### Run All Integration Tests
```bash
pnpm turbo test:integration
```

### Test a Specific Package
```bash
pnpm turbo test:unit --filter=@nestlancer/common
pnpm turbo test:unit --filter=@nestlancer/auth-service
```

---

## 2. Using Jest Directly (Recommended for Development/Debugging)

Direct Jest commands are faster for running specific files or using focus patterns.

### Run All Tests across all Workspaces
```bash
npx jest
```

### Run All Unit Tests
```bash
npx jest --testPathPattern=tests/unit
```

### Run Tests for a Specific Directory (Workspace Aware)
You can point Jest to any directory, and it will automatically use the correct local configuration.
```bash
npx jest libs/common
npx jest services/auth
npx jest ws-gateway
```

### Run a Specific Test File
```bash
npx jest libs/common/tests/unit/utils/hash.util.spec.ts
```

---

## 3. Coverage Reports

Coverage is standardized across all packages.

### Generate All Coverage
```bash
pnpm test:cov
```

### Generate Coverage for Specific Package
```bash
npx jest libs/common --coverage
```

---

## 4. Key Benefits of this Setup
- **Consistency**: All packages share a `jest.config.base.ts`.
- **Discovery**: The root `jest.config.ts` uses `projects`, so one command runs everything.
- **Path Mapping**: Imports like `@nestlancer/common` are automatically mapped from `tsconfig.base.json`.
- **Performance**: `isolatedModules` is enabled for faster, memory-efficient testing.
- **Flexibility**: You can run tests from the root or within each package directory.

---

## 5. Troubleshooting

### Validation Warnings
If you see "Unknown option" warnings, ensure that global settings (like `verbose`, `detectOpenHandles`) are only defined in the root `jest.config.ts`, not in individual package configs.

### Out of Memory (OOM) Errors
If you hit memory limits when running many tests:
1. **Use Turbo**: `pnpm turbo test:unit` runs tests in separate processes, which is more memory-efficient.
2. **Limit Workers**: `npx jest libs/ --maxWorkers=2`
3. **Increase Node Memory**: `NODE_OPTIONS="--max-old-space-size=4096" npx jest libs/`
4. **Isolated Modules**: We have enabled `isolatedModules: true` in the base config to speed up tests and reduce memory by skipping type checking during test runs.
