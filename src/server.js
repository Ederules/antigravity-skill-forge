import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseRawMarkdown, fetchRemoteSkill } from './core/parser.js';
import { adaptToAntigravity } from './core/adapter.js';
import { getGlobalSkillsDir, listInstalledSkills, installSkill, uninstallSkill } from './core/installer.js';
import { CURATED_CATALOG } from './core/registry.js';
import { listMcpServers, addMcpServer, removeMcpServer, testMcpServer } from './core/mcp-manager.js';
import { getSystemStats, searchRunbooks, getRunbookContent, injectSkillIntoHub } from './core/explorer.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = process.env.PORT || 4040;

const ALLOWED_ORIGINS = new Set([`http://localhost:${PORT}`, `http://127.0.0.1:${PORT}`]);
const MAX_PAYLOAD_BYTES = 1 * 1024 * 1024; // 1 MB strict cap

class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

function sendJson(res, status, payload) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(payload));
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    let byteCount = 0;
    req.on('data', chunk => {
      byteCount += chunk.length;
      if (byteCount > MAX_PAYLOAD_BYTES) {
        req.destroy();
        reject(new HttpError(413, 'Payload too large'));
        return;
      }
      data += chunk.toString('utf8');
    });
    req.on('end', () => {
      try {
        resolve(data ? JSON.parse(data) : {});
      } catch {
        reject(new HttpError(400, 'Invalid JSON payload'));
      }
    });
    req.on('error', reject);
  });
}

// Declarative O(1) Route Dispatch Table
const ROUTES = {
  'GET /api/stats': async () => getSystemStats(),

  'GET /api/status': async () => {
    const globalSkills = listInstalledSkills(getGlobalSkillsDir());
    const stats = getSystemStats();
    return {
      status: 'online',
      installedCount: globalSkills.length,
      installed: globalSkills,
      catalog: CURATED_CATALOG,
      stats
    };
  },

  'GET /api/runbooks': async ({ parsedUrl }) => {
    const q = parsedUrl.searchParams.get('q') || '';
    const hub = parsedUrl.searchParams.get('hub') || '';
    const limit = Math.min(Number(parsedUrl.searchParams.get('limit')) || 120, 500);
    const results = searchRunbooks(q, hub, limit);
    return { count: results.length, results };
  },

  'GET /api/runbook': async ({ parsedUrl }) => {
    const hub = parsedUrl.searchParams.get('hub') || '';
    const file = parsedUrl.searchParams.get('file') || '';
    if (!hub || !file) {
      throw new HttpError(400, 'Both hub and file query parameters are required');
    }
    try {
      return getRunbookContent(hub, file);
    } catch (err) {
      throw new HttpError(err.message === 'Runbook not found' ? 404 : 400, err.message);
    }
  },

  'POST /api/convert': async ({ req }) => {
    const body = await readJsonBody(req);
    let rawContent = body.content || '';
    if (body.url) {
      rawContent = await fetchRemoteSkill(body.url);
    }
    const parsed = parseRawMarkdown(rawContent);
    return adaptToAntigravity(parsed, {
      name: body.name,
      description: body.description
    });
  },

  'POST /api/inject-hub': async ({ req }) => {
    const body = await readJsonBody(req);
    return await injectSkillIntoHub({
      content: body.content,
      url: body.url,
      name: body.name,
      description: body.description,
      targetHub: body.targetHub
    });
  },

  'POST /api/install': async ({ req }) => {
    const body = await readJsonBody(req);
    let adapted;

    if (body.catalogId) {
      const found = CURATED_CATALOG.find(c => c.id === body.catalogId);
      if (!found) throw new HttpError(404, 'Catalog skill not found');
      const parsed = parseRawMarkdown(found.content);
      adapted = adaptToAntigravity(parsed, { name: found.name });
    } else if (body.content) {
      const parsed = parseRawMarkdown(body.content);
      adapted = adaptToAntigravity(parsed, { name: body.name, description: body.description });
    } else {
      throw new HttpError(400, 'Either catalogId or content is required');
    }

    return installSkill(adapted, { scope: body.scope || 'global' });
  },

  'POST /api/uninstall': async ({ req }) => {
    const body = await readJsonBody(req);
    if (!body.name) throw new HttpError(400, 'Skill name is required');
    return uninstallSkill(body.name, body.scope || 'global');
  },

  'GET /api/mcp': async () => ({ servers: listMcpServers() }),

  'POST /api/mcp/add': async ({ req }) => {
    const body = await readJsonBody(req);
    if (!body.id || !body.command) {
      throw new HttpError(400, 'Server ID and command are required');
    }
    return addMcpServer(body.id, {
      command: body.command,
      args: body.args || [],
      env: body.env || {}
    });
  },

  'POST /api/mcp/remove': async ({ req }) => {
    const body = await readJsonBody(req);
    if (!body.id) throw new HttpError(400, 'Server ID is required');
    return removeMcpServer(body.id);
  },

  'POST /api/mcp/test': async ({ req }) => {
    const body = await readJsonBody(req);
    if (!body.id) throw new HttpError(400, 'Server ID is required');
    return await testMcpServer(body.id);
  }
};

const server = http.createServer(async (req, res) => {
  const origin = req.headers.origin;
  if (origin && ALLOWED_ORIGINS.has(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self';"
  );

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = parsedUrl.pathname;

  if (req.method === 'GET' && (pathname === '/' || pathname === '/index.html')) {
    const htmlPath = path.join(__dirname, 'public', 'index.html');
    if (fs.existsSync(htmlPath)) {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(fs.readFileSync(htmlPath));
      return;
    }
  }

  const routeKey = `${req.method} ${pathname}`;
  const handler = Object.hasOwn(ROUTES, routeKey) ? ROUTES[routeKey] : null;

  if (!handler) {
    sendJson(res, 404, { error: 'Route not found' });
    return;
  }

  try {
    const payload = await handler({ req, res, parsedUrl });
    sendJson(res, 200, payload);
  } catch (error) {
    const status = error instanceof HttpError ? error.status : 500;
    sendJson(res, status, { error: error.message });
  }
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`\n🚀 Antigravity Skill Forge Dashboard running on: http://localhost:${PORT}\n`);
});
