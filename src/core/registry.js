/**
 * Curated Registry of high-value community skills adapted from Claude Code, Codex, and Cursor ecosystems.
 */

export const CURATED_CATALOG = [
  {
    id: 'tdd-agentic-loop',
    name: 'tdd-agentic-loop',
    origin: 'Antigravity Quality Assurance Core',
    description: 'Strict Test-Driven Development (TDD) workflow: write failing unit test, execute test, write minimal code to pass, and refactor cleanly.',
    category: 'Testing & Reliability',
    content: `---
name: tdd-agentic-loop
description: >-
  Strict Test-Driven Development workflow for the agent: write a failing test first, run to confirm failure,
  implement minimal passing code, verify green status, and refactor with zero regressions.
---

# Test-Driven Development (TDD) Agentic Loop

Follow this rigorous cycle whenever implementing new features or fixing existing bugs.

## The Iron Rule of TDD
Never write implementation code before having an automated test that fails for the expected reason.

## The 4-Phase Loop

### Phase 1: Red (Failing Test First)
1. Write a minimal unit/integration test covering the expected requirement or bug scenario.
2. Run the test suite immediately.
3. Verify that the test fails specifically for the expected missing feature or error condition (not due to syntax error).

### Phase 2: Green (Minimal Implementation)
1. Write only the minimal amount of code required to make the failing test pass.
2. Avoid over-engineering, premature abstractions, or adding unrequested functionality at this stage.
3. Re-run the test to confirm it now passes (Green).

### Phase 3: Refactor (Clean Code)
1. With tests passing, clean up variable names, eliminate duplication, and improve modularity.
2. Ensure strict type safety and error boundaries.
3. Re-run the tests after refactoring to guarantee no regression occurred.

### Phase 4: Verification Gate
- Run full project test runner (e.g. \`npm test\` or \`pytest\`).
- Ensure all edge-case tests remain green before declaring the task finished.
`
  },
  {
    id: 'spec-driven-development',
    name: 'spec-driven-development',
    origin: 'Antigravity Architecture Core',
    description: 'Enforces explicit PRD / RFC architectural planning in markdown files before touching code, ensuring alignment and state persistence across agent turns.',
    category: 'Architecture & Planning',
    content: `---
name: spec-driven-development
description: >-
  Enforces writing explicit design specifications, data models, and API contracts in markdown before writing code.
  Use when architecting new systems, refactoring large modules, or planning complex features.
---

# Spec-Driven Development

Prevents context drift and wasted implementation effort by defining the architectural contract first.

## The Specification Protocol

### 1. Create the Spec File
Before generating or modifying code, draft a design spec document in the project (e.g. \`docs/specs/<feature-name>.md\` or an artifact):
- **Problem Statement**: What problem does this solve and why?
- **User Scenarios**: Primary and secondary workflows.
- **Data Models**: Exact TypeScript interfaces / DB schemas / entities.
- **API Contracts**: Endpoints, HTTP methods, request payloads, response structures, and error codes.
- **Edge Cases & Failure Modes**: Network timeouts, missing permissions, empty datasets.

### 2. Technical Alignment
- Review the drafted spec against project constraints.
- Resolve architectural ambiguities before creating boilerplate code.

### 3. Incremental Implementation Checklist
- Break the spec into a prioritized checklist:
  - [ ] 1. Core database schema migration
  - [ ] 2. Service layer / Business logic
  - [ ] 3. API Route handlers & validation
  - [ ] 4. Frontend view & state binding
  - [ ] 5. End-to-end integration tests

### 4. Verification Against Spec
- Check each implemented milestone against the initial spec criteria to guarantee 100% functional completeness.
`
  },
  {
    id: 'nextjs-fullstack-pro',
    name: 'nextjs-fullstack-pro',
    origin: 'Adapted from Vercel & Cursor AI Best Practices',
    description: 'Modern Next.js 15, App Router, React Server Components (RSC), Server Actions, and Tailwind CSS patterns.',
    category: 'Full-Stack Web',
    content: `---
name: nextjs-fullstack-pro
description: >-
  Best practices for Next.js 15 App Router: React Server Components, Server Actions with Zod validation,
  optimistic UI updates, caching strategies, and Tailwind CSS layout design.
---

# Next.js 15 Full-Stack Pro

Provides standards and architectural patterns for modern Next.js applications using App Router.

## Architecture Rules
1. **Server Components by Default**:
   - Keep data fetching inside React Server Components (\`async function Page()\`).
   - Use \`'use client'\` only at the leaf nodes requiring browser events (onClick, useState, useEffect).
2. **Type-Safe Server Actions**:
   - Define actions with \`'use server'\`.
   - Validate input payloads with Zod schemas before database operations.
   - Return structured result objects: \`{ success: true, data } | { success: false, error: string }\`.
3. **Optimistic Updates**:
   - Use \`useOptimistic\` or React 19 action states for instant UI feedback on form submissions.
4. **Error & Loading Boundaries**:
   - Implement \`loading.tsx\` using skeleton components.
   - Implement \`error.tsx\` with a reset button to prevent catastrophic white-screen crashes.
`
  },
  {
    id: 'fastapi-async-expert',
    name: 'fastapi-async-expert',
    origin: 'Adapted from Python Codex Engineering Patterns',
    description: 'Production-ready FastAPI development with Pydantic v2, async SQLAlchemy 2.0, dependency injection, and clean layered architecture.',
    category: 'Backend & APIs',
    content: `---
name: fastapi-async-expert
description: >-
  Production-grade FastAPI development guidelines: Pydantic v2 models, async SQLAlchemy 2.0 sessions,
  modular router organization, dependency injection, and centralized exception handling.
---

# FastAPI Async Expert

Architecture and execution guidelines for high-performance Python backends with FastAPI.

## Directory Structure
\`\`\`text
app/
├── core/         # Config, security, database session provider
├── models/       # SQLAlchemy ORM models
├── schemas/      # Pydantic v2 request/response schemas
├── api/          # Route endpoints grouped by domain (v1/...)
├── services/     # Pure business logic
└── main.py       # FastAPI application factory with lifespan handlers
\`\`\`

## Key Practices
1. **Async Endpoints**: Use \`async def\` with async drivers (\`asyncpg\`, \`aiosqlite\`).
2. **Schema Separation**:
   - \`ItemCreate\` (inputs allowed during creation).
   - \`ItemUpdate\` (optional fields for updates).
   - \`ItemResponse\` (\`from_attributes = True\` for ORM serialization).
3. **Dependency Injection**: Use \`Depends(get_db)\` for managing session lifecycle cleanly.
4. **Exception Handlers**: Register global exception handlers for \`RequestValidationError\` to return clean RFC 7807 problem details.
`
  },
  {
    id: 'git-surgical-workflow',
    name: 'git-surgical-workflow',
    origin: 'Adapted from Advanced Git Master Rules',
    description: 'Surgical version control: atomic conventional commits, safe branch rebasing, conflict resolution, cherry-picking, and worktree usage.',
    category: 'DevOps & Git',
    content: `---
name: git-surgical-workflow
description: >-
  Advanced git operations and version control workflow: atomic conventional commits, interactive rebasing,
  worktree isolation, merge conflict resolution, and safe branch management.
---

# Git Surgical Workflow

Guidelines for maintaining clean, bisectable git histories and executing complex version control operations safely.

## Conventional Commits
Use semantic commit messages:
- \`feat(scope): add user registration endpoint\`
- \`fix(auth): handle expired refresh token gracefully\`
- \`refactor(db): extract connection pool into singleton\`
- \`test(api): add integration test for order checkout\`

## Safe Rebase & Sync Protocol
1. Never rebase public branches already pushed to remote.
2. Keep feature branches updated via: \`git fetch origin && git rebase origin/main\`.
3. If conflicts arise, resolve file by file, run tests, and use \`git rebase --continue\`.
4. Use \`git status\` constantly to inspect index state before staging.
`
  },
  {
    id: 'database-architect-pro',
    name: 'database-architect-pro',
    origin: 'Adapted from High-Performance Database Engineering Rules',
    description: 'Relational database schema modeling, indexing strategies (B-Tree, GIN, Partial), foreign key constraints, connection pooling, and query execution plan analysis (EXPLAIN ANALYZE).',
    category: 'Data & Databases',
    content: `---
name: database-architect-pro
description: >-
  Database design, schema modeling, indexing optimization, and query execution plan analysis.
  Use when designing schemas, tuning SQL queries, diagnosing slow database operations, or writing migrations.
---

# Database Architect Pro

Definitive rules for high-performance schema design and query execution.

## Schema Modeling Rules
1. **Always Enforce Foreign Key Constraints**: Never rely on application-level integrity alone.
2. **Normalized Core, Denormalized Read Views**: Design OLTP tables in 3NF; create indexed materialized views for expensive aggregations.
3. **Appropriate Datatypes**:
   - Use UUIDv7 or auto-incrementing BigInt for primary keys.
   - Use \`TIMESTAMPTZ\` (UTC) for all temporal data; never naive timestamps.
   - Store monetary values in integer cents (\`amount_cents INTEGER\`) or \`DECIMAL/NUMERIC\`, never floating point (\`REAL/FLOAT\`).

## Indexing Strategy
- **Covering Indexes**: Include all queried columns to allow Index-Only Scans.
- **Composite Indexes**: Follow the Equality -> Range rule (place equality filter columns first, range/sort columns last).
- **Partial Indexes**: Index only active rows (\`WHERE status = 'active'\`) to reduce index bloat by 80%.

## Query Optimization Checklist
- [ ] Run \`EXPLAIN ANALYZE\` to check for Sequential Scans on large tables.
- [ ] Avoid \`SELECT *\` in production queries; request only needed columns.
- [ ] Ensure pagination uses keyset / cursor pagination (\`WHERE id > :last_id\`) rather than large \`OFFSET\`.
`
  },
  {
    id: 'clean-code-refactor',
    name: 'clean-code-refactor',
    origin: 'Adapted from SOLID & Clean Architecture Engineering Rules',
    description: 'Systematic refactoring patterns: reducing cyclomatic complexity, extracting pure functions, eliminating code duplication, and enforcing strict type narrowing.',
    category: 'Code Quality',
    content: `---
name: clean-code-refactor
description: >-
  Refactoring guidelines: reduce cyclomatic complexity, decouple modules, extract pure functions,
  and enforce strict type safety without altering external behavior.
---

# Clean Code Refactor

Procedures for transforming messy, legacy, or complex code into clean, maintainable architecture.

## Golden Rule of Refactoring
Never change functional behavior while refactoring. Run the test suite before and after every single modification.

## Key Refactoring Moves
1. **Flatten Deep Nesting**:
   - Invert \`if\` checks into early returns / guard clauses.
   - Limit indentation depth to maximum 2 levels per function.
2. **Extract Pure Functions**:
   - Separate data transformation (pure logic with zero side effects) from I/O (database, network, file writes).
3. **Eliminate Magic Numbers & Strings**:
   - Consolidate configurations into typed const enums or config maps.
4. **Type Narrowing**:
   - Replace loose \`any\` or generic \`object\` with explicit tagged unions or discriminated unions.
`
  },
  {
    id: 'security-red-team',
    name: 'security-red-team',
    origin: 'Adapted from Offensive Security & Penetration Testing Rules',
    description: 'Adversarial security assessment: automated attack simulations, parameter fuzzing, broken access control discovery, and privilege escalation checks.',
    category: 'Security & Red Team',
    content: `---
name: security-red-team
description: >-
  Adversarial testing and penetration analysis: parameter fuzzing, privilege escalation checks,
  race condition testing, and input boundary exploitation.
---

# Security Red Team Auditor

Adversarial mindset to identify stealth vulnerabilities before attackers do.

## Attack Vectors to Verify
1. **IDOR & Parameter Tampering**:
   - Swap entity IDs in requests to check if user A can access or mutate user B's resources.
2. **Mass Assignment / Parameter Pollution**:
   - Pass unauthorized fields (\`isAdmin: true\`, \`role: "admin"\`, \`balance: 999999\`) into update endpoints.
3. **Race Conditions / TOCTOU**:
   - Test double-spend or concurrency issues by sending simultaneous concurrent requests to debit/coupon endpoints.
4. **Rate Limit Bypass**:
   - Test if rotating headers (\`X-Forwarded-For\`, \`X-Real-IP\`) bypasses request throttling.
`
  },
  {
    id: 'ai-evals-and-benchmarking',
    name: 'ai-evals-and-benchmarking',
    origin: 'Adapted from LLM Evaluation & Prompt Engineering Research',
    description: 'Framework for measuring LLM output quality, synthetic test case generation, grading assertions, regression testing prompts, and latency/token cost tracking.',
    category: 'AI & LLM Ops',
    content: `---
name: ai-evals-and-benchmarking
description: >-
  Procedures for LLM evals: structured assertions, synthetic benchmark dataset generation,
  grading criteria, prompt regression testing, and token latency tracking.
---

# AI Evals & Benchmarking

Definitive protocol for testing, measuring, and preventing regression in AI applications.

## Evaluation Pipeline
1. **Benchmark Dataset (Gold Standard)**:
   - Curate 20-50 diverse input-output pairs covering: happy paths, edge cases, adversarial inputs, and ambiguous prompts.
2. **Deterministic Assertions**:
   - Test schema validity (valid JSON matching Zod/Pydantic schema).
   - Test required keywords and prohibited terms.
   - Test maximum token budget and latency thresholds.
3. **Model-as-a-Judge Scoring**:
   - For open-ended generations, use a rubric (1-5 scale) evaluating: Faithfulness, Accuracy, Conciseness, and Tone.
4. **Regression Gate**:
   - Whenever modifying system prompts, run the eval suite to ensure total score does not drop.
`
  }
];

