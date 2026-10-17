/**
 * Autonomous Mass Harvester for Antigravity Skill Forge
 * Synchronizes multi-domain engineering runbooks and organizes everything
 * into the 10 Master Super-Hubs using Progressive Disclosure.
 */

import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { SUPER_HUBS } from './monster-builder.js';
import { sanitizeSkillContent } from './security-sanitizer.js';

const HOME = os.homedir();
const GLOBAL_SKILLS_DIR = path.join(HOME, '.gemini', 'config', 'skills');
const ARCHIVE_DIR = path.join(HOME, '.gemini', 'config', 'skills_archive');

// Domain classification heuristics with weighted scoring to avoid false positives
export function classifySkillDomain(filename, content) {
  const text = (filename + ' ' + content).toLowerCase();

  const domainScores = {
    'hub-ai-ml-agentic-mastery': 0,
    'hub-security-compliance-mastery': 0,
    'hub-database-data-mastery': 0,
    'hub-testing-qa-automation': 0,
    'hub-devops-cloud-mastery': 0,
    'hub-scraping-reverse-eng': 0,
    'hub-backend-api-mastery': 0,
    'hub-frontend-mobile-mastery': 0,
    'hub-architecture-clean-code': 0,
    'hub-product-growth-strategy': 0
  };

  const check = (regex, domain, weight = 1) => {
    const matches = text.match(regex);
    if (matches) {
      domainScores[domain] += matches.length * weight;
    }
  };

  // AI & ML
  check(/\b(llm|gpt|openai|gemini|claude|prompt|embedding|vector|rag|langchain|langgraph|agentic|fine-tune|agent|model|inference)\b/g, 'hub-ai-ml-agentic-mastery', 3);

  // Security & Compliance
  check(/\b(security|vulnerability|owasp|pentest|exploit|crypto|solidity|smart contract|blockchain|audit|compliance|soc2|gdpr|hipaa|auth-bypass|cve)\b/g, 'hub-security-compliance-mastery', 3);

  // Database & Data
  check(/\b(postgres|postgresql|sqlite|mysql|mongodb|redis|sql|schema|database|migration|prisma|dbt|etl|bigquery|lakehouse|data warehouse|indexing)\b/g, 'hub-database-data-mastery', 3);

  // Testing & QA
  check(/\b(playwright|cypress|jest|vitest|tdd|test-driven|qa|assertion|test runner|unit test|integration test|e2e|coverage|mocking)\b/g, 'hub-testing-qa-automation', 3);

  // DevOps & Cloud
  check(/\b(docker|kubernetes|k8s|helm|terraform|ansible|ci\/cd|github actions|devops|aws|gcp|azure|nginx|deploy|container|linux|sysadmin)\b/g, 'hub-devops-cloud-mastery', 3);

  // Scraping & Reverse Engineering
  check(/\b(scraper|scraping|crawl|crawler|puppeteer|cheerio|beautifulsoup|reverse engineer|payload|intercept|wireshark|curl|packet)\b/g, 'hub-scraping-reverse-eng', 3);

  // Backend & APIs
  check(/\b(fastapi|express|nestjs|django|flask|spring|microservice|rest api|restful|graphql|grpc|endpoint|oauth|jwt|auth|websocket|middleware)\b/g, 'hub-backend-api-mastery', 2);

  // Frontend & Mobile
  check(/\b(react|vue|angular|svelte|nextjs|tailwind|css|scss|flutter|react native|swift|kotlin|ios|android|shadcn|component|accessibility|a11y|viewport|frontend)\b/g, 'hub-frontend-mobile-mastery', 2);

  // Architecture & Clean Code
  check(/\b(refactor|clean code|solid|design pattern|dry|code smell|architecture|maintainability|cyclomatic|domain-driven|hexagonal)\b/g, 'hub-architecture-clean-code', 2);

  // Product & Growth
  check(/\b(marketing|seo|copywriting|funnel|conversion|growth|analytics|saas|pricing|landing page|pitch|ab test|customer|cac|ltv|retention)\b/g, 'hub-product-growth-strategy', 2);

  // Find max score
  let bestDomain = 'hub-product-growth-strategy';
  let maxScore = 0;

  for (const [domain, score] of Object.entries(domainScores)) {
    if (score > maxScore) {
      maxScore = score;
      bestDomain = domain;
    }
  }

  return bestDomain;
}

