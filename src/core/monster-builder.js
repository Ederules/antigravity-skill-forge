/**
 * Monster Hub Builder for Antigravity
 * Clusters hundreds of skills into 10 Master Domain Hubs with progressive disclosure.
 * Keeps the global index ultra-light (~1,500 tokens) while providing access to massive skill sets.
 */

import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const HOME = os.homedir();
const GLOBAL_SKILLS_DIR = path.join(HOME, '.gemini', 'config', 'skills');
const ARCHIVE_DIR = path.join(HOME, '.gemini', 'config', 'skills_archive');

export const SUPER_HUBS = {
  'hub-frontend-mobile-mastery': {
    title: 'Frontend & Mobile Mastery Hub',
    category: 'UI, Web, Mobile & Desktop Interfaces',
    description: 'Master engineering hub for all frontend, mobile, and desktop UI development: React, Next.js 15, Vue, Tailwind CSS, Flutter, React Native, Electron, responsive layouts, micro-interactions, and WCAG accessibility.',
    archiveSources: [
      { name: 'agency-frontend-developer', targetFile: 'frontend-frameworks-core.md', title: 'Modern Frontend Frameworks Architecture' },
      { name: 'agency-accessibility-auditor', targetFile: 'accessibility-wcag-audit.md', title: 'WCAG Accessibility & Assistive Tech Audit' },
      { name: 'agency-desktop-app-engineer', targetFile: 'desktop-electron-tauri.md', title: 'Electron and Tauri Desktop Engineering' },
      { name: 'agency-data-visualization-engineer', targetFile: 'data-visualization-charts.md', title: 'Data Visualization & Chart Engineering' }
    ],
    curatedReferences: [
      {
        file: 'nextjs-app-router-rsc.md',
        title: 'Next.js 15 App Router & Server Actions',
        content: `# Next.js 15 App Router & Server Actions
- Server Components by default: data fetch inside async RSC.
- Client Components: use 'use client' only at leaf nodes requiring events.
- Server Actions: validate payloads with Zod schemas.
- Loading states: skeleton loaders in loading.tsx.
- Error handling: localized error boundaries in error.tsx.
`
      },
      {
        file: 'tailwind-tokens-microinteractions.md',
        title: 'Tailwind Design System & Micro-Interactions',
        content: `# Tailwind Design System & Micro-Interactions
- Colors: 50-900 palette with semantic status mapping (success, warning, error, info).
- Spacing: 4px/8px grid discipline.
- Interactive states: hover:bg-opacity-90, active:scale-[0.98], focus-visible:ring-2.
- Skeletons: animate-pulse mimicking actual component dimensions.
`
      }
    ]
  },

  'hub-backend-api-mastery': {
    title: 'Backend & API Engineering Hub',
    category: 'APIs, Microservices, Real-time & Server Architectures',
    description: 'Master engineering hub for server-side architectures: scalable backend design, RESTful APIs, OpenAPI/gRPC contracts, FastAPI async, Node.js/Express, authentication (OAuth2/JWT/SSO), rate limiting, and WebSockets.',
    archiveSources: [
      { name: 'agency-backend-architect', targetFile: 'scalable-backend-architecture.md', title: 'Scalable System Design & Microservices' },
      { name: 'agency-api-platform-engineer', targetFile: 'api-platform-contracts.md', title: 'Contract-First API Design & Versioning' },
      { name: 'agency-identity-access-engineer', targetFile: 'auth-identity-oauth-jwt.md', title: 'OAuth2, OIDC, Enterprise SSO & Session Security' }
    ],
    curatedReferences: [
      {
        file: 'fastapi-async-architecture.md',
        title: 'FastAPI Async & Clean Architecture',
        content: `# FastAPI Async Architecture
- Schemas: Pydantic v2 (Input schemas vs Output schemas).
- Async driver: asyncpg / aiosqlite with async session context.
- Dependency injection: Depends() for db sessions and auth.
- Centralized exception handlers for clean error JSON.
`
      },
      {
        file: 'resilient-http-clients.md',
        title: 'Resilient HTTP Clients & Backoff',
        content: `# Resilient HTTP Clients & Backoff
- Explicit timeouts: AbortSignal.timeout(8000).
- Exponential backoff with jitter on 429 and 5xx.
- Request rate limiting and circuit breaking.
`
      }
    ]
  },

  'hub-database-data-mastery': {
    title: 'Database & Data Systems Hub',
    category: 'SQL, NoSQL, Schemas, Indexing & Data Pipelines',
    description: 'Master engineering hub for databases and data infrastructure: PostgreSQL optimization, SQLite embedded, schema design, high-performance indexing, DBRE high availability, ETL/ELT pipelines, and query analysis (EXPLAIN ANALYZE).',
    archiveSources: [
      { name: 'agency-database-optimizer', targetFile: 'database-optimization-indexing.md', title: 'Schema Design, Query Tuning & Indexing' },
      { name: 'agency-database-reliability-engineer', targetFile: 'dbre-reliability-failover.md', title: 'Database Reliability, Replication & Zero-Downtime Migrations' },
      { name: 'agency-data-engineer', targetFile: 'data-pipelines-lakehouse.md', title: 'Reliable ETL/ELT & Data Lakehouse Architecture' }
    ],
    curatedReferences: [
      {
        file: 'sqlite-native-embedded.md',
        title: 'SQLite Native & Node 24 Integration',
        content: `# SQLite Native & Node 24 Integration
- Zero native compilation dependencies with node:sqlite.
- WAL Mode: PRAGMA journal_mode = WAL for concurrent reads.
- Parameterized queries with prepared statements.
`
      },
      {
        file: 'postgres-advanced-indexing.md',
        title: 'PostgreSQL Indexing & Execution Plans',
        content: `# PostgreSQL Indexing & Query Plans
- B-Tree for equality and range.
- Composite indexes: Equality columns first, Range/sort columns last.
- Partial indexes: index WHERE status = 'active'.
- Inspect queries using EXPLAIN (ANALYZE, BUFFERS).
`
      }
    ]
  },

  'hub-devops-cloud-mastery': {
    title: 'DevOps, Cloud & Infrastructure Hub',
    category: 'Containers, CI/CD, Cloud Architecture & SRE',
    description: 'Master engineering hub for operations: multi-stage Docker builds, docker-compose orchestration, GitHub Actions CI/CD pipelines, cloud security, cost optimization (FinOps), incident response, and advanced Git workflows.',
    archiveSources: [
      { name: 'agency-devops-automator', targetFile: 'devops-automation-cicd.md', title: 'Infrastructure Automation & CI/CD Pipelines' },
      { name: 'agency-cloud-security-architect', targetFile: 'cloud-security-zero-trust.md', title: 'Cloud-Native Zero Trust Architecture' },
      { name: 'agency-finops-engineer', targetFile: 'finops-cloud-cost-optimization.md', title: 'Cloud Cost Allocation & Optimization' },
      { name: 'agency-git-workflow-master', targetFile: 'git-advanced-workflows.md', title: 'Git Workflows, Rebasing & Conventional Commits' },
      { name: 'agency-incident-response-commander', targetFile: 'incident-response-slo.md', title: 'Production Incident Response & Post-Mortems' }
    ],
    curatedReferences: [
      {
        file: 'docker-production-multistage.md',
        title: 'Production Multi-Stage Dockerfiles',
        content: `# Production Multi-Stage Dockerfiles
- Stage 1: Build dependencies and compile dist.
- Stage 2: Minimal runner image (alpine/distroless), non-root user.
- Eliminate build tools and source code from final image.
`
      }
    ]
  },

  'hub-security-compliance-mastery': {
    title: 'Security, PenTesting & Compliance Hub',
    category: 'AppSec, OWASP Top 10, Penetration Testing & Compliance',
    description: 'Master engineering hub for software security: OWASP Top 10 defense, penetration testing, IDOR detection, code security review, AI-generated code auditing, smart contract audits, and SOC 2 / HIPAA / GDPR compliance.',
    archiveSources: [
      { name: 'agency-application-security-engineer', targetFile: 'appsec-threat-modeling.md', title: 'Application Security & Threat Modeling' },
      { name: 'agency-ai-generated-code-security-auditor', targetFile: 'ai-code-security-audit.md', title: 'Auditing AI-Generated & Vibe-Coded Applications' },
      { name: 'agency-blockchain-security-auditor', targetFile: 'smart-contract-security.md', title: 'Smart Contract Security & Exploit Analysis' },
      { name: 'agency-compliance-auditor', targetFile: 'compliance-soc2-hipaa-gdpr.md', title: 'Technical Compliance (SOC 2, ISO 27001, HIPAA)' },
      { name: 'agency-incident-responder', targetFile: 'forensics-incident-investigation.md', title: 'Digital Forensics & Incident Containment' }
    ],
    curatedReferences: [
      {
        file: 'owasp-remediation-matrix.md',
        title: 'OWASP Top 10 Remediation Matrix',
        content: `# OWASP Top 10 Remediation Matrix
- SQLi: Use parameterized queries exclusively.
- IDOR: Always check resource ownership against authenticated user ID.
- XSS: Sanitize inputs, enforce Content-Security-Policy (CSP).
- Secrets: Never commit API keys; verify .env in .gitignore.
`
      }
    ]
  },

  'hub-testing-qa-automation': {
    title: 'Testing & QA Automation Hub',
    category: 'Unit, Integration, E2E & Performance Testing',
    description: 'Master engineering hub for quality assurance: Test-Driven Development (TDD) red-green loops, API testing, Playwright headless browser automation, unit/integration testing, and reproducible bug verification.',
    archiveSources: [
      { name: 'agency-api-tester', targetFile: 'api-validation-testing.md', title: 'Comprehensive API Validation & Contract Testing' },
      { name: 'agency-evidence-collector', targetFile: 'qa-evidence-reproduction.md', title: 'Reproducible Defect Reporting & Verification' }
    ],
    curatedReferences: [
      {
        file: 'tdd-agentic-protocol.md',
        title: 'TDD Agentic Protocol',
        content: `# TDD Protocol
1. Write failing test first.
2. Execute to verify expected failure.
3. Write minimal passing implementation.
4. Refactor with zero regressions.
`
      },
      {
        file: 'playwright-e2e-suite.md',
        title: 'Playwright E2E & Browser Automation',
        content: `# Playwright E2E Testing
- Wait for selectors or network idle, never hardcoded sleeps.
- Test happy paths, form validation errors, and offline network state.
`
      }
    ]
  },

  'hub-ai-ml-agentic-mastery': {
    title: 'AI, ML & Agentic Systems Hub',
    category: 'LLMs, AI Evals, Agent Orchestration & RAG',
    description: 'Master engineering hub for AI systems: LLM model deployment, prompt engineering, AI evaluation benchmarks, multi-agent orchestration, agentic identity, vector search/RAG, and AEO optimization.',
    archiveSources: [
      { name: 'agency-ai-engineer', targetFile: 'ai-ml-production-systems.md', title: 'Machine Learning Model Development & Production' },
      { name: 'agency-agents-orchestrator', targetFile: 'multi-agent-orchestration.md', title: 'Autonomous Multi-Agent Workflow Management' },
      { name: 'agency-agentic-identity-trust-architect', targetFile: 'agentic-identity-trust.md', title: 'Agent Identity, Verification & Audit Trails' },
      { name: 'agency-ai-citation-strategist', targetFile: 'ai-search-optimization-aeo.md', title: 'AI Engine Optimization & Citations (AEO/GEO)' }
    ],
    curatedReferences: [
      {
        file: 'ai-evals-framework.md',
        title: 'AI Evals & Benchmark Testing',
        content: `# AI Evals & Benchmarking
- Gold standard dataset with diverse test cases.
- Deterministic assertions: schema validity, forbidden terms.
- Model-as-a-Judge scoring rubrics (1-5 scale).
- Regression gate before deploying prompt modifications.
`
      }
    ]
  },

  'hub-scraping-reverse-eng': {
    title: 'Web Scraping & Reverse Engineering Hub',
    category: 'Headless Scraping, Network Inspection & API Extraction',
    description: 'Master engineering hub for data acquisition: headless browser scraping, API reverse-engineering, anti-bot mitigation, network payload inspection, and resilient typed client generation.',
    archiveSources: [
      { name: 'agency-email-intelligence-engineer', targetFile: 'structured-data-extraction.md', title: 'Extracting Structured Data from Raw Payloads' }
    ],
    curatedReferences: [
      {
        file: 'api-reverse-engineering-guide.md',
        title: 'API Reverse Engineering Runbook',
        content: `# API Reverse Engineering
1. Inspect network calls in DevTools.
2. Strip optional headers to find mandatory tokens.
3. Replicate request in Node/TypeScript.
4. Model typed response schemas with Zod.
`
      },
      {
        file: 'headless-stealth-scraping.md',
        title: 'Headless Stealth Scraping Patterns',
        content: `# Headless Stealth Scraping
- Block images and fonts to accelerate page loads.
- Extract embedded JSON state (__INITIAL_STATE__) where possible.
- Handle rate limits with randomized request delays.
`
      }
    ]
  },

  'hub-architecture-clean-code': {
    title: 'Software Architecture & Clean Code Hub',
    category: 'Clean Architecture, Refactoring, Code Reviews & Patterns',
    description: 'Master engineering hub for software craftsmanship: SOLID principles, cyclomatic complexity reduction, pure function extraction, codebase onboarding, code reviews, and drift detection.',
    archiveSources: [
      { name: 'agency-code-reviewer', targetFile: 'code-review-best-practices.md', title: 'Constructive & Actionable Code Reviews' },
      { name: 'agency-codebase-onboarding-engineer', targetFile: 'codebase-onboarding-navigation.md', title: 'Rapid Unfamiliar Codebase Exploration' },
      { name: 'agency-codebase-archaeologist', targetFile: 'code-drift-detection.md', title: 'Multi-Tool Drift & Logic Mismatch Detection' }
    ],
    curatedReferences: [
      {
        file: 'clean-code-refactoring-patterns.md',
        title: 'Clean Code Refactoring Patterns',
        content: `# Clean Code Refactoring
- Invert if checks into early guard returns.
- Maximum indentation: 2 levels per function.
- Decouple pure business logic from I/O.
- Discriminated unions instead of loose objects or any.
`
      }
    ]
  },

  'hub-product-growth-strategy': {
    title: 'Rapid MVP, Product & Strategy Hub',
    category: 'MVP Delivery, PRDs, Experimentation & Business Models',
    description: 'Master engineering hub for rapid product delivery: end-to-end MVP building, Spec-Driven Development, PRD authoring, growth experimentation, A/B testing, and executive decision-making.',
    archiveSources: [
      { name: 'agency-business-strategist', targetFile: 'business-strategy-models.md', title: 'Business Model Design & Competitive Strategy' },
      { name: 'agency-experiment-tracker', targetFile: 'growth-experimentation-ab-testing.md', title: 'A/B Testing & Systematic Experimentation' },
      { name: 'agency-growth-hacker', targetFile: 'viral-loops-acquisition.md', title: 'Growth Engineering & Conversion Funnels' }
    ],
    curatedReferences: [
      {
        file: 'mvp-rapid-delivery-protocol.md',
        title: 'MVP Rapid Delivery Protocol',
        content: `# MVP Rapid Delivery Protocol
1. Define 1-3 core user workflows.
2. Model schema & database contract.
3. Build backend endpoints with validation.
4. Integrate responsive UI with all 4 async states (idle, loading, success, error).
`
      },
      {
        file: 'spec-driven-design.md',
        title: 'Spec-Driven Design & PRD Standards',
        content: `# Spec-Driven Development
- Problem statement & core scenarios.
- Data models & API contracts.
- Incremental prioritized implementation checklist.
`
      }
    ]
  }
};

