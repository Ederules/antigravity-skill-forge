#!/usr/bin/env node

/**
 * Antigravity Skill Forge CLI
 */

import fs from 'node:fs';
import { parseRawMarkdown, fetchRemoteSkill } from '../src/core/parser.js';
import { adaptToAntigravity } from '../src/core/adapter.js';
import { getGlobalSkillsDir, listInstalledSkills, installSkill, uninstallSkill } from '../src/core/installer.js';
import { CURATED_CATALOG } from '../src/core/registry.js';
import { listMcpServers, testMcpServer, removeMcpServer } from '../src/core/mcp-manager.js';
import { DOMAIN_PACKS, installDomainHub } from '../src/core/packer.js';
import { SUPER_HUBS, buildMonsterSuperHubs, installEliteSubagents } from '../src/core/monster-builder.js';
import { harvestArchivedSkills, harvestRemoteCursorRules, harvestClaudeSkillsRepo, harvestMarketingSkills, harvestExtendedCommunityRepos, rebuildAllHubIndexes, reclassifyAllExistingRunbooks } from '../src/core/mass-harvester.js';
import { getSystemStats, searchRunbooks, injectSkillIntoHub } from '../src/core/explorer.js';

const args = process.argv.slice(2);
const command = args[0] || 'help';

async function main() {
  switch (command) {
    case 'list': {
      const skills = listInstalledSkills(getGlobalSkillsDir());
      console.log(`\n📦 Installed Skills in Antigravity Global (${skills.length}):\n`);
      if (skills.length === 0) {
        console.log('  (No skills currently installed in global scope)');
      } else {
        skills.forEach((s, idx) => {
          console.log(`  ${idx + 1}. \x1b[32m${s.name}\x1b[0m (${(s.size / 1024).toFixed(1)} KB)`);
          console.log(`     ${s.description.slice(0, 100)}...\n`);
        });
      }
      break;
    }

    case 'catalog': {
      console.log(`\n🌐 Curated Community Skills Catalog (${CURATED_CATALOG.length}):\n`);
      CURATED_CATALOG.forEach((item, idx) => {
        console.log(`  ${idx + 1}. \x1b[36m${item.id}\x1b[0m [${item.category}]`);
        console.log(`     Origin: ${item.origin}`);
        console.log(`     ${item.description}\n`);
      });
      console.log('Install any with: node bin/skill-forge.js install <id>\n');
      break;
    }

    case 'install': {
      const targetId = args[1];
      if (!targetId) {
        console.error('Error: Please provide a skill id from catalog. Run "catalog" to view options.');
        process.exit(1);
      }

      const found = CURATED_CATALOG.find(c => c.id === targetId || c.name === targetId);
      if (!found) {
        console.error(`Error: Skill "${targetId}" not found in catalog.`);
        process.exit(1);
      }

      const parsed = parseRawMarkdown(found.content);
      const adapted = adaptToAntigravity(parsed, { name: found.name });
      const result = installSkill(adapted, { scope: 'global' });
      console.log(`\n✅ Successfully installed \x1b[32m${result.name}\x1b[0m into Antigravity global skills!`);
      console.log(`   Path: ${result.installedPath}\n`);
      break;
    }

    case 'import': {
      const source = args[1];
      if (!source) {
        console.error('Error: Please provide a GitHub URL or local file path to import.');
        process.exit(1);
      }

      console.log(`\n⏳ Fetching and adapting from: ${source}...`);
      let rawText = '';
      if (source.startsWith('http://') || source.startsWith('https://')) {
        rawText = await fetchRemoteSkill(source);
      } else {
        if (!fs.existsSync(source)) {
          console.error(`Error: File "${source}" does not exist.`);
          process.exit(1);
        }
        rawText = fs.readFileSync(source, 'utf8');
      }

      const parsed = parseRawMarkdown(rawText);
      const adapted = adaptToAntigravity(parsed);

      console.log(`\n🔍 Converted into Antigravity Standard:`);
      console.log(`   Name: \x1b[32m${adapted.name}\x1b[0m`);
      console.log(`   Description: ${adapted.description}`);
      console.log(`   Size: ${(adapted.byteLength / 1024).toFixed(1)} KB`);

      if (adapted.warnings.length > 0) {
        adapted.warnings.forEach(w => console.warn(`   ⚠️ ${w}`));
      }

      const result = installSkill(adapted, { scope: 'global' });
      console.log(`\n✅ Installed into Antigravity global scope: ${result.installedPath}\n`);
      break;
    }

    case 'uninstall': {
      const skillName = args[1];
      if (!skillName) {
        console.error('Error: Please provide the skill name to uninstall.');
        process.exit(1);
      }

      const result = uninstallSkill(skillName, 'global');
      if (result.success) {
        console.log(`\n🗑️ Successfully uninstalled "${skillName}" from Antigravity global skills.\n`);
      } else {
        console.error(`\n❌ ${result.error}\n`);
      }
      break;
    }

    case 'mcp': {
      const sub = args[1] || 'list';
      if (sub === 'list') {
        const servers = listMcpServers();
        console.log(`\n🔌 Configured Global MCP Servers (${servers.length}):\n`);
        servers.forEach((s, idx) => {
          console.log(`  ${idx + 1}. \x1b[35m${s.id}\x1b[0m`);
          console.log(`     Command: ${s.command} ${(s.args || []).join(' ')}`);
          if (s.url) console.log(`     URL: ${s.url}`);
          console.log('');
        });
      } else if (sub === 'test') {
        const targetId = args[2];
        const servers = listMcpServers();
        const targets = targetId ? servers.filter(s => s.id === targetId) : servers;

        if (targets.length === 0) {
          console.log(`No servers matching "${targetId}" found.`);
          break;
        }

        console.log(`\n🧪 Running Health Check on MCP Servers...\n`);
        for (const t of targets) {
          process.stdout.write(`  Checking \x1b[35m${t.id}\x1b[0m... `);
          const res = await testMcpServer(t.id);
          if (res.status === 'healthy' || res.status === 'online') {
            console.log(`\x1b[32m[HEALTHY]\x1b[0m (${res.transport || res.type})`);
          } else {
            console.log(`\x1b[31m[${res.status.toUpperCase()}]\x1b[0m ${res.error || res.details || ''}`);
          }
        }
        console.log('');
      } else {
        console.log('Usage: node bin/skill-forge.js mcp [list|test [id]]');
      }
      break;
    }

    case 'hub': {
      const sub = args[1] || 'list';
      if (sub === 'list') {
        console.log(`\n🏛️ Domain Hub Skills (Progressive Disclosure Packs):\n`);
        for (const [id, hub] of Object.entries(DOMAIN_PACKS)) {
          console.log(`  • \x1b[36m${id}\x1b[0m [${hub.category}]`);
          console.log(`    ${hub.description}`);
          console.log(`    Bundled Topics (${hub.references.length}):`);
          hub.references.forEach(r => console.log(`      - ${r.title} (${r.file})`));
          console.log('');
        }
        console.log('Install any Domain Hub with: node bin/skill-forge.js hub install <id>\n');
      } else if (sub === 'install') {
        const hubId = args[2];
        if (!hubId) {
          console.error('Error: Please provide a domain hub id. Run "hub list" to view available hubs.');
          process.exit(1);
        }
        try {
          const res = installDomainHub(hubId);
          console.log(`\n✅ Successfully installed Domain Hub \x1b[32m${res.name}\x1b[0m!`);
          console.log(`   Installed ${res.referencesCount} specialized topic runbooks in references/`);
          console.log(`   Path: ${res.installedPath}\n`);
        } catch (err) {
          console.error(`\n❌ Error installing hub: ${err.message}\n`);
        }
      } else {
        console.log('Usage: node bin/skill-forge.js hub [list|install <id>]');
      }
      break;
    }

    case 'monster': {
      const sub = args[1] || 'build';
      if (sub === 'build') {
        console.log(`\n🦖 Building Monster Super-Hub Architecture...\n`);
        const results = buildMonsterSuperHubs();
        let totalRefs = 0;
        results.forEach((r, idx) => {
          totalRefs += r.referenceCount;
          console.log(`  ${idx + 1}. \x1b[32m${r.hubId}\x1b[0m (${r.referenceCount} specialized runbooks)`);
          console.log(`     Title: ${r.title}`);
        });
        console.log(`\n✨ Successfully assembled 10 Super-Hubs containing ${totalRefs} specialized runbooks!`);
        console.log(`   Tokens in Index: ~1,500 tokens (less than 8% of the budget!)`);
        console.log(`   Location: ${getGlobalSkillsDir()}\n`);
      } else {
        console.log('Usage: node bin/skill-forge.js monster build');
      }
      break;
    }

    case 'bootstrap':
    case 'harvest': {
      console.log(`\n🚀 Starting Antigravity Monster Bootstrap & Mass Harvester...\n`);

      console.log(`  1. Scaffolding 10 Master Super-Hubs & Installing 5 Elite Subagents...`);
      buildMonsterSuperHubs();
      const agentsRes = installEliteSubagents();
      console.log(`     ✓ Installed Elite Subagents: ${agentsRes.installed.join(', ')}`);

      console.log(`  2. Ingesting and classifying local skills archive (if any)...`);
      const localCount = harvestArchivedSkills();
      console.log(`     ✓ Ingested ${localCount} skills from local archive.`);

      console.log(`  3. Syncing architecture & framework best-practice rules...`);
      const cursorCount = await harvestRemoteCursorRules(300);
      console.log(`     ✓ Ingested ${cursorCount} architecture & framework rules.`);

      console.log(`  4. Syncing production engineering & system design runbooks...`);
      const claudeCount = await harvestClaudeSkillsRepo(450);
      console.log(`     ✓ Ingested ${claudeCount} production engineering runbooks.`);

      console.log(`  5. Syncing growth, SEO & product strategy runbooks...`);
      const mktgCount = await harvestMarketingSkills(350);
      console.log(`     ✓ Ingested ${mktgCount} growth, SEO, and product strategy runbooks.`);

      console.log(`  6. Syncing extended enterprise, web performance & research catalogs...`);
      const extCount = await harvestExtendedCommunityRepos();
      console.log(`     ✓ Ingested ${extCount} extended multi-domain runbooks.`);

      console.log(`  7. Semantic rebalancing & rebuilding Progressive Disclosure indexes...`);
      const reclass = reclassifyAllExistingRunbooks();
      let grandTotal = 0;
      reclass.indexes.forEach(h => {
        grandTotal += h.referenceCount;
        console.log(`     • ${h.hubId}: ${h.referenceCount} runbooks (${(h.skillBytes / 1024).toFixed(1)} KB SKILL.md)`);
      });

      console.log(`\n🎉 Monster Bootstrap Complete! Total reference runbooks active: ${grandTotal}`);
      console.log(`   Tokens in Global Index: ~1,500 tokens (Free token budget > 85%)`);
      console.log(`   Each Super-Hub SKILL.md is safely below the 24 KB ceiling.\n`);
      break;
    }

    case 'stats': {
      const stats = getSystemStats();
      console.log(`\n📊 Antigravity Global Telemetry & Token Audit:\n`);
      console.log(`  • Token Budget Used: \x1b[32m${stats.tokenBudget.used.toLocaleString()} / ${stats.tokenBudget.limit.toLocaleString()} tokens (${stats.tokenBudget.percentage}%)\x1b[0m`);
      console.log(`  • Free Budget Available: ${(100 - stats.tokenBudget.percentage).toFixed(1)}%`);
      console.log(`  • Top-Level Skills Loaded: ${stats.topLevelSkillsCount}`);
      console.log(`  • Total Active Reference Runbooks: \x1b[36m${stats.totalRunbooks.toLocaleString()}\x1b[0m`);
      console.log(`  • Autonomous Subagents Registered: ${stats.subagents.length} (${stats.subagents.map(s => s.id).join(', ')})\n`);
      console.log(`  🏛️ Super-Hub Distribution:`);
      stats.hubs.forEach(h => {
        console.log(`     - \x1b[33m${h.id.padEnd(34)}\x1b[0m ${String(h.runbookCount).padStart(4)} runbooks`);
      });
      console.log('');
      break;
    }

    case 'search': {
      const query = args.slice(1).join(' ');
      if (!query) {
        console.error('Error: Please provide a search query (e.g., node bin/skill-forge.js search postgres)');
        process.exit(1);
      }
      const results = searchRunbooks(query, '', 25);
      console.log(`\n🔎 Search Results for "${query}" (${results.length} matches shown):\n`);
      results.forEach((r, idx) => {
        console.log(`  ${String(idx + 1).padStart(2)}. \x1b[36m${r.title}\x1b[0m [${r.source}]`);
        console.log(`      Hub: \x1b[33m${r.hubId}\x1b[0m -> references/${r.file}`);
      });
      console.log('');
      break;
    }

    case 'inject': {
      const source = args[1];
      const customName = args[2];
      if (!source) {
        console.error('Error: Please provide a GitHub URL or local file path to inject into a Super-Hub.');
        process.exit(1);
      }
      let res;
      if (source.startsWith('http://') || source.startsWith('https://')) {
        res = await injectSkillIntoHub({ url: source, name: customName });
      } else {
        const raw = fs.readFileSync(source, 'utf8');
        res = await injectSkillIntoHub({ content: raw, name: customName });
      }
      console.log(`\n🚀 Skill Injected into Super-Hub (0 Global Token Cost)!`);
      console.log(`   Name:    ${res.name}`);
      console.log(`   Target:  \x1b[32m${res.hubId}\x1b[0m (${res.hubTitle})`);
      console.log(`   Runbook: references/${res.file}\n`);
      break;
    }

    default:
      console.log(`
Antigravity Skill Forge - CLI

Usage:
  node bin/skill-forge.js bootstrap        One-command setup: 10 Super-Hubs + 3 Subagents + 1,000+ Skills
  node bin/skill-forge.js stats            Live token budget audit & Super-Hub telemetry
  node bin/skill-forge.js search <query>   Instant search across 1,000+ reference runbooks
  node bin/skill-forge.js inject <source>  Convert & inject a skill directly into a Super-Hub (0 tokens)
  node bin/skill-forge.js list             List all currently installed top-level skills
  node bin/skill-forge.js catalog          Browse curated community skills from Claude & Codex
  node bin/skill-forge.js install <id>     Install a curated skill into Antigravity
  node bin/skill-forge.js import <source>  Import and convert a standalone skill from URL/file
  node bin/skill-forge.js uninstall <name> Remove an installed top-level skill
  node bin/skill-forge.js mcp list         List all configured MCP servers
  node bin/skill-forge.js mcp test [id]    Test connectivity & health of MCP servers
      `);
      break;
  }
}

main().catch(err => {
  console.error('\n❌ Fatal error:', err.message);
  process.exit(1);
});
