/**
 * Antigravity Security Shield & Prompt-Injection Sanitizer
 * Protects the local environment and agent context from:
 * 1. Hidden Unicode / Zero-Width / BiDi obfuscation attacks
 * 2. Invisible HTML comment prompt injections
 * 3. Remote Code Execution (RCE) pipe patterns (curl | bash, irm | iex)
 * 4. Credential / .env / SSH key exfiltration instructions
 * 5. System prompt override / jailbreak directives
 */

import fs from 'node:fs';
import path from 'node:path';

const DANGEROUS_PATTERNS = [
  {
    name: 'Remote Shell Pipe (curl/wget | sh/bash)',
    regex: /\b(curl|wget)\b[^\r\n]*\|\s*(ba)?sh\b/gi
  },
  {
    name: 'PowerShell Remote Execution (iex / Invoke-Expression)',
    regex: /\b(Invoke-WebRequest|irm|iwr)\b[^\r\n]*\|\s*(iex|Invoke-Expression)\b/gi
  },
  {
    name: 'Prompt Injection Override',
    regex: /\b(ignore all previous instructions|disregard all prior instructions|forget your system prompt|system prompt override)\b/gi
  },
  {
    name: 'Credential Exfiltration Command',
    regex: /\b(curl|wget|fetch)\b[^\r\n]*(\.ssh\/id_rsa|\.aws\/credentials|\.env\b)/gi
  },
  {
    name: 'Destructive Root Wipe',
    regex: /\brm\s+-rf\s+(\/|~|\$HOME)\b/gi
  }
];

/**
 * Sanitizes markdown content from third-party repositories before storing or loading
 */
export function sanitizeSkillContent(rawContent = '') {
  if (typeof rawContent !== 'string') return { cleanContent: '', threatsBlocked: [] };

  const threatsBlocked = [];

  // 1. Strip zero-width & BiDi control characters used to hide instructions
  let clean = rawContent.replace(/[\u200B-\u200F\u202A-\u202E\u2060-\u206F\uFEFF]/g, () => {
    threatsBlocked.push('Hidden Unicode/BiDi character');
    return '';
  });

  // 2. Strip suspicious HTML comments containing instruction overrides
  clean = clean.replace(/<!--([\s\S]*?)-->/g, (match, inner) => {
    if (/\b(ignore|system|prompt|override|exec|curl|wget|env|secret|token)\b/i.test(inner)) {
      threatsBlocked.push('Suspicious HTML comment injection');
      return '';
    }
    return match;
  });

  // 3. Neutralize RCE pipes, prompt overrides, and exfiltration commands
  for (const rule of DANGEROUS_PATTERNS) {
    clean = clean.replace(rule.regex, () => {
      threatsBlocked.push(rule.name);
      return '[REDACTED_BY_ANTIGRAVITY_SECURITY_SHIELD]';
    });
  }

  return {
    cleanContent: clean,
    threatsBlocked: Array.from(new Set(threatsBlocked))
  };
}

/**
 * Audits and sanitizes all installed reference runbooks across all Super-Hubs
 */
export function auditAndSanitizeAllRunbooks(globalSkillsDir) {
  if (!fs.existsSync(globalSkillsDir)) {
    return { scannedFiles: 0, sanitizedFiles: 0, threatsFound: [] };
  }

  let scannedFiles = 0;
  let sanitizedFiles = 0;
  const threatsFound = [];

  const hubs = fs.readdirSync(globalSkillsDir, { withFileTypes: true })
    .filter(d => d.isDirectory() && d.name.startsWith('hub-'));

  for (const hub of hubs) {
    const refDir = path.join(globalSkillsDir, hub.name, 'references');
    if (!fs.existsSync(refDir)) continue;

    const files = fs.readdirSync(refDir).filter(f => f.endsWith('.md') && f !== 'INDEX.md');
    for (const file of files) {
      scannedFiles++;
      const fullPath = path.join(refDir, file);
      const raw = fs.readFileSync(fullPath, 'utf8');
      const { cleanContent, threatsBlocked } = sanitizeSkillContent(raw);

      if (threatsBlocked.length > 0 && cleanContent !== raw) {
        fs.writeFileSync(fullPath, cleanContent, 'utf8');
        sanitizedFiles++;
        threatsFound.push({
          hub: hub.name,
          file,
          threats: threatsBlocked
        });
      }
    }
  }

  return {
    scannedFiles,
    sanitizedFiles,
    threatsFound
  };
}
