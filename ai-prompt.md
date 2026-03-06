# E2E Testing & Debugging AI Prompt

**Instructions for the User:** 
Copy the prompt below and paste it into your AI assistant (like Cursor, Claude, or ChatGPT). Replace `[INSERT_TEST_FILE_NAME]` with the actual test you want to run (e.g., [tests/e2e/suites/02-auth.e2e-spec.ts](file:///root/Desktop/nestlancer-backend-api/tests/e2e/suites/02-auth.e2e-spec.ts)).

---

### **Copy the text below:**

**System Role & Objective:**
Act as an Expert NestJS QA Automation & Backend Engineer. I need your help to run, debug, and fix an End-to-End (E2E) test file in my unified backend workspace. 

**Target Test File:**
`[INSERT_TEST_FILE_NAME]` (e.g., [tests/e2e/suites/02-auth.e2e-spec.ts](file:///root/Desktop/nestlancer-backend-api/tests/e2e/suites/02-auth.e2e-spec.ts))

**Project Context & Setup:**
- This is a monorepo-style NestJS backend using Turbo and Jest.
- E2E tests are centralized in `tests/e2e/suites/`. They test the API Gateway (`gateway/`) proxying requests to individual microservices (`services/*`) and verifying async effects in workers (`workers/*`).
- The global E2E config is located at `tests/e2e/jest.e2e.config.ts`.
- The backing infrastructure (Postgres, Redis, RabbitMQ, Mailhog, Minio) is defined in `docker-compose.e2e.yml`.

**Your Tasks (Execute Sequentially):**

**Step 1: Understand the Target Surface**
- Read the target E2E test file (`[INSERT_TEST_FILE_NAME]`) using your file-reading tools.
- Identify the specific services, workers, or libs being tested (e.g., `services/auth`, `libs/common`). 
- Read the corresponding `.env.e2e` configuration, source controllers, services, and modules related to this test.

**Step 2: Environment Setup & Execution**
- Ensure the E2E infrastructure is running:
  ```bash
  docker compose -f docker-compose.e2e.yml up -d
  ```
- Run the Prisma migrations and seed the database for the test environment:
  ```bash
  DATABASE_URL="postgresql://postgres:postgres@localhost:5433/nestlancer_e2e" npx prisma migrate deploy
  DATABASE_URL="postgresql://postgres:postgres@localhost:5433/nestlancer_e2e" npx prisma db seed
  ```
- Start the services via Turbo in the background (Wait for them to boot and the gateway healthcheck to pass on port 3000 before proceeding):
  ```bash
  NODE_ENV=test pnpm turbo dev &
  ```
- Run the specific E2E test file using Jest:
  ```bash
  npx jest --config tests/e2e/jest.e2e.config.ts --runInBand [INSERT_TEST_FILE_NAME]
  ```

**Step 3: Automated Debugging and Fixing**
- If the test fails, analyze the Jest output.
- Perform necessary file inspections to understand the root cause. This might include:
    - Checking the Gateway proxy routes in `gateway/`
    - Checking the service implementations in `services/*`
    - Checking async message handling in `workers/*` or `libs/*`
- Make direct code modifications to the source files or the test file itself to fix the logical, configuration, or structural errors.
- Re-run the test command from Step 2 until the test suite passes **with 100% success**.

**Step 4: Cleanup & Reporting**
- Stop the background services and tear down the test infrastructure:
  ```bash
  kill $(jobs -p)
  docker compose -f docker-compose.e2e.yml down -v
  ```
- Print a summary of the issues found, the exact fixes applied, and confirm that the test now passes.

**Please start with Step 1 immediately and work autonomously.**