/**
 * Concurrency helper for parallel fetching
 */
async function asyncPool(limit, items, iteratorFn) {
  const ret = [];
  const executing = new Set();
  for (const item of items) {
    const p = Promise.resolve().then(() => iteratorFn(item));
    ret.push(p);
    executing.add(p);
    const clean = () => executing.delete(p);
    p.then(clean, clean);
    if (executing.size >= limit) {
      await Promise.race(executing);
    }
  }
  return Promise.all(ret);
}

/**
 * Adapt third-party skill content to Antigravity directives
 */
function adaptContentToAntigravity(content) {
  const { cleanContent } = sanitizeSkillContent(content);
  return cleanContent
    .replace(/\bCLAUDE\.md\b/g, 'AGENTS.md')
    .replace(/\bClaude Code\b/gi, 'Antigravity')
    .replace(/\bClaude\b/g, 'Antigravity Agent');
}

/**
 * Harvest local archived skills into the hubs
 */
export function harvestArchivedSkills() {
  if (!fs.existsSync(ARCHIVE_DIR)) return 0;

  const entries = fs.readdirSync(ARCHIVE_DIR, { withFileTypes: true });
  let count = 0;

  for (const entry of entries) {
    if (entry.isDirectory()) {
      const skillFile = path.join(ARCHIVE_DIR, entry.name, 'SKILL.md');
      if (fs.existsSync(skillFile)) {
        try {
          const raw = fs.readFileSync(skillFile, 'utf8');
          const cleanBody = raw.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, '').trim();
          const targetHubId = classifySkillDomain(entry.name, cleanBody);

          const hubRefDir = path.join(GLOBAL_SKILLS_DIR, targetHubId, 'references');
          if (!fs.existsSync(hubRefDir)) fs.mkdirSync(hubRefDir, { recursive: true });

          const safeFilename = `${entry.name.replace(/^agency-/, '')}.md`;
          const targetPath = path.join(hubRefDir, safeFilename);

          const title = entry.name
            .replace(/^agency-/, '')
            .split('-')
            .map(w => w.charAt(0).toUpperCase() + w.slice(1))
            .join(' ');

          const adapted = adaptContentToAntigravity(cleanBody);
          fs.writeFileSync(targetPath, `# ${title}\n\n${adapted}`, 'utf8');
          count++;
        } catch {
          // Ignore individual read errors
        }
      }
    }
  }

  return count;
}

/**
 * Harvest remote Cursor rules from PatrickJS/awesome-cursorrules
 */
export async function harvestRemoteCursorRules(limit = 300) {
  try {
    const treeRes = await fetch('https://api.github.com/repos/PatrickJS/awesome-cursorrules/git/trees/main?recursive=1', {
      headers: { 'User-Agent': 'Antigravity-Harvester' }
    });

    if (!treeRes.ok) return 0;
    const treeData = await treeRes.json();
    const ruleFiles = (treeData.tree || []).filter(item =>
      item.path.startsWith('rules/') && (item.path.endsWith('.mdc') || item.path.endsWith('.md'))
    ).slice(0, limit);

    let count = 0;

    await asyncPool(10, ruleFiles, async (file) => {
      try {
        const rawUrl = `https://raw.githubusercontent.com/PatrickJS/awesome-cursorrules/main/${file.path}`;
        const contentRes = await fetch(rawUrl, { headers: { 'User-Agent': 'Antigravity-Harvester' } });
        if (!contentRes.ok) return;

        const raw = await contentRes.text();
        const baseName = path.basename(file.path, path.extname(file.path)).replace(/-cursorrules-prompt-file$/, '');
        const targetHubId = classifySkillDomain(baseName, raw);

        const hubRefDir = path.join(GLOBAL_SKILLS_DIR, targetHubId, 'references');
        if (!fs.existsSync(hubRefDir)) fs.mkdirSync(hubRefDir, { recursive: true });

        const safeFilename = `cursor-${baseName}.md`;
        const targetPath = path.join(hubRefDir, safeFilename);

        const title = baseName
          .split('-')
          .map(w => w.charAt(0).toUpperCase() + w.slice(1))
          .join(' ');

        const adapted = adaptContentToAntigravity(raw);
        fs.writeFileSync(targetPath, `# ${title} (Cursor Best Practices)\n\n${adapted}`, 'utf8');
        count++;
      } catch {
        // Continue on individual fetch error
      }
    });

    return count;
  } catch (err) {
    console.error('Remote cursor harvest error:', err.message);
    return 0;
  }
}

