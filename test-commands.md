# Professional Testing Commands for Nestlancer Backend API

This project uses a standardized Jest configuration with the **Projects** feature and **Turborepo** integration.
**Always ensure you are in the root directory** when running these commands.

---

## 1. Using Turborepo (Recommended)

Turborepo is the recommended way to run tests. It handles dependency graphs, caching automatically, and properly isolates test executions per workspace to prevent cross-contamination.

### Run All Tests Across Entire Project

```bash
pnpm test          # Runs the build and test scripts
pnpm test:unit     # Runs all unit tests
pnpm test:integration # Runs all integration tests
```

### Run Tests for a Specific Package / Directory

To test a specific module, **always use Turborepo filters**. Do not use `npx jest <directory>` from the root, as Jest will ignore the directory isolation and run all tests in the workspace.

Use the `--filter` flag with the package name (found in its `package.json`).

```bash
pnpm test:unit --filter=@nestlancer/contact-service
pnpm test:integration --filter=@nestlancer/auth-service
pnpm test --filter=@nestlancer/common
```

---

## 2. Using Jest Directly (For Specific Files)

Direct Jest commands should only be used for running individual files or debugging specific test cases.

### Run a Specific Test File

```bash
npx jest libs/common/tests/unit/utils/hash.util.spec.ts
```

### Run with a Focus Pattern (Debug Specific Test)

```bash
npx jest -t "should process a refund"
```

---

## 3. Coverage Reports

Coverage configuration is standardized.

### Generate Coverage for Entire Project

```bash
pnpm test:cov
```

### Generate Coverage for a Specific Package

```bash
pnpm test:cov --filter=@nestlancer/contact-service
```

---

## 4. Key Benefits of this Setup

- **Consistency**: All packages share a `jest.config.base.ts`.
- **Discovery**: The root `jest.config.ts` uses `projects`, unifying the test environment.
- **Turborepo Isolation**: Running `test:unit` via Turborepo ensures tests are strictly scoped to their respective workspaces and cached.
- **Path Mapping**: Imports like `@nestlancer/common` are automatically mapped from `tsconfig.base.json`.
- **Performance**: `isolatedModules` is enabled for faster, memory-efficient testing.

---

## 5. Troubleshooting

### ❌ Running a directory runs tests for the whole project!

If you use `npx jest services/contact` or `npx jest --testPathPattern=tests/unit services/contact`, Jest will ignore the directory parameter due to the root monorepo `projects` configuration.
**Fix:** Always use Turborepo filters for directory-level testing: `pnpm test:unit --filter=@nestlancer/contact-service`.

### ⚠️ Validation Warnings

If you see "Unknown option" warnings, ensure that global settings (like `verbose`, `detectOpenHandles`) are only defined in the root `jest.config.ts`, not in individual package configs.

### 💥 Out of Memory (OOM) Errors

If you hit memory limits when running many tests:

1. **Use the NPM Scripts**: Commands like `pnpm test:unit` pass `--max-old-space-size=4096` to Node implicitly.
2. **Use Turborepo**: Turbo runs tests in separate processes per package, which is much more memory-efficient.
3. **Limit Workers**: Use `npx jest --maxWorkers=2` for file-specific debugging.
4. **Isolated Modules**: We have enabled `isolatedModules: true` in the base config to reduce memory usage by skipping type checking during test runs.