/**
 * Builds all 10 Super-Hubs
 */
export function buildMonsterSuperHubs() {
  const summary = [];

  for (const [hubId, hubDef] of Object.entries(SUPER_HUBS)) {
    const hubDir = path.join(GLOBAL_SKILLS_DIR, hubId);
    const refDir = path.join(hubDir, 'references');

    if (!fs.existsSync(refDir)) {
      fs.mkdirSync(refDir, { recursive: true });
    }

    const refLinks = [];

    // 1. Process archive sources
    for (const src of hubDef.archiveSources) {
      const srcSkillFile = path.join(ARCHIVE_DIR, src.name, 'SKILL.md');
      if (fs.existsSync(srcSkillFile)) {
        try {
          const raw = fs.readFileSync(srcSkillFile, 'utf8');
          // Strip existing frontmatter
          const cleanBody = raw.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, '').trim();
          const targetPath = path.join(refDir, src.targetFile);
          fs.writeFileSync(targetPath, `# ${src.title}\n\n${cleanBody}`, 'utf8');
          refLinks.push(`- **[${src.title}](./references/${src.targetFile})**: In-depth procedures and workflows.`);
        } catch {
          // Ignore read errors
        }
      }
    }

    // 2. Process curated references
    for (const cur of hubDef.curatedReferences) {
      const targetPath = path.join(refDir, cur.file);
      fs.writeFileSync(targetPath, cur.content, 'utf8');
      refLinks.push(`- **[${cur.title}](./references/${cur.file})**: Guidelines, code patterns, and checklists.`);
    }

    // 3. Write main SKILL.md for the Super-Hub (Ultra-concise for token efficiency)
    const skillContent = `---
name: ${hubId}
description: >-
  ${hubDef.description}
---

# ${hubDef.title}

${hubDef.description}

## Comprehensive Reference Runbooks (${refLinks.length} Specialized Topics)
${refLinks.join('\n')}

## Usage Protocol
When handling a task related to this domain, activate this hub and immediately view the relevant reference file from the \`references/\` directory above. This ensures elite-level specialization while keeping the context window light and efficient.
`;

    fs.writeFileSync(path.join(hubDir, 'SKILL.md'), skillContent, 'utf8');

    summary.push({
      hubId,
      title: hubDef.title,
      referenceCount: refLinks.length,
      path: path.join(hubDir, 'SKILL.md')
    });
  }

  return summary;
}

