/**
 * Explorer & Telemetry Engine for Antigravity Skill Forge
 * Provides real-time token budget auditing, instant search across 1,100+ runbooks,
 * safe runbook reading, and zero-token-cost hub injection.
 */

import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { SUPER_HUBS } from './monster-builder.js';
import { classifySkillDomain, rebuildAllHubIndexes } from './mass-harvester.js';
import { parseRawMarkdown, fetchRemoteSkill } from './parser.js';
import { adaptToAntigravity, sanitizeSkillName } from './adapter.js';

const HOME = os.homedir();
const GLOBAL_SKILLS_DIR = path.join(HOME, '.gemini', 'config', 'skills');
const PLUGINS_DIR = path.join(HOME, '.gemini', 'config', 'plugins');
const TOKEN_BUDGET_LIMIT = 20000;

/**
 * Calculates real-time token usage, hub distribution, and subagents status
 */
export function getSystemStats() {
  let topLevelSkillsCount = 0;
  let estimatedTokens = 0;
  const topLevelSkills = [];

  if (fs.existsSync(GLOBAL_SKILLS_DIR)) {
    const entries = fs.readdirSync(GLOBAL_SKILLS_DIR, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory()) {
        const skillMdPath = path.join(GLOBAL_SKILLS_DIR, entry.name, 'SKILL.md');
        if (fs.existsSync(skillMdPath)) {
          topLevelSkillsCount++;
          const raw = fs.readFileSync(skillMdPath, 'utf8');
          const stat = fs.statSync(skillMdPath);
          const fmMatch = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
          const fmChars = fmMatch ? fmMatch[1].length : 200;
          const tokens = Math.ceil(fmChars / 4);
          estimatedTokens += tokens;

          const descMatch = fmMatch ? fmMatch[1].match(/description:\s*>?-?\s*\r?\n?\s*([\s\S]*)/i) : null;
          const cleanDesc = descMatch ? descMatch[1].replace(/\r?\n\s*/g, ' ').trim() : '';

          topLevelSkills.push({
            name: entry.name,
            isHub: entry.name.startsWith('hub-'),
            sizeBytes: stat.size,
            tokens,
            description: cleanDesc.slice(0, 180)
          });
        }
      }
    }
  }

  // Gather Super-Hub runbook counts
  let totalRunbooks = 0;
  const hubs = [];

  for (const [hubId, hubDef] of Object.entries(SUPER_HUBS)) {
    const refDir = path.join(GLOBAL_SKILLS_DIR, hubId, 'references');
    let count = 0;
    if (fs.existsSync(refDir)) {
      count = fs.readdirSync(refDir).filter(f => f.endsWith('.md') && f !== 'INDEX.md').length;
    }
    totalRunbooks += count;
    hubs.push({
      id: hubId,
      title: hubDef.title,
      category: hubDef.category,
      description: hubDef.description,
      runbookCount: count
    });
  }

  // Gather autonomous subagents
  const subagents = [];
  const eliteAgentsDir = path.join(PLUGINS_DIR, 'antigravity-elite-agents', 'agents');
  if (fs.existsSync(eliteAgentsDir)) {
    const agentFiles = fs.readdirSync(eliteAgentsDir).filter(f => f.endsWith('.md'));
    for (const file of agentFiles) {
      const raw = fs.readFileSync(path.join(eliteAgentsDir, file), 'utf8');
      const descMatch = raw.match(/description:\s*([^\r\n]+)/i);
      subagents.push({
        id: file.replace(/\.md$/, ''),
        description: descMatch ? descMatch[1].trim() : 'Autonomous specialized subagent'
      });
    }
  }

  const budgetPercentage = Number(((estimatedTokens / TOKEN_BUDGET_LIMIT) * 100).toFixed(1));

  return {
    tokenBudget: {
      used: estimatedTokens,
      limit: TOKEN_BUDGET_LIMIT,
      percentage: budgetPercentage,
      status: budgetPercentage < 75 ? 'healthy' : budgetPercentage < 95 ? 'warning' : 'critical'
    },
    topLevelSkillsCount,
    totalRunbooks,
    hubs,
    subagents,
    topLevelSkills
  };
}

/**
 * Searches across all 1,100+ reference runbooks inside the 10 Super-Hubs
 */