/**
 * Harvest real skills from alirezarezvani/claude-skills
 */
export async function harvestClaudeSkillsRepo(limit = 450) {
  try {
    const treeRes = await fetch('https://api.github.com/repos/alirezarezvani/claude-skills/git/trees/main?recursive=1', {
      headers: { 'User-Agent': 'Antigravity-Harvester' }
    });

    if (!treeRes.ok) return 0;
    const treeData = await treeRes.json();

    // Select real non-symlink SKILL.md files
    const skillFiles = (treeData.tree || []).filter(item =>
      item.path.endsWith('SKILL.md') && !item.path.startsWith('.gemini/')
    ).slice(0, limit);

    let count = 0;

    await asyncPool(10, skillFiles, async (file) => {
      try {
        const rawUrl = `https://raw.githubusercontent.com/alirezarezvani/claude-skills/main/${file.path}`;
        const contentRes = await fetch(rawUrl, { headers: { 'User-Agent': 'Antigravity-Harvester' } });
        if (!contentRes.ok) return;

        const raw = await contentRes.text();
        // Skip any symlink pointers that might remain
        if (raw.startsWith('../') || raw.length < 50) return;

        // Extract folder name as base name
        const pathParts = file.path.split('/');
        // e.g. engineering-team/a11y-audit/skills/a11y-audit/SKILL.md
        const skillName = pathParts[pathParts.length - 2] || pathParts[1] || 'skill';

        const cleanBody = raw.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, '').trim();
        const targetHubId = classifySkillDomain(skillName, cleanBody);

        const hubRefDir = path.join(GLOBAL_SKILLS_DIR, targetHubId, 'references');
        if (!fs.existsSync(hubRefDir)) fs.mkdirSync(hubRefDir, { recursive: true });

        const safeFilename = `pro-${skillName}.md`;
        const targetPath = path.join(hubRefDir, safeFilename);

        const title = skillName
          .split('-')
          .map(w => w.charAt(0).toUpperCase() + w.slice(1))
          .join(' ');

        const adapted = adaptContentToAntigravity(cleanBody);
        fs.writeFileSync(targetPath, `# ${title} (Pro Engineering Runbook)\n\n${adapted}`, 'utf8');
        count++;
      } catch {
        // Ignore single failure
      }
    });

    return count;
  } catch (err) {
    console.error('Claude skills harvest error:', err.message);
    return 0;
  }
}

/**
 * Harvest marketing, product, and growth skills from coreyhaines31/marketingskills
 */
export async function harvestMarketingSkills(limit = 350) {
  try {
    const treeRes = await fetch('https://api.github.com/repos/coreyhaines31/marketingskills/git/trees/main?recursive=1', {
      headers: { 'User-Agent': 'Antigravity-Harvester' }
    });

    if (!treeRes.ok) return 0;
    const treeData = await treeRes.json();

    const mdFiles = (treeData.tree || []).filter(item =>
      item.path.endsWith('.md') && !item.path.toLowerCase().includes('readme') && !item.path.toLowerCase().includes('license')
    ).slice(0, limit);

    let count = 0;

    await asyncPool(10, mdFiles, async (file) => {
      try {
        const rawUrl = `https://raw.githubusercontent.com/coreyhaines31/marketingskills/main/${file.path}`;
        const contentRes = await fetch(rawUrl, { headers: { 'User-Agent': 'Antigravity-Harvester' } });
        if (!contentRes.ok) return;

        const raw = await contentRes.text();
        if (raw.length < 50) return;

        const baseName = path.basename(file.path, '.md');
        const cleanBody = raw.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, '').trim();
        const targetHubId = classifySkillDomain(baseName, cleanBody);

        const hubRefDir = path.join(GLOBAL_SKILLS_DIR, targetHubId, 'references');
        if (!fs.existsSync(hubRefDir)) fs.mkdirSync(hubRefDir, { recursive: true });

        const safeFilename = `growth-${baseName}.md`;
        const targetPath = path.join(hubRefDir, safeFilename);

        const title = baseName
          .split('-')
          .map(w => w.charAt(0).toUpperCase() + w.slice(1))
          .join(' ');

        const adapted = adaptContentToAntigravity(cleanBody);
        fs.writeFileSync(targetPath, `# ${title} (Growth & Product Runbook)\n\n${adapted}`, 'utf8');
        count++;
      } catch {
        // Ignore single failure
      }
    });

    return count;
  } catch (err) {
    console.error('Marketing skills harvest error:', err.message);
    return 0;
  }
}

