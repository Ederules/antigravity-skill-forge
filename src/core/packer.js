/**
 * Skill Packer for Antigravity
 * Bundles multiple specialized skills in a domain into a single Domain Hub Skill
 * using progressive disclosure (SKILL.md + references/*.md).
 */

import fs from 'node:fs';
import path from 'node:path';
import { getGlobalSkillsDir } from './installer.js';

export const DOMAIN_PACKS = {
  'ui-ux-mastery': {
    name: 'ui-ux-mastery',
    category: 'Frontend & UI/UX',
    description: 'Master UI/UX engineering catalog. Activates whenever building frontend interfaces, component styling, animations, responsive design, or accessibility.',
    references: [
      {
        file: 'tailwind-design-system.md',
        title: 'Tailwind Design System & Tokens',
        content: `# Tailwind Design System & Tokens
- Color scales (50-900) with semantic aliases.
- Spacing grid: strict 4px/8px multiples.
- Typography: contrast between bold headings and relaxed body text.
- Dark mode: use .dark class on html with slate-950/slate-900 surfaces.
`
      },
      {
        file: 'micro-interactions.md',
        title: 'Micro-interactions & Interactive States',
        content: `# Micro-interactions & Component States
- Active/pressed state: active:scale-[0.98] transition-transform.
- Hover: hover:bg-opacity-90 transition-colors duration-150.
- Focus: focus-visible:ring-2 focus-visible:ring-offset-2.
- Loading states: skeleton loaders mirroring actual content dimensions.
`
      },
      {
        file: 'responsive-layouts.md',
        title: 'Responsive Grid & Flexbox Layouts',
        content: `# Responsive Layouts
- Mobile first: grid-cols-1 md:grid-cols-2 lg:grid-cols-3.
- Viewport bounds: min 375px to max 1440px+.
- Overflow prevention: min-w-0 on flex children, truncate or line-clamp on text.
`
      },
      {
        file: 'a11y-wcag-rules.md',
        title: 'Accessibility (a11y) & WCAG AA Checklist',
        content: `# Accessibility & WCAG AA
- Contrast: minimum 4.5:1 for body text, 3:1 for large text.
- Forms: every input must have an explicit <label> or aria-label.
- Keyboard navigation: all interactive elements reachable via Tab.
`
      }
    ]
  },
  'database-mastery': {
    name: 'database-mastery',
    category: 'Databases & Performance',
    description: 'Comprehensive database engineering catalog. Activates for schema design, SQLite/PostgreSQL optimization, indexing, query analysis, and migrations.',
    references: [
      {
        file: 'schema-design-rules.md',
        title: 'Relational Schema Design & Constraints',
        content: `# Relational Schema Design
- Enforce foreign keys with ON DELETE CASCADE or RESTRICT.
- Use TIMESTAMPTZ (UTC) for all timestamps.
- Currency in integer cents (amount_cents INTEGER), never floating point.
`
      },
      {
        file: 'indexing-strategies.md',
        title: 'High-Performance Indexing Strategies',
        content: `# Indexing Strategies
- B-Tree for equality and range filters.
- Composite indexes: Equality columns first, range/sort columns last.
- Partial indexes: index WHERE status = 'active' to reduce 80% overhead.
`
      },
      {
        file: 'query-optimization.md',
        title: 'Query Optimization & EXPLAIN ANALYZE',
        content: `# Query Optimization
- Use EXPLAIN ANALYZE to identify sequential scans.
- Keyset pagination (WHERE id > :cursor) instead of OFFSET.
- Avoid SELECT * in production API queries.
`
      }
    ]
  },
  'security-qa-mastery': {
    name: 'security-qa-mastery',
    category: 'Security & Quality Assurance',
    description: 'Master security auditing and test automation catalog. Activates for vulnerability scans, penetration tests, TDD loops, and Playwright E2E suites.',
    references: [
      {
        file: 'owasp-audit-checklist.md',
        title: 'OWASP Top 10 Audit Checklist',
        content: `# OWASP Top 10 Audit Checklist
- Parameterized SQL queries (zero string concatenation).
- Check ownership on all mutating endpoints (BOLA/IDOR prevention).
- Enforce HttpOnly, Secure, SameSite=Strict on auth cookies.
`
      },
      {
        file: 'tdd-testing-cycle.md',
        title: 'Test-Driven Development (TDD) Protocol',
        content: `# TDD Protocol
- Phase 1: Write failing test first.
- Phase 2: Run test and observe expected failure.
- Phase 3: Write minimal passing implementation.
- Phase 4: Refactor with green tests.
`
      },
      {
        file: 'playwright-e2e-patterns.md',
        title: 'Playwright E2E & Browser Automation',
        content: `# Playwright E2E Patterns
- Wait for selectors or network idle, never hardcoded sleep.
- Test happy path, validation error paths, and network offline states.
`
      }
    ]
  }
};

/**
 * Installs a Domain Hub Skill with progressive disclosure
 */
export function installDomainHub(hubId) {
  const hub = DOMAIN_PACKS[hubId];
  if (!hub) {
    throw new Error(`Domain hub "${hubId}" not found.`);
  }

  const globalDir = getGlobalSkillsDir();
  const skillDir = path.join(globalDir, hub.name);
  const refDir = path.join(skillDir, 'references');

  if (!fs.existsSync(refDir)) {
    fs.mkdirSync(refDir, { recursive: true });
  }

  // Write references
  const refLinks = [];
  for (const ref of hub.references) {
    const refPath = path.join(refDir, ref.file);
    fs.writeFileSync(refPath, ref.content, 'utf8');
    refLinks.push(`- **[${ref.title}](./references/${ref.file})**: Deep guidelines and procedures.`);
  }

  // Write main SKILL.md (compact, progressive disclosure)
  const mainContent = `---
name: ${hub.name}
description: >-
  ${hub.description}
---

# ${hub.name.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ')}

This domain hub provides comprehensive, progressive runbooks and procedures for ${hub.category}.

## Specialized Topic Runbooks
${refLinks.join('\n')}

## Usage Directive
When handling tasks in this domain, read the relevant reference document from the \`references/\` directory above to follow specialized procedures without cluttering the global context.
`;

  fs.writeFileSync(path.join(skillDir, 'SKILL.md'), mainContent, 'utf8');

  return {
    success: true,
    name: hub.name,
    installedPath: path.join(skillDir, 'SKILL.md'),
    referencesCount: hub.references.length
  };
}