export function searchRunbooks(query = '', hubFilter = '', limit = 100) {
  const q = query.trim().toLowerCase();
  const results = [];

  const targetHubs = hubFilter && Object.hasOwn(SUPER_HUBS, hubFilter)
    ? [hubFilter]
    : Object.keys(SUPER_HUBS);

  for (const hubId of targetHubs) {
    const refDir = path.join(GLOBAL_SKILLS_DIR, hubId, 'references');
    if (!fs.existsSync(refDir)) continue;

    const files = fs.readdirSync(refDir).filter(f => f.endsWith('.md') && f !== 'INDEX.md');
    for (const file of files) {
      const base = file.replace(/\.md$/, '');
      const source = base.startsWith('anthro-')
        ? 'Enterprise Suite'
        : base.startsWith('addy-')
        ? 'Web Performance'
        : base.startsWith('cursor-')
        ? 'Architecture Rules'
        : base.startsWith('pro-') || base.startsWith('jeff-') || base.startsWith('kit-')
        ? 'Production Pro'
        : base.startsWith('growth-')
        ? 'Growth & Product'
        : base.startsWith('res-')
        ? 'AI & Research'
        : 'Antigravity Core';

      const cleanTitle = base
        .replace(/^(anthro|addy|cursor|pro|growth|kit|jeff|res)-/, '')
        .split('-')
        .map(w => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');

      if (!q) {
        results.push({
          hubId,
          hubTitle: SUPER_HUBS[hubId].title,
          file,
          title: cleanTitle,
          source
        });
      } else {
        const nameMatch = base.toLowerCase().includes(q) || cleanTitle.toLowerCase().includes(q);
        if (nameMatch) {
          results.push({
            hubId,
            hubTitle: SUPER_HUBS[hubId].title,
            file,
            title: cleanTitle,
            source,
            matchType: 'title'
          });
        } else if (results.length < limit) {
          // Inspect file snippet if not matched by title
          try {
            const fullPath = path.join(refDir, file);
            const content = fs.readFileSync(fullPath, 'utf8');
            if (content.toLowerCase().includes(q)) {
              results.push({
                hubId,
                hubTitle: SUPER_HUBS[hubId].title,
                file,
                title: cleanTitle,
                source,
                matchType: 'content'
              });
            }
          } catch {
            // Skip unreadable file
          }
        }
      }

      if (results.length >= limit) break;
    }
    if (results.length >= limit) break;
  }

  return results;
}

/**
 * Safely reads a specific runbook markdown file (prevents path traversal & prototype bypass)
 */
export function getRunbookContent(hubId, filename) {
  if (!Object.hasOwn(SUPER_HUBS, hubId)) {
    throw new Error('Invalid Super-Hub ID');
  }

  const safeFile = path.basename(filename);
  if (!safeFile.endsWith('.md')) {
    throw new Error('Invalid runbook filename');
  }

  const fullPath = path.join(GLOBAL_SKILLS_DIR, hubId, 'references', safeFile);
  if (!fs.existsSync(fullPath)) {
    throw new Error('Runbook not found');
  }

  const content = fs.readFileSync(fullPath, 'utf8');
  const stat = fs.statSync(fullPath);

  return {
    hubId,
    hubTitle: SUPER_HUBS[hubId].title,
    file: safeFile,
    sizeBytes: stat.size,
    content
  };
}

/**
 * Adapts a third-party skill and injects it directly into the matching Super-Hub
 * without consuming additional global system prompt tokens.
 */
export async function injectSkillIntoHub({ content, url, name, description, targetHub }) {
  let rawContent = content || '';
  if (url) {
    rawContent = await fetchRemoteSkill(url);
  }
  if (!rawContent || !rawContent.trim()) {
    throw new Error('Skill content or valid URL is required');
  }

  const parsed = parseRawMarkdown(rawContent);
  const adapted = adaptToAntigravity(parsed, { name, description });

  const resolvedHubId = (targetHub && Object.hasOwn(SUPER_HUBS, targetHub))
    ? targetHub
    : classifySkillDomain(adapted.name, adapted.content);

  const refDir = path.join(GLOBAL_SKILLS_DIR, resolvedHubId, 'references');
  if (!fs.existsSync(refDir)) {
    fs.mkdirSync(refDir, { recursive: true });
  }

  const safeFilename = `custom-${sanitizeSkillName(adapted.name)}.md`;
  const targetPath = path.join(refDir, safeFilename);

  const cleanBody = adapted.content.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, '').trim();
  fs.writeFileSync(targetPath, cleanBody, 'utf8');

  // Rebuild hub indexes so INDEX.md and SKILL.md stay updated and under 4 KB
  rebuildAllHubIndexes();

  return {
    success: true,
    name: adapted.name,
    hubId: resolvedHubId,
    hubTitle: SUPER_HUBS[resolvedHubId].title,
    file: safeFilename,
    installedPath: targetPath
  };
}
