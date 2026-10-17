/**
 * Parser for Skill Forge
 * Handles loading and parsing skills from Markdown, Claude Code skills, Cursor rules, Codex prompts, and GitHub URLs.
 */

export function parseRawMarkdown(content) {
  const frontmatterRegex = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/;
  const match = content.match(frontmatterRegex);

  if (!match) {
    // No frontmatter found, infer from content
    return {
      metadata: {},
      body: content.trim()
    };
  }

  const rawYaml = match[1];
  const body = match[2].trim();
  const metadata = {};

  for (const line of rawYaml.split(/\r?\n/)) {
    const colonIndex = line.indexOf(':');
    if (colonIndex > 0) {
      const key = line.slice(0, colonIndex).trim();
      let value = line.slice(colonIndex + 1).trim();
      // Remove enclosing quotes if any
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      metadata[key] = value;
    }
  }

  return { metadata, body };
}

/**
 * Resolves standard GitHub web URLs to raw.githubusercontent.com URLs
 */
export function normalizeGithubUrl(url) {
  if (url.includes('github.com') && url.includes('/blob/')) {
    return url
      .replace('github.com', 'raw.githubusercontent.com')
      .replace('/blob/', '/');
  }
  return url;
}

/**
 * Fetches remote content from a URL (e.g. GitHub raw file)
 */
export async function fetchRemoteSkill(url) {
  const normalized = normalizeGithubUrl(url);
  const response = await fetch(normalized, {
    headers: { 'User-Agent': 'Antigravity-Skill-Forge' }
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch from ${normalized}: HTTP ${response.status} ${response.statusText}`);
  }

  return await response.text();
}
