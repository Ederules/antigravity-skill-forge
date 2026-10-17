/**
 * MCP Manager for Antigravity
 * Reads, validates, modifies, and tests global MCP server configurations.
 */

import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { spawn } from 'node:child_process';

export function getMcpConfigPath() {
  const home = os.homedir();
  return path.join(home, '.gemini', 'config', 'mcp_config.json');
}

export function readMcpConfig() {
  const configPath = getMcpConfigPath();
  if (!fs.existsSync(configPath)) {
    return { mcpServers: {} };
  }
  try {
    const raw = fs.readFileSync(configPath, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    return { mcpServers: {}, error: err.message };
  }
}

export function writeMcpConfig(config) {
  const configPath = getMcpConfigPath();
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');
  return { success: true, path: configPath };
}

export function listMcpServers() {
  const config = readMcpConfig();
  const servers = [];
  const entries = config.mcpServers || {};

  for (const [id, details] of Object.entries(entries)) {
    servers.push({
      id,
      command: details.command || '(none)',
      args: details.args || [],
      url: details.url || details.serverUrl || null,
      env: details.env || {}
    });
  }

  return servers;
}

export function addMcpServer(id, serverConfig) {
  const config = readMcpConfig();
  if (!config.mcpServers) config.mcpServers = {};

  config.mcpServers[id] = serverConfig;
  writeMcpConfig(config);

  return { success: true, id, config: serverConfig };
}

export function removeMcpServer(id) {
  const config = readMcpConfig();
  if (!config.mcpServers || !config.mcpServers[id]) {
    return { success: false, error: `MCP server "${id}" does not exist.` };
  }

  delete config.mcpServers[id];
  writeMcpConfig(config);

  return { success: true, id };
}

/**
 * Diagnostic test: launches the process for 2 seconds to check if it spawns cleanly
 */
export async function testMcpServer(id) {
  const config = readMcpConfig();
  const server = config.mcpServers?.[id];

  if (!server) {
    return { id, status: 'error', message: 'Server not configured' };
  }

  if (server.url || server.serverUrl) {
    // HTTP transport test
    try {
      const url = server.url || server.serverUrl;
      const res = await fetch(url, { method: 'HEAD', signal: AbortSignal.timeout(3000) });
      return { id, status: 'online', type: 'http', statusCode: res.status };
    } catch (err) {
      return { id, status: 'unreachable', type: 'http', error: err.message };
    }
  }

  return new Promise((resolve) => {
    let output = '';
    let hasError = false;

    try {
      const child = spawn(server.command, server.args || [], {
        env: { ...process.env, ...(server.env || {}) },
        stdio: ['pipe', 'pipe', 'pipe']
      });

      child.on('error', (err) => {
        hasError = true;
        resolve({ id, status: 'failed', error: err.message });
      });

      child.stdout.on('data', (d) => { output += d.toString(); });
      child.stderr.on('data', (d) => { output += d.toString(); });

      // After 1.5 seconds, if child hasn't crashed with ENOENT, it's a running stdio server!
      const timer = setTimeout(() => {
        if (!hasError) {
          child.kill();
          resolve({ id, status: 'healthy', transport: 'stdio' });
        }
      }, 1500);

      child.on('exit', (code) => {
        clearTimeout(timer);
        if (code !== 0 && code !== null) {
          resolve({ id, status: 'exited', code, details: output.slice(0, 200) });
        }
      });
    } catch (err) {
      resolve({ id, status: 'exception', error: err.message });
    }
  });
}