/**
 * Harvest 1,000+ additional skills from mrgoonie/claudekit-skills, Jeffallan/claude-skills,
 * and Imbad0202/academic-research-skills to surpass 2,000+ total active runbooks.
 */
export async function harvestExtendedCommunityRepos() {
  const sources = [
    { repo: 'anthropics/claude-plugins-official', prefix: 'anthro', limit: 250 },
    { repo: 'addyosmani/agent-skills', prefix: 'addy', limit: 120 },
    { repo: 'mrgoonie/claudekit-skills', prefix: 'kit', limit: 310 },
    { repo: 'Jeffallan/claude-skills', prefix: 'jeff', limit: 450 },
    { repo: 'Imbad0202/academic-research-skills', prefix: 'res', limit: 450 }
  ];

  let totalIngested = 0;

  for (const src of sources) {
    try {
      const treeRes = await fetch(`https://api.github.com/repos/${src.repo}/git/trees/main?recursive=1`, {
        headers: { 'User-Agent': 'Antigravity-Harvester' }
      });
      if (!treeRes.ok) continue;

      const treeData = await treeRes.json();
      const mdFiles = (treeData.tree || []).filter(item => {
        const p = item.path.toLowerCase();
        return (p.endsWith('.md') || p.endsWith('.mdc')) &&
               !p.includes('readme') &&
               !p.includes('changelog') &&
               !p.includes('license') &&
               !p.includes('contributing') &&
               !p.includes('pull_request_template');
      }).slice(0, src.limit);

      await asyncPool(15, mdFiles, async (file) => {
        try {
          const rawUrl = `https://raw.githubusercontent.com/${src.repo}/main/${file.path}`;
          const contentRes = await fetch(rawUrl, { headers: { 'User-Agent': 'Antigravity-Harvester' } });
          if (!contentRes.ok) return;

          const raw = await contentRes.text();
          if (raw.length < 60 || raw.startsWith('../')) return;

          const slug = file.path
            .replace(/\.(md|mdc)$/i, '')
            .replace(/\/skill$/i, '')
            .replace(/^\.claude\//, '')
            .replace(/[^a-zA-Z0-9]+/g, '-')
            .replace(/^-|-$/g, '')
            .toLowerCase();

          const cleanBody = raw.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, '').trim();
          const targetHubId = classifySkillDomain(slug, cleanBody);

          const hubRefDir = path.join(GLOBAL_SKILLS_DIR, targetHubId, 'references');
          if (!fs.existsSync(hubRefDir)) fs.mkdirSync(hubRefDir, { recursive: true });

          const safeFilename = `${src.prefix}-${slug.slice(0, 75)}.md`;
          const targetPath = path.join(hubRefDir, safeFilename);

          const title = slug
            .split('-')
            .slice(-4)
            .map(w => w.charAt(0).toUpperCase() + w.slice(1))
            .join(' ');

          const adapted = adaptContentToAntigravity(cleanBody);
          fs.writeFileSync(targetPath, `# ${title} (Engineering Runbook)\n\n${adapted}`, 'utf8');
          totalIngested++;
        } catch {
          // Ignore single file error
        }
      });
    } catch {
      // Continue with next source
    }
  }

  return totalIngested;
}

/**
 * Regenerates all SKILL.md indexes and references/INDEX.md for the 10 Master Hubs
 * Ensures SKILL.md is ALWAYS under 4 KB (far below the 24 KB ceiling).
 */