/**
 * Installs the 3 Autonomous Elite Subagents plugin into ~/.gemini/config/plugins/antigravity-elite-agents
 */
export function installEliteSubagents() {
  const pluginDir = path.join(HOME, '.gemini', 'config', 'plugins', 'antigravity-elite-agents');
  const agentsDir = path.join(pluginDir, 'agents');

  if (!fs.existsSync(agentsDir)) {
    fs.mkdirSync(agentsDir, { recursive: true });
  }

  const agents = [
    {
      file: 'architecture-reviewer.md',
      content: `---
description: Principal Systems Architect subagent. Specializes in auditing system boundaries, decoupling dependencies, ensuring clean separation of concerns, and evaluating scalability.
---
You are the Principal Systems Architect subagent. When invoked, inspect the target codebase modules, evaluate SOLID principles, identify tight coupling or circular dependencies, and return a structured architectural review with concrete refactoring steps.`
    },
    {
      file: 'qa-systems-tester.md',
      content: `---
description: Autonomous Quality Assurance & Systems Testing subagent. Specializes in executing unit tests, integration tests, E2E browser tests with Playwright, and verifying zero regressions.
---
You are the Autonomous QA & Systems Testing subagent. When invoked, run the project's test suite, diagnose any failing assertions or runtime stack traces, write missing edge-case tests, and report empirical verification metrics.`
    },
    {
      file: 'security-red-team-agent.md',
      content: `---
description: Adversarial Security & Penetration Testing subagent. Specializes in auditing applications for OWASP Top 10 vulnerabilities, IDOR, injection flaws, hardcoded credentials, and broken authentication.
---
You are the Adversarial Security Red Team subagent. When invoked, audit the codebase for injection vectors, broken access controls, exposed secrets, and insecure configurations. Provide severity ratings and exact remediation diffs.`
    },
    {
      file: 'web-performance-auditor.md',
      content: `---
description: Core Web Vitals & Web Performance Auditor subagent. Specializes in optimizing LCP, INP, CLS, bundle size, rendering performance, and network waterfalls.
---
You are the Web Performance Auditor subagent. When invoked, audit frontend codebases and live pages for Core Web Vitals bottlenecks (LCP, INP, CLS), render-blocking resources, layout shifts, and heavy JavaScript bundles, returning concrete optimization diffs.`
    },
    {
      file: 'code-modernizer.md',
      content: `---
description: Legacy Code Modernization & Migration Specialist subagent. Specializes in extracting business rules, upgrading framework versions, simplifying complex modules, and executing zero-regression migrations.
---
You are the Code Modernizer & Migration Specialist subagent. When invoked, analyze legacy modules, map version deltas, extract core business invariants, simplify over-engineered abstractions, and execute safe, incremental code upgrades.`
    }
  ];

  for (const ag of agents) {
    fs.writeFileSync(path.join(agentsDir, ag.file), ag.content, 'utf8');
  }

  // Register plugin in ~/.gemini/config/config.json if present
  const configPath = path.join(HOME, '.gemini', 'config', 'config.json');
  try {
    let cfg = { plugins: {} };
    if (fs.existsSync(configPath)) {
      cfg = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    }
    if (!cfg.plugins) cfg.plugins = {};
    cfg.plugins['antigravity-elite-agents'] = { enabled: true };
    fs.writeFileSync(configPath, JSON.stringify(cfg, null, 2), 'utf8');
  } catch {
    // Non-fatal if config.json has custom structure
  }

  return {
    installed: agents.map(a => a.file.replace(/\.md$/, '')),
    pluginDir
  };
}

