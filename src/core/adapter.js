/**
 * Adapter for Antigravity Skills
 * Converts parsed foreign skills (Claude Code, OpenAI Codex, Cursor rules, ChatGPT prompts)
 * into strict, high-performance Antigravity agentic format.
 */

import { sanitizeSkillContent } from './security-sanitizer.js';

export function sanitizeSkillName(rawName) {
  if (!rawName) return 'custom-skill';
  return rawName
    .toLowerCase()
    .replace(/[_]/g, '-')
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Extracts key technologies and intents from raw text
 */
function extractImplicitTriggers(text) {
  const techRegexes = [
    /\b(react|vue|angular|svelte|next\.?js|tailwind|css|html|flutter|swift|kotlin)\b/gi,
    /\b(fastapi|express|nestjs|django|flask|spring|graphql|grpc|rest api|websocket)\b/gi,
    /\b(postgres|postgresql|sqlite|mysql|mongodb|redis|prisma|dbt|bigquery|sql)\b/gi,
    /\b(docker|kubernetes|k8s|terraform|ansible|ci\/cd|github actions|aws|gcp|azure)\b/gi,
    /\b(playwright|cypress|jest|vitest|tdd|unit test|integration test|e2e)\b/gi,
    /\b(security|owasp|pentest|audit|compliance|vulnerability|smart contract)\b/gi,
    /\b(llm|gpt|openai|gemini|claude|rag|vector|langchain|agentic)\b/gi,
    /\b(refactor|clean code|solid|architecture|performance|optimization)\b/gi,
    /\b(seo|copywriting|marketing|growth|conversion|analytics)\b/gi
  ];

  const found = new Set();
  for (const rx of techRegexes) {
    const matches = text.match(rx);
    if (matches) {
      matches.forEach(m => found.add(m.toLowerCase()));
    }
  }

  return Array.from(found);
}

/**
 * Transforms implicit or conversational descriptions into active, third-person trigger descriptions
 */
export function synthesizeDescription(name, body, existingDesc) {
  let desc = (existingDesc || '').trim();

  // If no existing description, extract from first meaningful lines of the body
  if (!desc || desc.length < 15) {
    const lines = body.split(/\r?\n/).filter(l => l.trim() && !l.startsWith('#') && !l.startsWith('---'));
    if (lines.length > 0) {
      desc = lines.slice(0, 2).join(' ').slice(0, 250).replace(/[^\w\s.,-]/g, '').trim();
    }
  }

  // Transform first/second person conversational phrasing into third-person agentic capabilities
  desc = desc
    .replace(/^(you are|you're|act as|serve as)\s+(an?|the)?\s*/i, 'Provides capabilities as an ')
    .replace(/^(i am|i will|this skill will)\s+/i, 'Provides procedures to ')
    .replace(/^(this rule|this prompt|this file)\s+(helps|defines|contains|is for)\s*/i, 'Defines guidelines to ')
    .replace(/^(always|never|make sure to)\s+/i, 'Directives to ');

  // If missing an explicit "Use when" clause, synthesize one from detected technologies
  if (!desc.toLowerCase().includes('use when') && !desc.toLowerCase().includes('triggers on')) {
    const triggers = extractImplicitTriggers(desc + ' ' + body);
    const readableName = name.replace(/-/g, ' ');
    if (triggers.length > 0) {
      const topTriggers = triggers.slice(0, 5).join(', ');
      desc = `${desc.replace(/\.+$/, '')}. Use when developing, reviewing, or debugging with ${topTriggers}, or handling ${readableName} tasks.`;
    } else {
      desc = `${desc.replace(/\.+$/, '')}. Use when executing ${readableName} procedures and related engineering workflows.`;
    }
  }

  return desc;
}

/**
 * Transforms any input content into a compliant Antigravity SKILL.md
 */
export function adaptToAntigravity(parsed, options = {}) {
  const rawName = options.name || parsed.metadata?.name || parsed.metadata?.title || 'agent-skill';
  const name = sanitizeSkillName(rawName);
  const description = synthesizeDescription(name, parsed.body || '', options.description || parsed.metadata?.description);

  const { cleanContent, threatsBlocked } = sanitizeSkillContent(parsed.body || '');

  // Normalize body: convert platform-specific jargon and chat instructions into agentic execution
  let normalizedBody = cleanContent
    // File references
    .replace(/\bCLAUDE\.md\b/g, 'AGENTS.md')
    .replace(/\.cursorrules\b/gi, 'AGENTS.md')
    .replace(/\.windsurfrules\b/gi, 'AGENTS.md')
    // Brand names to Antigravity
    .replace(/\bClaude Code\b/gi, 'Antigravity')
    .replace(/\bCursor IDE\b/gi, 'Antigravity')
    .replace(/\bClaude\b/g, 'Antigravity')
    .replace(/\bAnthropic\b/g, 'Google DeepMind')
    // Passive chat advice to autonomous execution
    .replace(/ask the user to provide/gi, 'inspect the workspace files or ask the user for')
    .replace(/print the output to the console/gi, 'output actionable feedback or write to target files');

  // Ensure top-level title exists
  if (!normalizedBody.startsWith('#')) {
    const readableTitle = name.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
    normalizedBody = `# ${readableTitle}\n\n` + normalizedBody;
  }

  // Size limit check
  const fullContent = `---
name: ${name}
description: >-
  ${description}
---

${normalizedBody}
`;

  const byteLength = Buffer.byteLength(fullContent, 'utf8');
  const isOverSize = byteLength > 24000;

  return {
    name,
    description,
    content: fullContent,
    byteLength,
    isOverSize,
    warnings: isOverSize ? [`Byte size (${byteLength}) exceeds 24,000 bytes. Splitting into references is recommended.`] : []
  };
}
