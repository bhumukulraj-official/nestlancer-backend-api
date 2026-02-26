# Role and Objective

You are an expert **Senior Backend Engineer**. Your objective is to thoroughly review, fix, and complete the implementation of the `ws-gateway/` directory in the **Nestlancer backend project**, bringing it up to production-ready standards.

---

# Context & References

We have already fixed, optimized, and fully implemented the following directories:

* `libs/`
* `prisma/`
* `services/`
* `workers/`

You must use these previously implemented directories as the **source of truth** for:

* Coding standards
* Architectural patterns
* Database interactions
* Error handling
* Logging conventions
* WebSocket event handling patterns
* Queue/message broker patterns
* Type safety standards

---

# Step-by-Step Instructions

## Phase 1: Context Gathering

Before analyzing the code, read and understand the core requirements and constraints of the project by reviewing the following documentation files:

### Architecture & Core Setup:

* `reference-docs/201-architecture.md`
* `reference-docs/301-dir-structure.md`
* `reference-docs/401-project-tracker.md`
* `reference-docs/501-database.md`
* `reference-docs/901-tech-stack.md`
* `reference-docs/env-details-extended.md`
* `reference-docs/env-details.md`

### API & Service References:

* `reference-docs/100-api-standards-endpoints.md`
* Through:
* `reference-docs/120-webhooks-inbound-endpoints.md`

Read these to understand:

* Expected domain logic
* Background processing flows
* Payment lifecycle
* Notification pipelines
* Messaging systems
* Media processing
* Webhook handling
* Queue-based workflows
* Real-time WebSocket communications

---

## Phase 2: Audit & Analyze the `ws-gateway/` Directory

1. Discover and read all files inside the `ws-gateway/` directory.
2. Evaluate overall code quality and architecture.
3. Ensure gateway components are:

   * Properly structured for NestJS WebSocket Gateways
   * Handling connections, authentication, and disconnections correctly
   * Scalable and fault-tolerant
   * Following retry/backoff strategies where required
   * Using consistent logging and observability patterns
4. Identify:

   * Missing error handling
   * Improper async handling
   * Broken WebSocket event emission or subscription logic
   * Idempotency gaps
   * Inconsistent TypeScript typing
   * Missing infrastructure glue code

---

## Phase 3: Implement Missing or Commented Code (Action Required)

### 1. Find Unimplemented Stubs

Search the `ws-gateway/` directory for:

* `TODO`
* `FIXME`
* Commented-out logic
* Placeholder returns
* Partially implemented functions

---

### 2. Write Production-Grade Code

Implement the missing logic while:

* Correctly integrating with Redis for WebSocket adapter/scaling if applicable
* Using existing `services/` and Prisma wrappers
* Applying:

  * Strict TypeScript typing
  * Structured logging
  * Proper error handling
  * Idempotency protection
  * Transaction safety where required
* Ensuring graceful shutdown support
* Avoiding duplicated logic already present in `services/` or `libs/`

---

### 3. Align with Existing Code Standards

All newly written code must:

* Match the style of `libs/`, `services/`, and `workers/`
* Use the same dependency injection patterns
* Follow the same exception handling structure
* Use centralized logging utilities
* Maintain strict typing discipline
* Be production-ready and scalable

---

# Final Output Requirements

1. Provide a brief structured plan outlining:

   * What unimplemented areas were found
   * What architectural issues were discovered
   * What structural improvements are required

2. Then rewrite and fix the `ws-gateway/` directory files one by one:

   * Show corrected implementations
   * Maintain clean file separation
   * Ensure strict TypeScript types
   * Ensure production readiness

---
