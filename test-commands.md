# Testing Commands for Nestlancer Backend API

You can run tests for all components in the monorepo using the following commands:

## 1. Global Test Commands (Root Directory)

### Run All Unit Tests
This is the most reliable way to run all unit tests across `libs`, `services`, and `workers`:
```bash
npx jest libs services workers --testPathPattern="tests/unit" --detectOpenHandles --forceExit
```

### Run All Integration Tests
```bash
npx jest libs services workers --testPathPattern="tests/integration" --detectOpenHandles --forceExit
```

## 2. Testing Specific Components

### Using Turbo (Root Directory)
If you want to use Turbo for specific components (requires `test:unit` or `test:integration` in `package.json`):
```bash
pnpm turbo test:unit --filter="./libs/*"
pnpm turbo test:integration --filter="./services/*"
```

### Using Jest (Root Directory)
Directly test a specific package or directory:
```bash
npx jest libs/common/tests/unit
npx jest services/auth/tests/unit
npx jest workers/analytics-worker/tests/unit
```

## 3. Component-Level Commands

Navigate to a specific package directory and run its local scripts:
```bash
cd services/auth
pnpm test:unit
```

---
**Note:** Many components only have `test:unit` or `test:integration` scripts. If a script is missing, use the global `npx jest` command from the root as shown in section 1.