export function rebuildAllHubIndexes() {
  const summary = [];

  for (const [hubId, hubDef] of Object.entries(SUPER_HUBS)) {
    const hubDir = path.join(GLOBAL_SKILLS_DIR, hubId);
    const refDir = path.join(hubDir, 'references');

    if (!fs.existsSync(refDir)) continue;

    // Filter out INDEX.md itself
    const files = fs.readdirSync(refDir).filter(f => f.endsWith('.md') && f !== 'INDEX.md');
    files.sort();

    const allRefLinks = [];
    for (const f of files) {
      const cleanTitle = f
        .replace(/\.md$/, '')
        .replace(/^cursor-/, 'Cursor: ')
        .replace(/^pro-/, 'Pro: ')
        .replace(/^growth-/, 'Growth: ')
        .split('-')
        .map(w => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
      allRefLinks.push(`- [${cleanTitle}](./${f})`);
    }

    // 1. Write the full comprehensive references/INDEX.md
    const indexContent = `# ${hubDef.title} - Complete Runbook Index (${files.length} Procedures)

This catalog contains all specialized reference runbooks and standard operating procedures available in this domain.
Load any individual runbook into your context on demand using view_file.

${allRefLinks.join('\n')}
`;
    fs.writeFileSync(path.join(refDir, 'INDEX.md'), indexContent, 'utf8');

    // 2. Build lightweight SKILL.md with Top 15 highlights + link to INDEX.md
    const featuredLinks = allRefLinks.slice(0, 15).map(link => link.replace('./', './references/'));

    const skillContent = `---
name: ${hubId}
description: >-
  ${hubDef.description}
---

# ${hubDef.title}

${hubDef.description}

> [!IMPORTANT]
> **Domain Catalog**: This Super-Hub manages **${files.length} specialized procedures and runbooks**.
> To view the full list of runbooks, consult [references/INDEX.md](./references/INDEX.md).

## Featured Core Procedures
${featuredLinks.join('\n')}
${files.length > 15 ? `\n...and **${files.length - 15} additional specialized runbooks** documented in [references/INDEX.md](./references/INDEX.md).\n` : ''}
## Usage Protocol
When executing tasks within this domain:
1. Identify the topic needed or inspect [references/INDEX.md](./references/INDEX.md).
2. Load the specific \`references/<runbook>.md\` using \`view_file\`.
3. Follow the empirical steps, code patterns, and defensive rules defined in the runbook.
`;

    const skillFilePath = path.join(hubDir, 'SKILL.md');
    fs.writeFileSync(skillFilePath, skillContent, 'utf8');
    const skillBytes = fs.statSync(skillFilePath).size;

    summary.push({
      hubId,
      title: hubDef.title,
      referenceCount: files.length,
      skillBytes
    });
  }

  return summary;
}

/**
 * Reclassifies all existing reference files in all hubs using current domain classifier
 */
export function reclassifyAllExistingRunbooks() {
  const allFiles = [];

  for (const hubId of Object.keys(SUPER_HUBS)) {
    const refDir = path.join(GLOBAL_SKILLS_DIR, hubId, 'references');
    if (!fs.existsSync(refDir)) continue;

    const files = fs.readdirSync(refDir).filter(f => f.endsWith('.md') && f !== 'INDEX.md');
    for (const f of files) {
      allFiles.push({
        currentHub: hubId,
        filename: f,
        fullPath: path.join(refDir, f)
      });
    }
  }

  let moved = 0;
  for (const item of allFiles) {
    try {
      const content = fs.readFileSync(item.fullPath, 'utf8');
      const correctHub = classifySkillDomain(item.filename, content);

      if (correctHub !== item.currentHub) {
        const targetDir = path.join(GLOBAL_SKILLS_DIR, correctHub, 'references');
        if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });

        const targetPath = path.join(targetDir, item.filename);
        fs.renameSync(item.fullPath, targetPath);
        moved++;
      }
    } catch {
      // Ignore single file error
    }
  }

  const indexes = rebuildAllHubIndexes();
  return { moved, total: allFiles.length, indexes };
}

